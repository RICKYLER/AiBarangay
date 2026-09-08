-- =============================================================
-- generate_report_number() — RPT-YYYY-NNNNNN
-- Assigned automatically on INSERT via trigger (triggers/02_numbering.sql)
--
-- SECURITY DEFINER + advisory lock:
--   * DEFINER  — the MAX(...) scan must see ALL reports. Under the
--                reporting resident's RLS context it would only see
--                their own rows and mint a number that collides with
--                another resident's existing report.
--   * xact lock — serializes concurrent submissions so MAX+1 cannot
--                race itself into a duplicate-key error.
-- =============================================================

CREATE OR REPLACE FUNCTION generate_report_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    next_seq BIGINT;
BEGIN
    IF NEW.report_number IS NULL OR NEW.report_number = '' THEN
        PERFORM pg_advisory_xact_lock(90210, 1);
        SELECT COALESCE(MAX(
                   (split_part(report_number, '-', 3))::BIGINT
               ), 0) + 1
          INTO next_seq
          FROM reports
         WHERE report_number LIKE 'RPT-' || to_char(now(), 'YYYY') || '-%';

        NEW.report_number := 'RPT-' || to_char(now(), 'YYYY') || '-' ||
                             lpad(next_seq::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$;
