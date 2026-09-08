-- =============================================================
-- 12 · Notifications
-- Resident journey: received → under review → verified →
-- assigned → field response → resolved
-- =============================================================

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    type        notification_type NOT NULL,
    title       VARCHAR(200) NOT NULL,
    message     TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE NOT is_read;
CREATE INDEX idx_notifications_incident    ON notifications(incident_id);
