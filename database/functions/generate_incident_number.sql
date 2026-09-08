-- =============================================================
-- generate_incident_number() — INC-YYYY-NNNNNN
-- Assigned automatically on INSERT via trigger (triggers/02_numbering.sql)
--
-- SECURITY DEFINER + advisory lock — same rationale as
-- generate_report_number(): the MAX(...) scan runs as the owner so
-- RLS cannot hide other barangays' incidents, and the xact lock
-- serializes concurrent verifications.
-- =============================================================

CREATE OR REPLACE FUNCTION generate_incident_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    next_seq BIGINT;
BEGIN
    IF NEW.incident_number IS NULL OR NEW.incident_number = '' THEN
        PERFORM pg_advisory_xact_lock(90210, 2);
        SELECT COALESCE(MAX(
                   (split_part(incident_number, '-', 3))::BIGINT
               ), 0) + 1
          INTO next_seq
          FROM incidents
         WHERE incident_number LIKE 'INC-' || to_char(now(), 'YYYY') || '-%';

        NEW.incident_number := 'INC-' || to_char(now(), 'YYYY') || '-' ||
                               lpad(next_seq::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$;
