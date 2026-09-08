-- =============================================================
-- Seed 07 · Chat demo data — desk officers + conversations
-- Run ONLY in development. Password for all demo users:
--     "Password123!"  (bcrypt hash below)
-- =============================================================

-- Demo desk officers -------------------------------------------
INSERT INTO users (role_id, barangay_id, first_name, middle_name, last_name,
                   email, phone, password_hash, is_verified, desk_id)
SELECT r.id, br.id, v.first_name, NULL, v.last_name,
       v.email, v.phone,
       crypt('Password123!', gen_salt('bf', 10)),
       TRUE, (SELECT id FROM chat_desks WHERE name = v.desk)
  FROM (VALUES
      ('Dennis', 'Salcedo',    'desk.duty@example.com',  '+639171234509', 'DESK_OFFICER', 'Barangay Duty Desk'),
      ('Rosa',   'Miraflores', 'desk.health@example.com', '+639171234510', 'DESK_OFFICER', 'Barangay Health Office')
  ) AS v(first_name, last_name, email, phone, role_name, desk)
  JOIN roles r ON r.name = v.role_name
  LEFT JOIN LATERAL (
      SELECT id FROM barangays WHERE name = 'Magugpo Poblacion' LIMIT 1
  ) br ON TRUE
ON CONFLICT (email) DO NOTHING;

-- Demo conversation: Juan ↔ Duty Desk ---------------------------
INSERT INTO chat_threads (resident_id, resident_name, desk_id, barangay_id, subject)
SELECT u.id,
       u.first_name || ' ' || u.last_name,
       (SELECT id FROM chat_desks WHERE name = 'Barangay Duty Desk'),
       (SELECT id FROM barangays WHERE name = 'Magugpo Poblacion'),
       'Flooding follow-up'
  FROM users u
 WHERE u.email = 'juan.santos@example.com'
ON CONFLICT (resident_id, desk_id) DO NOTHING;

INSERT INTO chat_messages (thread_id, sender_id, sender_name, side, body, read_at, created_at)
SELECT t.id, u.id, 'Juan Santos', 'RESIDENT',
       'Good morning. Is there an update on the flooding on Rizal St?',
       now(), now() - interval '26 hours'
  FROM chat_threads t
  JOIN users u ON u.email = 'juan.santos@example.com'
 WHERE t.subject = 'Flooding follow-up'
   AND (SELECT count(*) FROM chat_messages m WHERE m.thread_id = t.id) = 0;

INSERT INTO chat_messages (thread_id, sender_name, side, body, read_at, created_at)
SELECT t.id, 'Barangay Duty Desk', 'DESK',
       'Good day Juan. Your flooding report was verified and a field inspection was scheduled. Personnel will be along Rizal Street this afternoon.',
       now(), now() - interval '25 hours'
  FROM chat_threads t
 WHERE t.subject = 'Flooding follow-up'
   AND (SELECT count(*) FROM chat_messages m WHERE m.thread_id = t.id) = 1;

-- Demo conversation: Maria ↔ Health Office ----------------------
INSERT INTO chat_threads (resident_id, resident_name, desk_id, barangay_id, subject)
SELECT u.id,
       u.first_name || ' ' || u.last_name,
       (SELECT id FROM chat_desks WHERE name = 'Barangay Health Office'),
       (SELECT id FROM barangays WHERE name = 'Magugpo Poblacion'),
       'Clean-up drive question'
  FROM users u
 WHERE u.email = 'maria.dela@example.com'
ON CONFLICT (resident_id, desk_id) DO NOTHING;

INSERT INTO chat_messages (thread_id, sender_id, sender_name, side, body, read_at, created_at)
SELECT t.id, u.id, 'Maria Dela', 'RESIDENT',
       'Good day. Can residents volunteer for the clean-up drive on Saturday?',
       now(), now() - interval '11 days'
  FROM chat_threads t
  JOIN users u ON u.email = 'maria.dela@example.com'
 WHERE t.subject = 'Clean-up drive question'
   AND (SELECT count(*) FROM chat_messages m WHERE m.thread_id = t.id) = 0;

INSERT INTO chat_messages (thread_id, sender_name, side, body, read_at, created_at)
SELECT t.id, 'Barangay Health Office', 'DESK',
       'Yes! Volunteers are welcome. Please proceed to the barangay hall at 6:00 AM with gloves and water. Thank you for your interest.',
       now(), now() - interval '10 days'
  FROM chat_threads t
 WHERE t.subject = 'Clean-up drive question'
   AND (SELECT count(*) FROM chat_messages m WHERE m.thread_id = t.id) = 1;
