/* ============================================================
   BARANGAY OPERATIONS — ADMINISTRATIVE DATA MODULE
   Mock operational dataset for the San Isidro Barangay / LGU
   operations console. Shared across all admin pages.
   ============================================================ */

export const ORG = {
  system: 'AI BARANGAY PROBLEM MAPPER',
  barangay: 'San Isidro Barangay',
  municipality: 'Tagum City · Davao del Norte',
  role: 'Administrator',
  user: 'Administrator',
};

/* ---------------- Reports (citizen submissions) ---------------- */
export const REPORTS = [
  {
    id: 'RPT-2026-001284',
    title: 'Severe Urban Flooding & Blocked Drainage',
    category: 'Flooding',
    zone: 'Zone 3',
    location: 'Riverside Road, Zone 3',
    barangay: 'San Isidro',
    priority: 'CRITICAL',
    severity: 'High',
    status: 'Pending Review',
    submitted: 'Sep 6, 2026',
    submittedTime: '08:30',
    reporter: 'Resident #1024',
    description: 'Water has accumulated along Riverside Road after heavy rainfall. Drainage culvert is completely blocked by silt and debris; water depth approximately 0.5m.',
    images: [
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=800&q=80',
    ],
    aiConfidence: 94,
    aiDuplicateRisk: 12,
    aiRecommendation: 'Consider drainage inspection and high-capacity pump deployment along Riverside Road.',
  },
  {
    id: 'RPT-2026-001283',
    title: 'Broken Solar Streetlight Fixture',
    category: 'Streetlight',
    zone: 'Zone 2',
    location: 'Pioneer Extension, Zone 2',
    barangay: 'San Isidro',
    priority: 'MEDIUM',
    severity: 'Medium',
    status: 'Verified',
    submitted: 'Sep 5, 2026',
    submittedTime: '18:15',
    reporter: 'Resident #1031',
    description: 'Streetlight lamp has been flickering and is now completely out of service near the alley entrance.',
    images: ['https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80'],
    aiConfidence: 91,
    aiDuplicateRisk: 5,
    aiRecommendation: 'Routine streetlight battery and LED module replacement.',
  },
  {
    id: 'RPT-2026-001280',
    title: 'Uncollected Commercial Waste Dump',
    category: 'Garbage',
    zone: 'Zone 5',
    location: 'Sobrecarey St, Zone 5',
    barangay: 'San Isidro',
    priority: 'HIGH',
    severity: 'Medium',
    status: 'In Progress',
    submitted: 'Sep 4, 2026',
    submittedTime: '14:40',
    reporter: 'Resident #1042',
    description: 'Commercial waste accumulation along sidewalk creating foul odor and health concerns for adjacent food vendors.',
    images: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'],
    aiConfidence: 93,
    aiDuplicateRisk: 8,
    aiRecommendation: 'Issue sanitation violation notice and dispatch collection unit.',
  },
  {
    id: 'RPT-2026-001278',
    title: 'Deep Pothole on School Route',
    category: 'Road Damage',
    zone: 'Zone 1',
    location: 'Mabini St, Zone 1',
    barangay: 'San Isidro',
    priority: 'HIGH',
    severity: 'High',
    status: 'Pending Review',
    submitted: 'Sep 4, 2026',
    submittedTime: '07:05',
    reporter: 'Resident #1055',
    description: 'Deep road depression 1.4m wide along the elementary school walking route. Hazard for children and tricycles.',
    images: [],
    aiConfidence: 95,
    aiDuplicateRisk: 3,
    aiRecommendation: 'Barricade immediately and schedule asphalt patching.',
  },
  {
    id: 'RPT-2026-001275',
    title: 'Leaking Water Main Valve',
    category: 'Water Leak',
    zone: 'Zone 4',
    location: 'Rizal Ext, Zone 4',
    barangay: 'San Isidro',
    priority: 'MEDIUM',
    severity: 'Medium',
    status: 'Assigned',
    submitted: 'Sep 3, 2026',
    submittedTime: '11:22',
    reporter: 'Resident #1061',
    description: 'Continuous potable water leakage at street valve junction; wasting water and eroding the shoulder.',
    images: [],
    aiConfidence: 89,
    aiDuplicateRisk: 4,
    aiRecommendation: 'Dispatch water district repair crew for valve seal replacement.',
  },
  {
    id: 'RPT-2026-001271',
    title: 'Flooded Intersection after Rainfall',
    category: 'Flooding',
    zone: 'Zone 3',
    location: 'Riverside Rd & Magsaysay, Zone 3',
    barangay: 'San Isidro',
    priority: 'HIGH',
    severity: 'High',
    status: 'Under Review',
    submitted: 'Sep 3, 2026',
    submittedTime: '16:48',
    reporter: 'Resident #1012',
    description: 'Intersection floods ankle-deep after 30 minutes of rain; drainage grate appears clogged.',
    images: [],
    aiConfidence: 88,
    aiDuplicateRisk: 41,
    aiRecommendation: 'Possible duplicate of RPT-2026-001284. Verify same drainage line.',
  },
  {
    id: 'RPT-2026-001269',
    title: 'Garbage Bin Overflow at Plaza',
    category: 'Garbage',
    zone: 'Zone 2',
    location: 'Plaza Corner, Zone 2',
    barangay: 'San Isidro',
    priority: 'LOW',
    severity: 'Low',
    status: 'Resolved',
    submitted: 'Sep 2, 2026',
    submittedTime: '09:10',
    reporter: 'Resident #1077',
    description: 'Public bins at plaza corner overflowing after weekend market.',
    images: [],
    aiConfidence: 97,
    aiDuplicateRisk: 2,
    aiRecommendation: 'Schedule additional weekend collection sweep.',
  },
  {
    id: 'RPT-2026-001266',
    title: 'Streetlight Out Along Barangay Road',
    category: 'Streetlight',
    zone: 'Zone 5',
    location: 'Katipunan Rd, Zone 5',
    barangay: 'San Isidro',
    priority: 'LOW',
    severity: 'Low',
    status: 'Resolved',
    submitted: 'Sep 1, 2026',
    submittedTime: '19:33',
    reporter: 'Resident #1084',
    description: 'Three consecutive lamp posts dark along the barangay road shoulder.',
    images: [],
    aiConfidence: 92,
    aiDuplicateRisk: 6,
    aiRecommendation: 'Check circuit breaker and replace affected bulbs.',
  },
];

