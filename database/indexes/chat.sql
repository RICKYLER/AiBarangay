-- =============================================================
-- Chat indexes — thread lists, unread counters, desk inboxes
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_chat_threads_resident ON chat_threads (resident_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_desk     ON chat_threads (desk_id, barangay_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread  ON chat_messages (thread_id, created_at);
-- Unread counts scan per-thread unread rows only.
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread  ON chat_messages (thread_id) WHERE read_at IS NULL;
