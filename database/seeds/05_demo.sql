-- =============================================================
-- Seed 05 · Demo data — users, reports, one full incident lifecycle
-- Run ONLY in development. Password for all demo users:
--     "Password123!"  (bcrypt hash below)
-- =============================================================

-- Demo users -------------------------------------------------
INSERT INTO users (role_id, barangay_id, first_name, middle_name, last_name,
                   email, phone, password_hash, is_verified)
SELECT r.id, br.id, v.first_name, v.middle_name, v.last_name,
       v.email, v.phone,
       -- bcrypt hash of "Password123!" — replace for any real environment
       crypt('Password123!', gen_salt('bf', 10)),
       TRUE
  FROM (VALUES
      ('Juan',    'Reyes',    'Santos',   'juan.santos@example.com',    '+639171234501', 'RESIDENT'),
      ('Maria',   'Cruz',     'Dela',     'maria.dela@example.com',     '+639171234502', 'RESIDENT'),
      ('Pedro',   'Bautista', 'Ramos',    'pedro.ramos@example.com',    '+639171234503', 'BARANGAY_ADMIN'),
      ('Ana',     'Lopez',    'Garcia',   'ana.garcia@example.com',     '+639171234504', 'BARANGAY_STAFF'),
      ('Lito',    'Mendoza',  'Villar',   'lito.villar@example.com',    '+639171234505', 'FIELD_PERSONNEL'),
      ('Carmen',  'Diaz',     'Flores',   'carmen.flores@example.com',  '+639171234506', 'OFFICE_HEAD'),
      ('Rico',    'Tan',      'Lim',      'rico.lim@example.com',       '+639171234507', 'LGU_ADMIN'),
      ('System',  NULL,       'Admin',    'system.admin@example.com',   '+639171234508', 'SYSTEM_ADMIN')
  ) AS v(first_name, middle_name, last_name, email, phone, role_name)
  JOIN roles r  ON r.name = v.role_name
  LEFT JOIN LATERAL (
      SELECT id FROM barangays WHERE name = 'Magugpo Poblacion' LIMIT 1
  ) br ON v.role_name NOT IN ('OFFICE_HEAD', 'LGU_ADMIN', 'SYSTEM_ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Demo reports + locations -----------------------------------
WITH new_reports AS (
    INSERT INTO reports (resident_id, category_id, title, description,
                         status_id, priority_id, source, submitted_at)
    SELECT u.id, c.id, d.title, d.description,
           (SELECT id FROM incident_statuses WHERE name = 'SUBMITTED'),
           NULL, 'WEB_PORTAL', now() - (d.age_hours || ' hours')::interval
      FROM (VALUES
          ('juan.santos@example.com', 'Flooding',
           'Knee-deep flood on Rizal St',
           'The street floods every heavy rain. Water is knee-deep and entering the ground floor of two houses.',
           3),
          ('maria.dela@example.com', 'Streetlight',
           'Streetlight out near the covered court',
           'Three consecutive streetlights are not working, the area is very dark at night.',
           26),
          ('juan.santos@example.com', 'Garbage',
           'Missed garbage collection in Purok 2',
           'Garbage has not been collected for four days and is starting to smell.',
           50)
      ) AS d(email, category, title, description, age_hours)
      JOIN users u      ON u.email = d.email
      JOIN categories c ON c.name  = d.category
    RETURNING id, title
)
INSERT INTO report_locations (report_id, latitude, longitude, address, barangay_id, accuracy, location_source)
SELECT nr.id, loc.lat, loc.lon, loc.address,
       (SELECT id FROM barangays WHERE name = 'Magugpo Poblacion'),
       10.0, 'GPS'
  FROM new_reports nr
  JOIN (VALUES
      ('Knee-deep flood on Rizal St',                    7.4471, 125.8082, 'Rizal Street, Purok 1'),
      ('Streetlight out near the covered court',          7.4479, 125.8104, 'Near covered court, Purok 3'),
      ('Missed garbage collection in Purok 2',            7.4465, 125.8071, 'Purok 2, National Highway side')
  ) AS loc(title, lat, lon, address) ON loc.title = nr.title
ON CONFLICT DO NOTHING;

-- Demo AI analysis for the flooding report -------------------
INSERT INTO ai_analyses (report_id, model_name, model_version, analysis_type,
                         category_prediction, priority_prediction, summary,
                         confidence_score, reasoning, detected_keywords, location_analysis)
SELECT r.id, 'text-classifier', '1.2.0', 'COMBINED',
       c.id, (SELECT id FROM priorities WHERE name = 'CRITICAL'),
       'Recurring residential flooding with water entering homes; safety risk.',
       0.91,
       '{"signals": ["knee-deep", "entering ground floor", "every heavy rain"],
         "severity_rule": "structural_water_ingress"}',
       '["flood", "knee-deep", "houses"]',
       '{"zone": "Purok 1", "known_hotspot": true, "nearby_reports_7d": 4}'
  FROM reports r
  JOIN categories c ON c.name = 'Flooding'
 WHERE r.title = 'Knee-deep flood on Rizal St'
   AND NOT EXISTS (SELECT 1 FROM ai_analyses a WHERE a.report_id = r.id);

-- Demo duplicate flag between the two flooding-related reports
INSERT INTO duplicate_matches (report_id, matched_report_id, similarity_score,
                               match_type, ai_confidence, review_status)
SELECT r1.id, r2.id, 0.0, 'LOCATION', 0.66, 'PENDING'
  FROM reports r1, reports r2
 WHERE r1.title = 'Knee-deep flood on Rizal St'
   AND r2.title = 'Streetlight out near the covered court'
   AND NOT EXISTS (SELECT 1 FROM duplicate_matches dm
                    WHERE dm.report_id = r1.id AND dm.matched_report_id = r2.id);
-- (intentionally a weak/irrelevant match — a PENDING review the staff must dismiss)

-- Demo notifications for the resident ------------------------
INSERT INTO notifications (user_id, incident_id, type, title, message)
SELECT u.id, NULL, 'REPORT_RECEIVED',
       'Your report was received',
       'Thank you for your report "' || r.title || '". Our team will review it shortly.'
  FROM users u
  JOIN reports r ON r.resident_id = u.id
 WHERE u.email = 'juan.santos@example.com'
ON CONFLICT DO NOTHING;