/* ---------------- Verified incidents ---------------- */
export const INCIDENTS = [
  {
    id: 'INC-2026-00321',
    reportId: 'RPT-2026-001284',
    title: 'Severe Flooding & Drainage Blockage',
    category: 'Flooding',
    priority: 'CRITICAL',
    zone: 'Zone 3',
    barangay: 'San Isidro',
    location: 'Riverside Road, Zone 3',
    status: 'Assigned',
    office: 'Public Works & Engineering',
    personnel: 'Juan Dela Cruz',
    created: 'Sep 6, 2026',
    updated: 'Sep 6, 2026 09:42',
    lat: 7.4475, lng: 125.8055,
  },
  {
    id: 'INC-2026-00318',
    reportId: 'RPT-2026-001278',
    title: 'Deep Pothole on School Route',
    category: 'Road Damage',
    priority: 'HIGH',
    zone: 'Zone 1',
    barangay: 'San Isidro',
    location: 'Mabini St, Zone 1',
    status: 'In Progress',
    office: 'City Highways Unit',
    personnel: 'Reynaldo Dizon',
    created: 'Sep 5, 2026',
    updated: 'Sep 6, 2026 08:05',
    lat: 7.4512, lng: 125.8021,
  },
  {
    id: 'INC-2026-00314',
    reportId: 'RPT-2026-001280',
    title: 'Commercial Garbage Accumulation',
    category: 'Garbage',
    priority: 'HIGH',
    zone: 'Zone 5',
    barangay: 'San Isidro',
    location: 'Sobrecarey St, Zone 5',
    status: 'On Site',
    office: 'CENRO Sanitation',
    personnel: 'Maria Santos',
    created: 'Sep 4, 2026',
    updated: 'Sep 6, 2026 07:50',
    lat: 7.4395, lng: 125.8152,
  },
  {
    id: 'INC-2026-00309',
    reportId: 'RPT-2026-001275',
    title: 'Leaking Water Main Valve',
    category: 'Water Leak',
    priority: 'MEDIUM',
    zone: 'Zone 4',
    barangay: 'San Isidro',
    location: 'Rizal Ext, Zone 4',
    status: 'En Route',
    office: 'Water District Maintenance',
    personnel: 'Carla Reyes',
    created: 'Sep 3, 2026',
    updated: 'Sep 6, 2026 07:12',
    lat: 7.4448, lng: 125.8090,
  },
  {
    id: 'INC-2026-00301',
    reportId: 'RPT-2026-001283',
    title: 'Streetlight Fixture Replacement',
    category: 'Streetlight',
    priority: 'MEDIUM',
    zone: 'Zone 2',
    barangay: 'San Isidro',
    location: 'Pioneer Extension, Zone 2',
    status: 'Completed',
    office: 'Barangay Electrical Team',
    personnel: 'Ernesto Villa',
    created: 'Sep 2, 2026',
    updated: 'Sep 5, 2026 16:20',
    lat: 7.4492, lng: 125.8038,
  },
];

