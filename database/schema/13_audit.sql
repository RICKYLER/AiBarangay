-- =============================================================
-- 13 · Audit logs — full accountability trail for a government system
-- e.g. BARANGAY_ADMIN changed incident status UNDER_REVIEW → VERIFIED
-- =============================================================

CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,          -- e.g. 'incident.status_changed'
    entity_type VARCHAR(60) NOT NULL,           -- 'incidents', 'reports', 'users' …
    entity_id   UUID,
    old_values  JSONB,
    new_values  JSONB,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_logs_user   ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
