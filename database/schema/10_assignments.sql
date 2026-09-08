-- =============================================================
-- 10 · Assignments & task management
-- =============================================================

CREATE TABLE assignments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id  UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    office_id    UUID REFERENCES offices(id) ON DELETE SET NULL,
    assigned_to  UUID REFERENCES users(id) ON DELETE SET NULL,   -- field personnel
    assigned_by  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    priority_id  UUID REFERENCES priorities(id) ON DELETE SET NULL,
    instructions TEXT,
    assigned_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted_at  TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status       assignment_status NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id    UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    assignment_id  UUID REFERENCES assignments(id) ON DELETE SET NULL,
    assigned_to    UUID REFERENCES users(id) ON DELETE SET NULL,
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    status         task_status NOT NULL DEFAULT 'PENDING',
    priority       UUID REFERENCES priorities(id) ON DELETE SET NULL,
    due_at         TIMESTAMPTZ,
    started_at     TIMESTAMPTZ,
    completed_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assignments_incident ON assignments(incident_id);
CREATE INDEX idx_assignments_assignee ON assignments(assigned_to) WHERE status IN ('PENDING', 'ACCEPTED', 'IN_PROGRESS');
CREATE INDEX idx_tasks_incident       ON tasks(incident_id);
CREATE INDEX idx_tasks_assignee       ON tasks(assigned_to) WHERE status <> 'COMPLETED';