/* ---------------- Field operations ---------------- */
export const FIELD_OPS = [
  {
    id: 'INC-2026-00321',
    incident: 'Severe Flooding & Drainage Blockage',
    personnel: 'Juan Dela Cruz',
    office: 'Public Works & Engineering',
    location: 'Riverside Road, Zone 3',
    priority: 'CRITICAL',
    status: 'En Route',
    lastUpdate: '09:42 — Departed depot, ETA 12 min',
    steps: [
      { title: 'Assigned', time: 'Sep 6, 08:52', status: 'done' },
      { title: 'En Route', time: 'Sep 6, 09:42', status: 'active' },
      { title: 'On Site', time: '—', status: 'pending' },
      { title: 'Inspection', time: '—', status: 'pending' },
      { title: 'Action Taken', time: '—', status: 'pending' },
      { title: 'Completed', time: '—', status: 'pending' },
    ],
  },
  {
    id: 'INC-2026-00314',
    incident: 'Commercial Garbage Accumulation',
    personnel: 'Maria Santos',
    office: 'CENRO Sanitation',
    location: 'Sobrecarey St, Zone 5',
    priority: 'HIGH',
    status: 'Inspection',
    lastUpdate: '08:05 — Documenting violation, coordinating vendor notice',
    steps: [
      { title: 'Assigned', time: 'Sep 5, 15:10', status: 'done' },
      { title: 'En Route', time: 'Sep 6, 06:40', status: 'done' },
      { title: 'On Site', time: 'Sep 6, 07:02', status: 'done' },
      { title: 'Inspection', time: 'Sep 6, 07:50', status: 'active' },
      { title: 'Action Taken', time: '—', status: 'pending' },
      { title: 'Completed', time: '—', status: 'pending' },
    ],
  },
  {
    id: 'INC-2026-00318',
    incident: 'Deep Pothole on School Route',
    personnel: 'Reynaldo Dizon',
    office: 'City Highways Unit',
    location: 'Mabini St, Zone 1',
    priority: 'HIGH',
    status: 'Action Taken',
    lastUpdate: '08:05 — Barricade placed; asphalt patch crew scheduled 13:00',
    steps: [
      { title: 'Assigned', time: 'Sep 5, 09:20', status: 'done' },
      { title: 'En Route', time: 'Sep 5, 10:00', status: 'done' },
      { title: 'On Site', time: 'Sep 5, 10:35', status: 'done' },
      { title: 'Inspection', time: 'Sep 5, 11:10', status: 'done' },
      { title: 'Action Taken', time: 'Sep 6, 08:05', status: 'active' },
      { title: 'Completed', time: '—', status: 'pending' },
    ],
  },
];

export const PERSONNEL = [
  { name: 'Juan Dela Cruz', unit: 'Public Works Unit 1', role: 'Field Personnel', status: 'active', currentTask: 'INC-2026-00321' },
  { name: 'Maria Santos', unit: 'CENRO Taskforce', role: 'Sanitation Officer', status: 'active', currentTask: 'INC-2026-00314' },
  { name: 'Reynaldo Dizon', unit: 'DRRMO Unit 2', role: 'Field Personnel', status: 'active', currentTask: 'INC-2026-00318' },
  { name: 'Carla Reyes', unit: 'Water District Maintenance', role: 'Maintenance Technician', status: 'active', currentTask: 'INC-2026-00309' },
  { name: 'Ernesto Villa', unit: 'Barangay Electrical Team', role: 'Electrician', status: 'inactive', currentTask: null },
];

