-- =============================================================
-- update_updated_at() — attached to every table with updated_at
-- Called by trigger, never manually.
-- =============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
