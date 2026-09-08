-- =============================================================
-- Seed 02 · Statuses, priorities, categories
-- =============================================================

INSERT INTO incident_statuses (name, description, sort_order, is_terminal) VALUES
    ('SUBMITTED',     'Report received from resident, awaiting triage',        10, FALSE),
    ('UNDER_REVIEW',  'Barangay staff / AI is evaluating the report',          20, FALSE),
    ('VERIFIED',      'Confirmed as a legitimate incident',                    30, FALSE),
    ('ASSIGNED',      'Routed to an office / field personnel',                 40, FALSE),
    ('FIELD_RESPONSE','Personnel are on-site responding',                      50, FALSE),
    ('RESOLVED',      'Issue fixed, awaiting confirmation',                    60, FALSE),
    ('CLOSED',        'Incident complete and archived',                        70, TRUE),
    ('REJECTED',      'Report declined after review',                          80, TRUE),
    ('DUPLICATE',     'Report merged into an existing incident',               90, TRUE),
    ('REOPENED',      'Closed incident reopened by resident or admin',         95, FALSE),
    ('CANCELLED',     'Withdrawn by the resident',                            100, TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO priorities (name, level, description, color, response_target_minutes) VALUES
    ('CRITICAL', 1, 'Immediate danger to life or property — respond within hours', '#dc2626', 60),
    ('HIGH',     2, 'Urgent issue affecting many residents',                      '#f97316', 240),
    ('MEDIUM',   3, 'Standard issue needing scheduled response',                  '#facc15', 1440),
    ('LOW',      4, 'Minor issue — batch with routine maintenance',               '#22c55e', 10080)
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, description, icon, color, department) VALUES
    ('Flooding',        'Flooded streets and homes, drainage overflow',        'waves',            '#2563eb', 'DRRMO'),
    ('Road Damage',     'Potholes, cracks, collapsed pavement',                'triangle-alert',   '#b45309', 'Engineering Office'),
    ('Garbage',         'Uncollected waste, missed collection schedules',      'trash',            '#65a30d', 'Sanitation'),
    ('Streetlight',     'Broken or missing street lighting',                   'lightbulb',        '#ca8a04', 'Public Works'),
    ('Water Supply',    'Outages, low pressure, contaminated water',           'droplets',         '#0891b2', 'Water Services'),
    ('Drainage',        'Blocked or damaged canals and drainage',              'git-merge',        '#7c3aed', 'Engineering Office'),
    ('Public Safety',   'Crime, hazards, unsafe structures',                   'shield',           '#dc2626', 'DRRMO'),
    ('Traffic',         'Congestion, broken signals, signage issues',          'car',              '#ea580c', 'Public Works'),
    ('Noise',           'Excessive noise complaints',                          'volume-2',         '#64748b', 'Barangay Office'),
    ('Illegal Dumping', 'Waste dumped in unauthorized locations',              'ban',              '#78350f', 'Environment'),
    ('Infrastructure',  'Damaged public facilities and structures',            'building',         '#334155', 'Engineering Office'),
    ('Other',           'Uncategorized issues',                                'circle-help',      '#9ca3af', 'Barangay Office')
ON CONFLICT (name) DO NOTHING;