/* ---------------- GIS zones & hotspots ---------------- */
export const ZONES = [
  { name: 'Zone 1', lat: 7.4512, lng: 125.8021, radius: 320, incidentCount: 31 },
  { name: 'Zone 2', lat: 7.4492, lng: 125.8038, radius: 300, incidentCount: 28 },
  { name: 'Zone 3', lat: 7.4475, lng: 125.8055, radius: 340, incidentCount: 42 },
  { name: 'Zone 4', lat: 7.4448, lng: 125.8090, radius: 280, incidentCount: 18 },
  { name: 'Zone 5', lat: 7.4395, lng: 125.8152, radius: 360, incidentCount: 35 },
];

export const HOTSPOTS = [
  { label: 'FLOODING HOTSPOT', sub: 'Riverside Road · 12 incidents nearby', lat: 7.4475, lng: 125.8055, radius: 260 },
  { label: 'WASTE HOTSPOT', sub: 'Sobrecarey St · 7 incidents nearby', lat: 7.4395, lng: 125.8152, radius: 200 },
];

/* ---------------- Audit log ---------------- */
export const AUDIT_LOGS = [
  {
    id: 'LOG-2026-9908',
    timestamp: '2026-09-06 09:42:18',
    time: '09:42:18',
    user: 'Administrator',
    role: 'Administrator',
    action: 'Updated Incident',
    resource: 'INC-2026-00321',
    detail: 'Assigned field personnel Juan Dela Cruz',
    ip: '10.255.12.4',
    session: 'SES-A48F12',
    result: 'SUCCESS',
  },
  {
    id: 'LOG-2026-9907',
    timestamp: '2026-09-06 09:15:32',
    time: '09:15:32',
    user: 'Administrator',
    role: 'Administrator',
    action: 'Verified Citizen Report',
    resource: 'RPT-2026-001284',
    detail: 'Created incident INC-2026-00321 from verified report',
    ip: '10.255.12.4',
    session: 'SES-A48F12',
    result: 'SUCCESS',
  },
  {
    id: 'LOG-2026-9906',
    timestamp: '2026-09-06 08:05:14',
    user: 'Reynaldo Dizon',
    role: 'Incident Officer',
    action: 'Field Update',
    resource: 'INC-2026-00318',
    detail: 'Status set to Action Taken with photo evidence',
    ip: '172.16.8.91 (GPS Tagged)',
    session: 'SES-B71C09',
    result: 'SUCCESS',
  },
  {
    id: 'LOG-2026-9905',
    timestamp: '2026-09-06 07:50:02',
    user: 'Maria Santos',
    role: 'Sanitation Officer',
    action: 'Field Update',
    resource: 'INC-2026-00314',
    detail: 'Inspection notes appended, vendor notice drafted',
    ip: '172.16.8.77 (GPS Tagged)',
    session: 'SES-C22D44',
    result: 'SUCCESS',
  },
  {
    id: 'LOG-2026-9904',
    timestamp: '2026-09-05 16:45:22',
    user: 'Ernesto Villa',
    role: 'Incident Officer',
    action: 'Closed Incident',
    resource: 'INC-2026-00301',
    detail: 'Streetlight fixture replaced and verified operational',
    ip: '10.255.14.8',
    session: 'SES-D19A77',
    result: 'SUCCESS',
  },
  {
    id: 'LOG-2026-9903',
    timestamp: '2026-09-05 16:20:41',
    user: 'Unknown',
    role: '—',
    action: 'Login Attempt',
    resource: 'ADMIN CONSOLE',
    detail: 'Failed credential check — account locked for 15 minutes',
    ip: '203.0.113.88',
    session: '—',
    result: 'FAILED',
  },
  {
    id: 'LOG-2026-9902',
    timestamp: '2026-09-05 15:10:09',
    user: 'Administrator',
    role: 'Administrator',
    action: 'Created Assignment',
    resource: 'INC-2026-00314',
    detail: 'Maria Santos assigned to sanitation response',
    ip: '10.255.12.4',
    session: 'SES-A48F12',
    result: 'SUCCESS',
  },
  {
    id: 'LOG-2026-9901',
    timestamp: '2026-09-05 09:20:55',
    user: 'Administrator',
    role: 'Administrator',
    action: 'Exported Records',
    resource: 'REPORTS CSV',
    detail: 'Monthly report export — 1,284 records',
    ip: '10.255.12.4',
    session: 'SES-A48F12',
    result: 'SUCCESS',
  },
];

