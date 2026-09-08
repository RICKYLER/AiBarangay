-- =============================================================
-- Seed 04 · Offices & system settings
-- =============================================================

-- City-level offices (no barangay scope)
INSERT INTO offices (name, description, office_type, contact_number, email)
VALUES
    ('City Engineering Office',  'Infrastructure and construction',   'ENGINEERING',   '(084) 216-3001', 'engineering@tagumcity.gov.ph'),
    ('Public Works Office',      'Roads, lights, traffic assets',     'PUBLIC_WORKS',  '(084) 216-3002', 'publicworks@tagumcity.gov.ph'),
    ('DRRMO Tagum',              'Disaster risk reduction & safety',  'DRRMO',         '(084) 216-3003', 'drrmo@tagumcity.gov.ph'),
    ('City Sanitation Office',   'Waste collection and sanitation',   'SANITATION',    '(084) 216-3004', 'sanitation@tagumcity.gov.ph'),
    ('Environment Office',       'Environmental compliance',          'ENVIRONMENT',   '(084) 216-3005', 'environment@tagumcity.gov.ph'),
    ('Water Services',           'Water supply concerns',             'WATER_SERVICES','(084) 216-3006', 'water@tagumcity.gov.ph')
ON CONFLICT DO NOTHING;

-- Barangay office for every seeded barangay
INSERT INTO offices (barangay_id, name, description, office_type, contact_number, email)
SELECT br.id,
       'Barangay ' || br.name || ' Office',
       'Primary point of verification and response',
       'BARANGAY_OFFICE',
       '(084) 400-' || lpad((row_number() OVER ())::text, 4, '0'),
       lower(regexp_replace(br.name, '[^a-zA-Z]', '')) || '@barangay.tagumcity.gov.ph'
  FROM barangays br
 WHERE br.city_municipality_id = (SELECT id FROM cities_municipalities WHERE name = 'Tagum City')
ON CONFLICT DO NOTHING;

-- System settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('ai.confidence_threshold',    '0.75',                          'Minimum AI confidence before a prediction is surfaced to reviewers'),
    ('ai.default_model',           '"gpt-4o-mini"',                  'Model used for text analysis when none specified'),
    ('reports.default_priority',   '"MEDIUM"',                       'Priority applied before AI/barangay review'),
    ('reports.number_prefix',      '"RPT"',                          'Report number prefix'),
    ('incidents.number_prefix',    '"INC"',                          'Incident number prefix'),
    ('uploads.max_size_mb',        '25',                             'Maximum upload size per file'),
    ('uploads.allowed_types',      '["IMAGE","VIDEO","DOCUMENT"]',   'Allowed media types'),
    ('notifications.email_enabled','true',                           'Send email notifications in addition to in-app'),
    ('sla.critical_minutes',       '60',                             'Response target for CRITICAL incidents'),
    ('duplicates.distance_meters', '150',                            'Radius for location-based duplicate candidates'),
    ('duplicates.min_similarity',  '0.85',                           'Similarity score to auto-flag duplicates'),
    ('hotspots.refresh_hours',     '6',                              'How often hotspot clusters are recomputed'),
    ('map.default_center',         '{"lat": 7.4472, "lng": 125.8095, "zoom": 13}', 'Default map view (Tagum City)')
ON CONFLICT (setting_key) DO NOTHING;
