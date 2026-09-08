-- =============================================================
-- Seed 06 · Chat — DESK_OFFICER role + desks
-- Idempotent: safe to re-run.
-- =============================================================

INSERT INTO roles (name, description) VALUES
    ('DESK_OFFICER', 'Chat-only account — answers resident messages for one barangay desk')
ON CONFLICT (name) DO NOTHING;

INSERT INTO chat_desks (name, description) VALUES
    ('Barangay Duty Desk',   'General inquiries, report follow-ups, and requests'),
    ('Barangay Health Office', 'Health programs, medical concerns, and clean-up drives')
ON CONFLICT (name) DO NOTHING;
