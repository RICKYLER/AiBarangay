-- =============================================================
-- Chat RLS
--
-- Visibility model (matches the app's overall model):
--   * RESIDENT            → only their own threads
--   * BARANGAY_ADMIN /
--     BARANGAY_STAFF      → every thread in their barangay, and
--                           may reply as the desk
--   * DESK_OFFICER        → threads of their own desk in their
--                           own barangay, and may reply as the desk
--   * FIELD_PERSONNEL /
--     city officials      → view only (no reply)
--
-- Runs AFTER rls.sql in apply.mjs (chat < rls alphabetically) —
-- deliberately so: this file creates the chat policies, rls.sql
-- does not touch them. Order on a fresh apply:
-- policies/rls.sql then policies/chat.sql; both are idempotent.
-- =============================================================

-- ── Enable + FORCE RLS ──────────────────────────────────────
ALTER TABLE chat_threads  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads  FORCE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages FORCE ROW LEVEL SECURITY;

-- ── chat_threads ────────────────────────────────────────────
DROP POLICY IF EXISTS chat_threads_select ON chat_threads;
CREATE POLICY chat_threads_select ON chat_threads FOR SELECT
    USING (
        resident_id = current_app_user()
        OR is_city_official()
        OR (is_barangay_staff() AND barangay_id = current_app_barangay())
        OR (current_app_role() = 'DESK_OFFICER'
            AND barangay_id = current_app_barangay()
            AND desk_id = (SELECT desk_id FROM users
                            WHERE id = current_app_user()))
    );

-- Only residents open conversations, and only for themselves.
DROP POLICY IF EXISTS chat_threads_insert ON chat_threads;
CREATE POLICY chat_threads_insert ON chat_threads FOR INSERT
    WITH CHECK (
        current_app_role() = 'RESIDENT'
        AND resident_id = current_app_user()
        AND barangay_id = current_app_barangay()
    );

-- ── chat_messages ───────────────────────────────────────────
-- A message is visible when its thread is.
DROP POLICY IF EXISTS chat_messages_select ON chat_messages;
CREATE POLICY chat_messages_select ON chat_messages FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM chat_threads t
                 WHERE t.id = thread_id
                   AND (t.resident_id = current_app_user()
                        OR is_city_official()
                        OR (is_barangay_staff()
                            AND t.barangay_id = current_app_barangay())
                        OR (current_app_role() = 'DESK_OFFICER'
                            AND t.barangay_id = current_app_barangay()
                            AND t.desk_id = (SELECT desk_id FROM users
                                              WHERE id = current_app_user()))))
    );

-- Residents write to their own threads; barangay staff and desk
-- officers answer on behalf of the desk. Field personnel and
-- city officials may view but not chat.
DROP POLICY IF EXISTS chat_messages_insert ON chat_messages;
CREATE POLICY chat_messages_insert ON chat_messages FOR INSERT
    WITH CHECK (
        (side = 'RESIDENT'
         AND EXISTS (SELECT 1 FROM chat_threads t
                      WHERE t.id = thread_id
                        AND t.resident_id = current_app_user()))
        OR (side = 'DESK'
            AND (current_app_role() IN ('BARANGAY_ADMIN', 'BARANGAY_STAFF')
                 OR (current_app_role() = 'DESK_OFFICER'
                     AND EXISTS (SELECT 1 FROM chat_threads t
                                  WHERE t.id = thread_id
                                    AND t.desk_id = (SELECT desk_id FROM users
                                                      WHERE id = current_app_user()))))
            AND EXISTS (SELECT 1 FROM chat_threads t
                         WHERE t.id = thread_id
                           AND t.barangay_id = current_app_barangay()))
    );

-- Marking messages read (either side, shared-inbox semantics).
DROP POLICY IF EXISTS chat_messages_update ON chat_messages;
CREATE POLICY chat_messages_update ON chat_messages FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM chat_threads t
                 WHERE t.id = thread_id
                   AND (t.resident_id = current_app_user()
                        OR is_city_official()
                        OR (is_barangay_staff()
                            AND t.barangay_id = current_app_barangay())
                        OR (current_app_role() = 'DESK_OFFICER'
                            AND t.barangay_id = current_app_barangay()
                            AND t.desk_id = (SELECT desk_id FROM users
                                              WHERE id = current_app_user()))))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM chat_threads t
                 WHERE t.id = thread_id
                   AND (t.resident_id = current_app_user()
                        OR is_city_official()
                        OR (is_barangay_staff()
                            AND t.barangay_id = current_app_barangay())
                        OR (current_app_role() = 'DESK_OFFICER'
                            AND t.barangay_id = current_app_barangay()
                            AND t.desk_id = (SELECT desk_id FROM users
                                              WHERE id = current_app_user()))))
    );

-- Belt-and-braces over the schema-wide default privileges.
GRANT SELECT, INSERT, UPDATE ON chat_threads, chat_messages TO app_user;
GRANT SELECT ON chat_desks TO app_user;
