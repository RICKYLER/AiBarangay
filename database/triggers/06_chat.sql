-- =============================================================
-- 06 · Chat notifications
--
-- A new chat_message notifies the other side: the resident, or the
-- active desk officers of the thread's desk in its barangay.
--
-- SECURITY DEFINER (owner = postgres, BYPASSRLS) so the insert
-- works no matter who inserts the message — the notifications
-- insert policy would block a resident notifying a desk officer.
--
-- Dedupe: one unread CHAT_MESSAGE notification per (user, thread);
-- a newer message in the same thread refreshes it instead of
-- stacking rows.
-- =============================================================

CREATE OR REPLACE FUNCTION chat_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
    v_thread   chat_threads;
    v_notif    notifications;
    v_resident users;
    v_desk     TEXT;
BEGIN
    SELECT * INTO v_thread FROM chat_threads WHERE id = NEW.thread_id;
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    SELECT name INTO v_desk FROM chat_desks WHERE id = v_thread.desk_id;

    IF NEW.side = 'DESK' THEN
        -- Notify the resident of the thread.
        SELECT * INTO v_resident FROM users WHERE id = v_thread.resident_id;
        IF v_resident IS NULL THEN
            RETURN NEW;
        END IF;

        SELECT * INTO v_notif FROM notifications
         WHERE user_id = v_resident.id
           AND type = 'CHAT_MESSAGE'
           AND chat_thread_id = v_thread.id
           AND NOT is_read;

        IF v_notif IS NULL THEN
            INSERT INTO notifications (user_id, chat_thread_id, type, title, message)
            VALUES (v_resident.id, v_thread.id, 'CHAT_MESSAGE',
                    'New message from ' || v_desk,
                    NEW.sender_name || ': ' || left(NEW.body, 180));
        ELSE
            UPDATE notifications
               SET message = NEW.sender_name || ': ' || left(NEW.body, 180),
                   created_at = now()
             WHERE id = v_notif.id;
        END IF;
    ELSE
        -- Notify every active officer of this desk in this barangay.
        FOR v_resident IN
            SELECT u.* FROM users u
             WHERE u.desk_id = v_thread.desk_id
               AND u.barangay_id = v_thread.barangay_id
               AND u.is_active
        LOOP
            SELECT * INTO v_notif FROM notifications
             WHERE user_id = v_resident.id
               AND type = 'CHAT_MESSAGE'
               AND chat_thread_id = v_thread.id
               AND NOT is_read;

            IF v_notif IS NULL THEN
                INSERT INTO notifications (user_id, chat_thread_id, type, title, message)
                VALUES (v_resident.id, v_thread.id, 'CHAT_MESSAGE',
                        'New message from ' || v_thread.resident_name,
                        NEW.sender_name || ': ' || left(NEW.body, 180));
            ELSE
                UPDATE notifications
                   SET message = NEW.sender_name || ': ' || left(NEW.body, 180),
                       created_at = now()
                 WHERE id = v_notif.id;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_chat_messages_notify ON chat_messages;
CREATE TRIGGER trg_chat_messages_notify
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION chat_on_new_message();
