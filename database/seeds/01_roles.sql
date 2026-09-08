-- =============================================================
-- Seed 01 · Roles, permissions, role_permissions
-- Idempotent: safe to re-run.
-- =============================================================

INSERT INTO roles (name, description) VALUES
    ('RESIDENT',         'Ordinary barangay resident — submits and tracks reports'),
    ('BARANGAY_ADMIN',   'Barangay official — reviews, verifies, assigns incidents'),
    ('BARANGAY_STAFF',   'Barangay employee — reviews and processes reports'),
    ('FIELD_PERSONNEL',  'Tanod / worker — receives assignments, posts field updates and evidence'),
    ('OFFICE_HEAD',      'Head of a city office — monitors office workload and SLAs'),
    ('LGU_ADMIN',        'City-level administrator — city-wide analytics and management'),
    ('SYSTEM_ADMIN',     'Full system control including settings and user management')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description, module, action) VALUES
    ('reports.create',   'Submit a new report',                        'reports',   'create'),
    ('reports.view',     'View reports',                               'reports',   'view'),
    ('reports.verify',   'Verify reports and convert to incidents',    'reports',   'verify'),
    ('reports.assign',   'Assign incidents to offices/personnel',      'reports',   'assign'),
    ('reports.resolve',  'Record resolutions and close incidents',     'reports',   'resolve'),
    ('incidents.view',   'View incidents',                             'incidents', 'view'),
    ('incidents.manage', 'Update incident status, priority, category', 'incidents', 'manage'),
    ('field.update',     'Post field updates and evidence',            'incidents', 'field'),
    ('users.create',     'Create user accounts',                       'users',     'create'),
    ('users.manage',     'Activate/deactivate users and reset roles',  'users',     'manage'),
    ('analytics.view',   'View dashboards and statistics',             'analytics', 'view'),
    ('analytics.export', 'Export analytics and reports',               'analytics', 'export'),
    ('barangay.manage',  'Manage barangay profile, zones, offices',    'barangay',  'manage'),
    ('system.settings',  'Read and change system settings',            'system',    'manage'),
    ('audit.view',       'View audit logs',                            'audit',     'view')
ON CONFLICT (name) DO NOTHING;

-- Grant matrix: role → permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE
    -- RESIDENT: minimal
    (r.name = 'RESIDENT' AND p.name IN ('reports.create', 'reports.view'))
    -- BARANGAY_STAFF: everything in their barangay except user/system admin
    OR (r.name = 'BARANGAY_STAFF' AND p.name NOT IN
        ('users.manage', 'analytics.export', 'system.settings', 'audit.view'))
    -- BARANGAY_ADMIN: adds user management and audit
    OR (r.name = 'BARANGAY_ADMIN' AND p.name <> 'system.settings')
    -- FIELD_PERSONNEL: view + field work
    OR (r.name = 'FIELD_PERSONNEL' AND p.name IN
        ('reports.view', 'incidents.view', 'field.update'))
    -- OFFICE_HEAD: monitoring + analytics
    OR (r.name = 'OFFICE_HEAD' AND p.name IN
        ('reports.view', 'incidents.view', 'analytics.view', 'analytics.export'))
    -- LGU_ADMIN: everything except system settings
    OR (r.name = 'LGU_ADMIN' AND p.name <> 'system.settings')
    -- SYSTEM_ADMIN: everything
    OR (r.name = 'SYSTEM_ADMIN')
ON CONFLICT DO NOTHING;