/* ---------------- System users ---------------- */
export const USERS = [
  { id: 'USR-0001', name: 'Administrator', role: 'Administrator', office: 'San Isidro Barangay', email: 'admin@sanisidro.gov.ph', status: 'Active', lastLogin: 'Sep 6, 2026 07:58' },
  { id: 'USR-0007', name: 'Juan Dela Cruz', role: 'Field Personnel', office: 'Public Works Unit 1', email: 'j.delacruz@sanisidro.gov.ph', status: 'Active', lastLogin: 'Sep 6, 2026 06:40' },
  { id: 'USR-0011', name: 'Maria Santos', role: 'Incident Officer', office: 'CENRO Taskforce', email: 'm.santos@sanisidro.gov.ph', status: 'Active', lastLogin: 'Sep 6, 2026 06:55' },
  { id: 'USR-0014', name: 'Reynaldo Dizon', role: 'Field Personnel', office: 'DRRMO Unit 2', email: 'r.dizon@sanisidro.gov.ph', status: 'Active', lastLogin: 'Sep 5, 2026 17:02' },
  { id: 'USR-0019', name: 'Carla Reyes', role: 'Incident Officer', office: 'Water District', email: 'c.reyes@sanisidro.gov.ph', status: 'Active', lastLogin: 'Sep 6, 2026 07:05' },
  { id: 'USR-0023', name: 'Ernesto Villa', role: 'Field Personnel', office: 'Barangay Electrical', email: 'e.villa@sanisidro.gov.ph', status: 'Inactive', lastLogin: 'Sep 4, 2026 15:44' },
];

/* ---------------- Incident categories ---------------- */
export const CATEGORIES = [
  { name: 'Flooding', code: 'CAT-FLD', volume: 436, share: 34, sla: 'Critical ≤ 4 hrs', trend: '+42% (48h)' },
  { name: 'Road Damage', code: 'CAT-RDM', volume: 269, share: 21, sla: 'High ≤ 24 hrs', trend: '+6% (30d)' },
  { name: 'Garbage & Sanitation', code: 'CAT-GSB', volume: 231, share: 18, sla: 'Medium ≤ 48 hrs', trend: '−3% (30d)' },
  { name: 'Streetlight', code: 'CAT-SLT', volume: 141, share: 11, sla: 'Medium ≤ 48 hrs', trend: '+2% (30d)' },
  { name: 'Water Leak', code: 'CAT-WTL', volume: 115, share: 9, sla: 'High ≤ 24 hrs', trend: '−1% (30d)' },
  { name: 'Others', code: 'CAT-ETH', volume: 92, share: 7, sla: 'Medium ≤ 72 hrs', trend: '0% (30d)' },
];

/* ---------------- Notifications ---------------- */
export const NOTIFICATIONS = [
  { id: 1, text: 'Critical incident INC-2026-00321 (Flooding, Zone 3) is awaiting assignment.', time: '8 minutes ago', unread: true },
  { id: 2, text: 'AI pattern alert: flooding reports in Zone 3 up 42% in 48 hours.', time: '26 minutes ago', unread: true },
  { id: 3, text: 'Field update logged by Reynaldo Dizon for INC-2026-00318.', time: '1 hour ago', unread: true },
  { id: 4, text: 'Report RPT-2026-001266 marked Resolved by Ernesto Villa.', time: 'Yesterday', unread: false },
];

/* ---------------- KPI / dashboard aggregates ---------------- */
export const DASHBOARD_KPI = {
  totalReports: '1,284',
  totalReportsTrend: { direction: 'up', label: '+8.2%' },
  totalReportsNote: 'this month',
  pendingReview: '24',
  pendingReviewNote: '6 require attention',
  verifiedIncidents: '186',
  verifiedIncidentsTrend: { direction: 'up', label: '+12' },
  verifiedIncidentsNote: 'today',
  criticalIncidents: '12',
  criticalIncidentsTrend: { direction: 'alert', label: '3 new' },
  criticalIncidentsNote: 'today',
};

