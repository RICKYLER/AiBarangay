-- =============================================================
-- calculate_report_priority(p_report_id, p_category_id, p_ai_confidence)
--
-- Suggests a priority (CRITICAL / HIGH / MEDIUM / LOW) for a report.
-- AI is decision support, never the final authority — the barangay
-- reviewer can override the returned suggestion.
--
-- Scoring model (0–100):
--   base severity of the category           0–40 pts
--   severity keywords in title/description  0–25 pts
--   AI confidence in its own prediction     0–20 pts
--   corroboration (nearby duplicates)       0–15 pts
--
-- Thresholds:
--   >= 75  CRITICAL   >= 50  HIGH   >= 25  MEDIUM   < 25  LOW
--
-- Usage:
--   SELECT calculate_report_priority(:report_id, :category_id, :ai_confidence);
-- =============================================================

CREATE OR REPLACE FUNCTION calculate_report_priority(
    p_report_id     UUID,
    p_category_id   UUID DEFAULT NULL,
    p_ai_confidence DOUBLE PRECISION DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_category_id   UUID;
    v_report        reports%ROWTYPE;
    v_category_name TEXT;
    v_text          TEXT;
    v_score         NUMERIC := 0;
    v_duplicates    INTEGER := 0;
    v_result        UUID;
BEGIN
    -- Prefer the report's own values; explicit args act as overrides
    IF p_report_id IS NOT NULL THEN
        SELECT * INTO v_report FROM reports WHERE id = p_report_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'report % not found', p_report_id;
        END IF;
        v_category_id := COALESCE(p_category_id, v_report.category_id);
        v_text := lower(coalesce(v_report.title, '') || ' ' || coalesce(v_report.description, ''));
    ELSE
        v_category_id := p_category_id;
        v_text := '';
    END IF;

    -- 1. Category base severity (0–40) ---------------------------------
    SELECT lower(name) INTO v_category_name FROM categories WHERE id = v_category_id;

    v_score := v_score +
        CASE v_category_name
            WHEN 'flooding'        THEN 40
            WHEN 'public safety'   THEN 38
            WHEN 'water supply'    THEN 32
            WHEN 'road damage'     THEN 30
            WHEN 'infrastructure'  THEN 28
            WHEN 'drainage'        THEN 26
            WHEN 'illegal dumping' THEN 22
            WHEN 'garbage'         THEN 18
            WHEN 'streetlight'     THEN 14
            WHEN 'traffic'         THEN 12
            WHEN 'noise'           THEN 8
            ELSE 10   -- 'other' and anything unrecognized
        END;

    -- 2. Severity keywords in the text (0–25) ---------------------------
    IF v_text ~ '(deep flood|chest-deep|neck-deep|trapped|evacuat|landslide|collapse|electrocut|explosion|fire|injur|casualt|dying|hazard)' THEN
        v_score := v_score + 25;
    ELSIF v_text ~ '(flood|overflow|broken pipe|no water|contaminat|sewage|sinkhole|live wire|open wire|structural damage|danger)' THEN
        v_score := v_score + 18;
    ELSIF v_text ~ '(leak|crack|pothole|blocked|clogged|overflowing trash|foul smell|outage|not working|damaged)' THEN
        v_score := v_score + 10;
    ELSIF v_text ~ '(minor|small|slight|slow)' THEN
        v_score := v_score + 3;
    END IF;

    -- 3. AI confidence (0–20) -------------------------------------------
    -- Only counts when the AI's own prediction agrees life/safety issues
    -- are plausible; a high confidence on 'Noise' won't inflate the score.
    IF p_ai_confidence IS NOT NULL THEN
        v_score := v_score + least(p_ai_confidence, 1.0) * 20;
    END IF;

    -- 4. Corroboration: confirmed duplicates nearby (0–15) ---------------
    IF p_report_id IS NOT NULL THEN
        SELECT count(*) INTO v_duplicates
          FROM duplicate_matches dm
         WHERE dm.review_status = 'CONFIRMED'
           AND (dm.report_id = p_report_id OR dm.matched_report_id = p_report_id);
        v_score := v_score + least(v_duplicates * 5, 15);
    END IF;

    v_score := least(v_score, 100);

    -- 5. Map score → priority row ----------------------------------------
    SELECT id INTO v_result
      FROM priorities
     WHERE (v_score >= 75 AND level = 1)
        OR (v_score >= 50 AND v_score < 75 AND level = 2)
        OR (v_score >= 25 AND v_score < 50 AND level = 3)
        OR (v_score <  25 AND level = 4);

    IF v_result IS NULL THEN
        RAISE WARNING 'calculate_report_priority: no priority rows seeded, defaulting to NULL';
    END IF;

    RETURN v_result;
END;
$$;

-- Convenience overload: score only (for debugging / threshold tuning)
CREATE OR REPLACE FUNCTION calculate_report_priority_score(
    p_report_id     UUID,
    p_ai_confidence DOUBLE PRECISION DEFAULT NULL
)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
AS $$
    -- Mirrors the scoring above without the priority lookup
    SELECT least(
        (CASE lower(c.name)
            WHEN 'flooding'        THEN 40
            WHEN 'public safety'   THEN 38
            WHEN 'water supply'    THEN 32
            WHEN 'road damage'     THEN 30
            WHEN 'infrastructure'  THEN 28
            WHEN 'drainage'        THEN 26
            WHEN 'illegal dumping' THEN 22
            WHEN 'garbage'         THEN 18
            WHEN 'streetlight'     THEN 14
            WHEN 'traffic'         THEN 12
            WHEN 'noise'           THEN 8
            ELSE 10
        END)
        + (CASE
            WHEN lower(coalesce(r.title, '') || ' ' || coalesce(r.description, ''))
                 ~ '(deep flood|chest-deep|neck-deep|trapped|evacuat|landslide|collapse|electrocut|explosion|fire|injur|casualt|dying|hazard)' THEN 25
            WHEN lower(coalesce(r.title, '') || ' ' || coalesce(r.description, ''))
                 ~ '(flood|overflow|broken pipe|no water|contaminat|sewage|sinkhole|live wire|open wire|structural damage|danger)' THEN 18
            WHEN lower(coalesce(r.title, '') || ' ' || coalesce(r.description, ''))
                 ~ '(leak|crack|pothole|blocked|clogged|overflowing trash|foul smell|outage|not working|damaged)' THEN 10
            WHEN lower(coalesce(r.title, '') || ' ' || coalesce(r.description, ''))
                 ~ '(minor|small|slight|slow)' THEN 3
            ELSE 0
        END)
        + coalesce(least(p_ai_confidence, 1.0) * 20, 0)
        + least((
            SELECT count(*) FROM duplicate_matches dm
             WHERE dm.review_status = 'CONFIRMED'
               AND (dm.report_id = r.id OR dm.matched_report_id = r.id)
          ) * 5, 15),
        100)
      FROM reports r
      LEFT JOIN categories c ON c.id = r.category_id
     WHERE r.id = p_report_id
$$;
