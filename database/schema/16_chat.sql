-- =============================================================
-- 16 · Chat (resident ↔ barangay desk)
--
-- A thread is resident ↔ desk (a shared inbox), never resident ↔
-- an individual account. Any desk officer of that desk in the
-- thread's barangay sees and answers the thread.
--
-- Names are denormalized (resident_name, sender_name) so listings
-- never join users under RLS — DESK_OFFICER accounts can only see
-- their own users row.
-- =============================================================

DO $$ BEGIN
    CREATE TYPE chat_side AS ENUM ('RESIDENT', 'DESK');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS chat_desks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_threads (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resident_name VARCHAR(240) NOT NULL,
    desk_id       UUID NOT NULL REFERENCES chat_desks(id),
    barangay_id   UUID NOT NULL REFERENCES barangays(id),
    subject       VARCHAR(200),
    report_id     UUID REFERENCES reports(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chat_threads_one_per_desk UNIQUE (resident_id, desk_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id   UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_id   UUID,                           -- NULL for deleted accounts
    sender_name VARCHAR(240) NOT NULL,
    side        chat_side NOT NULL,
    body        TEXT NOT NULL,
    read_at     TIMESTAMPTZ,                    -- NULL = unread by other side
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Desk assignment for DESK_OFFICER accounts (chat-only role).
ALTER TABLE users ADD COLUMN IF NOT EXISTS desk_id
    UUID REFERENCES chat_desks(id);

-- Links a CHAT_MESSAGE notification to its thread (frontend jumps
-- straight to the conversation).
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS chat_thread_id
    UUID REFERENCES chat_threads(id) ON DELETE CASCADE;

-- New notification type. PG15 allows ADD VALUE inside a transaction
-- as long as the value is not USED in the same transaction — the
-- trigger that inserts CHAT_MESSAGE rows lives in a later file.
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'CHAT_MESSAGE';