export const PRIORITIES = [
  { key: 'critical', label: 'Critical', count: 12, sub: 'Immediate Action', pct: 35 },
  { key: 'high', label: 'High', count: 37, sub: 'Requires Assignment', pct: 65 },
  { key: 'medium', label: 'Medium', count: 89, sub: 'Under Review', pct: 85 },
  { key: 'low', label: 'Low', count: 124, sub: 'Queued', pct: 100 },
];

/* Weekly report volume (analytics) */
export const WEEKLY_VOLUME = [
  { label: 'Wk 1', value: 120 },
  { label: 'Wk 2', value: 240 },
  { label: 'Wk 3', value: 380 },
  { label: 'Wk 4', value: 290, current: true },
];

/* ============================================================
   ANALYTICS — operational intelligence dataset (demo)
   All values are illustrative demonstration data for the
   Barangay Operations analytics page.
   ============================================================ */

/* Deterministic daily series (fixed formula — no randomness, so the
   demo renders identically on every visit). 365 days ending Sep 6,
   2026: weekday rhythm, seasonal wave, recurring rainy spells that
   lift flooding reports, and a slow upward trend. */
function buildAnalyticsDaily() {
  const out = [];
  const end = new Date(2026, 8, 6); // Sep 6, 2026
  for (let i = 364; i >= 0; i -= 1) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const t = 364 - i;
    const dow = d.getDay();
    const weekly = dow === 0 ? -14 : dow === 6 ? -6 : dow === 3 ? 8 : 0;
    const seasonal = Math.sin((t / 365) * Math.PI * 2) * 9;
    const rain = Math.sin((t / 29) * Math.PI * 2) * 8 + (t % 29 < 6 ? 12 : 0);
    const trend = t * 0.028;
    const submitted = Math.max(8, Math.round(42 + weekly + seasonal + rain + trend));
    const verified = Math.max(4, Math.round(submitted * (0.58 + Math.sin(t / 11) * 0.06)));
    out.push({
      key: d.toISOString().slice(0, 10),
      short: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      long: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      submitted,
      verified,
    });
  }
  return out;
}

export const ANALYTICS_DAILY = buildAnalyticsDaily();

export const ANALYTICS_RANGES = [
  { key: '7d', label: '7D', days: 7 },
  { key: '30d', label: '30D', days: 30 },
  { key: '90d', label: '90D', days: 90 },
  { key: '1y', label: '1Y', days: 365 },
];

export const ANALYTICS_KPI = [
  { key: 'reports', label: 'TOTAL REPORTS', value: '1,284', delta: '+8.2%', good: true, note: 'vs previous period' },
  { key: 'verified', label: 'VERIFIED INCIDENTS', value: '186', delta: '+12', good: true, note: 'vs previous period' },
  { key: 'resolution', label: 'AVERAGE RESOLUTION TIME', value: '2.4 days', delta: '−18%', good: true, note: 'vs previous period' },
  { key: 'critical', label: 'CRITICAL INCIDENTS', value: '12', delta: '−6%', good: true, note: 'vs previous period' },
];

/* Incident volume by problem category, sorted high → low */
export const ANALYTICS_CATEGORIES = [
  { name: 'Flooding', count: 342 },
  { name: 'Road Damage', count: 296 },
  { name: 'Garbage', count: 218 },
  { name: 'Drainage', count: 187 },
  { name: 'Streetlight', count: 142 },
  { name: 'Water Supply', count: 98 },
  { name: 'Infrastructure', count: 74 },
  { name: 'Other', count: 27 },
];

/* Average resolution time by category (days) */
export const ANALYTICS_RESOLUTION = [
  { name: 'Flooding', days: 3.8 },
  { name: 'Road Damage', days: 3.1 },
  { name: 'Drainage', days: 2.6 },
  { name: 'Streetlight', days: 2.2 },
  { name: 'Garbage', days: 1.9 },
];

/* Incident priority distribution (counts sum to 1,284) */
export const ANALYTICS_PRIORITY = [
  { key: 'critical', label: 'Critical', count: 12 },
  { key: 'high', label: 'High', count: 87 },
  { key: 'medium', label: 'Medium', count: 472 },
  { key: 'low', label: 'Low', count: 713 },
];

/* Geographic problem concentration (demo zones) */
export const ANALYTICS_HOTSPOTS = [
  { rank: 1, zone: 'Zone 3', category: 'Flooding', count: 42, trend: '+18%' },
  { rank: 2, zone: 'Zone 2', category: 'Road Damage', count: 31, trend: '+6%' },
  { rank: 3, zone: 'Zone 5', category: 'Garbage', count: 27, trend: '−3%' },
  { rank: 4, zone: 'Zone 1', category: 'Drainage', count: 21, trend: '+2%' },
];

/* Recurring problem trends — monthly incident counts by category */
export const ANALYTICS_TREND = {
  months: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  categories: {
    Flooding: [21, 24, 31, 38, 35, 42, 29, 22, 26, 33, 44, 48],
    'Road Damage': [18, 17, 20, 22, 24, 23, 25, 21, 19, 23, 26, 27],
    Garbage: [15, 14, 16, 17, 16, 18, 17, 15, 14, 16, 18, 17],
    Drainage: [11, 12, 14, 16, 15, 17, 13, 11, 12, 15, 19, 21],
  },
};

/* AI decision-support insights (advisory only — always paired with
   the human-verification disclaimer) */
export const ANALYTICS_AI_INSIGHTS = [
  {
    id: 'AI-INS-041',
    headline: 'Flooding reports increased 42% in Zone 3.',
    summary: 'Fourteen flooding reports were filed within a 500 m radius of Riverside Road in the last 14 days, compared with the trailing 30-day baseline.',
    confidence: 92,
    incidents: 14,
    zone: 'Zone 3',
    range: 'Aug 24 – Sep 6, 2026',
  },
  {
    id: 'AI-INS-038',
    headline: 'Drainage-related complaints are recurring along Riverside Road.',
    summary: 'Pattern detection flags a recurring drainage cluster: nine reports at the same road segment since June, recurring within 72 hours of heavy rainfall.',
    confidence: 87,
    incidents: 9,
    zone: 'Zone 3 · Riverside Road',
    range: 'Jun 1 – Sep 6, 2026',
  },
  {
    id: 'AI-INS-045',
    headline: 'Three similar incidents were detected within the same geographic cluster.',
    summary: 'Unresolved garbage and sanitation reports in Zone 5 share timing and location characteristics, suggesting a shared collection-schedule cause.',
    confidence: 81,
    incidents: 3,
    zone: 'Zone 5',
    range: 'Sep 2 – Sep 6, 2026',
  },
];

/* Response performance vs previous period */
export const ANALYTICS_RESPONSE = [
  { label: 'Average Response Time', value: '4.6 hrs', prev: '5.1 hrs', delta: '−10%', good: true },
  { label: 'Average Resolution Time', value: '2.4 days', prev: '2.9 days', delta: '−18%', good: true },
  { label: 'Open Incidents', value: '38', prev: '45', delta: '−16%', good: true },
  { label: 'Resolved Incidents', value: '186', prev: '174', delta: '+7%', good: true },
  { label: 'Reopened Incidents', value: '9', prev: '14', delta: '−36%', good: true },
];

/* Monthly operational overview */
export const ANALYTICS_MONTHLY = [
  { month: 'Jan', reports: 182, verified: 141, resolved: 128, avg: '3.2 days', critical: 9 },
  { month: 'Feb', reports: 194, verified: 158, resolved: 143, avg: '2.9 days', critical: 11 },
  { month: 'Mar', reports: 207, verified: 166, resolved: 152, avg: '2.7 days', critical: 8 },
  { month: 'Apr', reports: 199, verified: 161, resolved: 149, avg: '2.6 days', critical: 10 },
  { month: 'May', reports: 188, verified: 154, resolved: 146, avg: '2.5 days', critical: 7 },
  { month: 'Jun', reports: 176, verified: 139, resolved: 133, avg: '2.4 days', critical: 6 },
  { month: 'Jul', reports: 191, verified: 157, resolved: 148, avg: '2.4 days', critical: 8 },
  { month: 'Aug', reports: 203, verified: 168, resolved: 159, avg: '2.3 days', critical: 9 },
  { month: 'Sep', reports: 144, verified: 118, resolved: 104, avg: '2.2 days', critical: 12 },
];

/* Filter dimension options for the analytics page */
export const ANALYTICS_FILTERS = {
  barangays: ['San Isidro Barangay'],
  zones: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
  categories: ANALYTICS_CATEGORIES.map((c) => c.name),
  priorities: ['Critical', 'High', 'Medium', 'Low'],
  statuses: ['All Reports', 'Submitted Only', 'Verified Only'],
};
