/* ============================================================
   PUBLIC WEBSITE DATA & CONFIGURATION
   ------------------------------------------------------------
   PUBLIC_CONFIG.lgu is the deployment's LGU identity block.
   Change these values (name, contacts, branding) to configure
   the public website for a different barangay — nothing here
   is intended to be hard-coded into components.
   All statistics, announcements, and contact numbers are
   SAMPLE / DEMONSTRATION DATA and are labeled as such in the UI.
   ============================================================ */

export const PUBLIC_CONFIG = {
  siteName: 'AI Barangay Problem Mapper',
  brandTop: 'AI BARANGAY',
  brandBottom: 'PROBLEM MAPPER',
  subtitle: 'Community Problem Reporting & Response Platform',

  /* Configurable LGU / Barangay identity */
  lgu: {
    name: 'San Isidro Barangay',
    type: 'Local Government Unit',
    municipality: 'City of Tagum · Davao del Norte',
    lastUpdated: 'September 6, 2026',
    office: 'San Isidro Barangay Hall',
    address: 'Barangay Hall Compound, National Highway (sample address)',
    hours: 'Monday–Friday · 8:00 AM – 5:00 PM',
    phone: '(084) 000-0000',
    email: 'san-isidro@demo.barangay.gov.ph',
  },

  serviceStatement: 'OFFICIAL COMMUNITY DIGITAL SERVICE',
};

export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/community-map', label: 'Community Map' },
  { to: '/about', label: 'About' },
  { to: '/help', label: 'Help' },
];

export const REPORT_ROUTE = '/register'; // residents report through the resident portal
export const LOGIN_ROUTE = '/login';

/* ---------------- Trust / service bar ---------------- */
export const TRUST_ITEMS = [
  {
    key: 'reporting',
    icon: 'Inbox',
    title: 'COMMUNITY REPORTING',
    text: 'Easy problem submission',
  },
  {
    key: 'location',
    icon: 'MapPinned',
    title: 'LOCATION INTELLIGENCE',
    text: 'Understand where problems occur',
  },
  {
    key: 'ai',
    icon: 'Cpu',
    title: 'AI-ASSISTED ANALYSIS',
    text: 'Identify patterns faster',
  },
  {
    key: 'human',
    icon: 'ShieldCheck',
    title: 'HUMAN VERIFICATION',
    text: 'Government personnel make final decisions',
  },
];

/* ---------------- Impact metrics (SAMPLE DATA) ---------------- */
export const IMPACT_STATS = [
  { value: '1,284', label: 'Community Reports', icon: 'Inbox' },
  { value: '186', label: 'Verified Incidents', icon: 'ShieldCheck' },
  { value: '142', label: 'Resolved Problems', icon: 'CheckCircle2' },
  { value: '24', label: 'Currently Under Review', icon: 'FileSearch' },
];

/* ---------------- How it works ---------------- */
export const PROCESS_STEPS = [
  {
    num: '01',
    key: 'report',
    title: 'REPORT',
    text: 'Residents submit a community problem.',
    detail:
      'Any registered resident can report a problem in minutes — describe the issue, pin the location on the community map, and attach photos as evidence.',
  },
  {
    num: '02',
    key: 'analyze',
    title: 'ANALYZE',
    text: 'AI assists with classification, location analysis, priority assessment, and duplicate detection.',
    detail:
      'The system suggests a category, checks the map area for related reports, and flags reports that may need urgent attention. Every suggestion is advisory.',
  },
  {
    num: '03',
    key: 'verify',
    title: 'VERIFY',
    text: 'Authorized barangay personnel review and verify the report.',
    detail:
      'A barangay officer checks the evidence, confirms the problem is real, and either verifies it as an official incident or returns it for more information.',
  },
  {
    num: '04',
    key: 'respond',
    title: 'RESPOND',
    text: 'The appropriate office or personnel handles the incident and updates its status.',
    detail:
      'Verified incidents are assigned to the right office — engineering, sanitation, electrical, or drainage — and residents can follow progress until resolution.',
  },
];

/* ---------------- Reportable problems ---------------- */
export const REPORT_CATEGORIES = [
  { key: 'flooding', label: 'Flooding', icon: 'CloudRain', text: 'Flooded streets, drainage overflow, and heavy rain hazards.' },
  { key: 'roads', label: 'Road Damage', icon: 'Route', text: 'Potholes, cracked pavement, and damaged pathways.' },
  { key: 'garbage', label: 'Garbage', icon: 'Trash2', text: 'Uncollected waste, illegal dumping, and sanitation concerns.' },
  { key: 'streetlights', label: 'Broken Streetlights', icon: 'Lightbulb', text: 'Dark streets and faulty public lighting.' },
  { key: 'water', label: 'Water Problems', icon: 'Droplets', text: 'Leaks, interruptions, and unsafe water supply.' },
  { key: 'drainage', label: 'Drainage', icon: 'Waves', text: 'Blocked or damaged canals and drainage systems.' },
  { key: 'infrastructure', label: 'Public Infrastructure', icon: 'Building2', text: 'Damaged facilities, signs, and public structures.' },
  { key: 'environment', label: 'Environmental Issues', icon: 'Leaf', text: 'Pollution, tree hazards, and environmental concerns.' },
  { key: 'other', label: 'Other Community Concerns', icon: 'HelpCircle', text: 'Anything else the barangay should know about.' },
];

/* ---------------- Public map (anonymized, sample markers) ----------------
   Coordinates are percentage positions on the map mockup. */
export const MAP_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'flooding', label: 'Flooding' },
  { key: 'roads', label: 'Roads' },
  { key: 'garbage', label: 'Garbage' },
  { key: 'water', label: 'Water' },
  { key: 'infrastructure', label: 'Infrastructure' },
];

export const MAP_CATEGORIES = {
  flooding: { label: 'Flooding', color: '#2b6cb8' },
  roads: { label: 'Roads', color: '#b45309' },
  garbage: { label: 'Garbage', color: '#6b7280' },
  water: { label: 'Water', color: '#0e7490' },
  infrastructure: { label: 'Infrastructure', color: '#8b5cf6' },
};

export const MAP_ZONES = [
  { label: 'ZONE 1', x: 22, y: 26, r: 15 },
  { label: 'ZONE 2', x: 66, y: 30, r: 17 },
  { label: 'ZONE 3', x: 42, y: 68, r: 19 },
];

export const MAP_MARKERS = [
  { id: 'm01', category: 'flooding', level: 'critical', x: 44, y: 66 },
  { id: 'm02', category: 'flooding', level: 'standard', x: 49, y: 72 },
  { id: 'm03', category: 'flooding', level: 'standard', x: 38, y: 74 },
  { id: 'm04', category: 'roads', level: 'high', x: 68, y: 28 },
  { id: 'm05', category: 'roads', level: 'standard', x: 73, y: 35 },
  { id: 'm06', category: 'garbage', level: 'standard', x: 20, y: 30 },
  { id: 'm07', category: 'garbage', level: 'standard', x: 26, y: 22 },
  { id: 'm08', category: 'water', level: 'high', x: 24, y: 62 },
  { id: 'm09', category: 'water', level: 'standard', x: 15, y: 52 },
  { id: 'm10', category: 'infrastructure', level: 'standard', x: 60, y: 44 },
  { id: 'm11', category: 'infrastructure', level: 'standard', x: 80, y: 55 },
  { id: 'm12', category: 'garbage', level: 'low', x: 56, y: 24 },
  { id: 'm13', category: 'roads', level: 'standard', x: 33, y: 46 },
  { id: 'm14', category: 'water', level: 'low', x: 88, y: 32 },
];

export const MAP_HOTSPOTS = [
  { label: 'Flooding hotspot — Zone 3', x: 44, y: 68, r: 13 },
  { label: 'Road damage cluster — Zone 2', x: 68, y: 29, r: 10 },
];

/* ---------------- Transparency timeline ---------------- */
export const REPORT_JOURNEY = [
  { key: 'submitted', label: 'Submitted', text: 'Your report is received and time-stamped.' },
  { key: 'review', label: 'Under Review', text: 'Barangay personnel examine the report and evidence.' },
  { key: 'verified', label: 'Verified', text: 'The problem is confirmed as a real community incident.' },
  { key: 'assigned', label: 'Assigned', text: 'The incident is routed to the responsible office.' },
  { key: 'response', label: 'Field Response', text: 'Personnel address the problem on site.' },
  { key: 'resolved', label: 'Resolved', text: 'The incident is closed and the resolution is recorded.' },
];

/* ---------------- AI capabilities ---------------- */
export const AI_CAPABILITIES = [
  { key: 'classification', icon: 'Tags', title: 'REPORT CLASSIFICATION', text: 'Helps organize incoming reports.' },
  { key: 'duplicates', icon: 'Copy', title: 'DUPLICATE DETECTION', text: 'Identifies potentially related reports.' },
  { key: 'priority', icon: 'Flag', title: 'PRIORITY ANALYSIS', text: 'Helps identify reports requiring attention.' },
  { key: 'patterns', icon: 'LineChart', title: 'PATTERN DETECTION', text: 'Helps identify recurring community problems.' },
];

/* ---------------- Privacy & trust ---------------- */
export const PRIVACY_ITEMS = [
  {
    key: 'protection',
    icon: 'Lock',
    title: 'Privacy Protection',
    text: 'Reports are handled according to applicable privacy and security requirements.',
  },
  {
    key: 'anonymized',
    icon: 'MapPinned',
    title: 'Anonymized Public Map',
    text: 'Public map information does not expose resident identity.',
  },
  {
    key: 'verification',
    icon: 'ShieldCheck',
    title: 'Human Verification',
    text: 'AI recommendations are reviewed by authorized personnel.',
  },
  {
    key: 'secure',
    icon: 'KeyRound',
    title: 'Secure Access',
    text: 'Private resident information is only available to authorized users.',
  },
];

/* ---------------- Community impact flow ---------------- */
export const IMPACT_FLOW = [
  { key: 'report', label: 'Resident Report', icon: 'Inbox' },
  { key: 'analysis', label: 'AI-Assisted Analysis', icon: 'Cpu' },
  { key: 'verification', label: 'Barangay Verification', icon: 'ShieldCheck' },
  { key: 'response', label: 'Field Response', icon: 'HardHat' },
  { key: 'resolution', label: 'Resolution', icon: 'CheckCircle2' },
  { key: 'improvement', label: 'Community Improvement', icon: 'TrendingUp' },
];

/* ---------------- Announcements (DEMO CONTENT) ---------------- */
export const ANNOUNCEMENTS = [
  {
    id: 'a1',
    date: 'Sep 12, 2026',
    category: 'Community Event',
    title: 'Barangay Clean-up Drive',
    text: 'Join the quarterly community clean-up. Assembly at the barangay hall covered court at 6:00 AM.',
  },
  {
    id: 'a2',
    date: 'Sep 18, 2026',
    category: 'Advisory',
    title: 'Community Drainage Inspection',
    text: 'Drainage canals along Riverside Road will be inspected and cleared. Expect minor traffic on affected streets.',
  },
  {
    id: 'a3',
    date: 'Sep 22, 2026',
    category: 'Schedule',
    title: 'Road Maintenance Schedule',
    text: 'Pothole repairs along the main highway service road are scheduled. Motorists are advised to use alternate routes.',
  },
  {
    id: 'a4',
    date: 'Sep 25, 2026',
    category: 'Public Safety',
    title: 'Public Safety Advisory',
    text: 'Report broken streetlights in your area through the platform to help keep walkways safe at night.',
  },
];

/* ---------------- Emergency contacts (DEMO NUMBERS) ---------------- */
export const EMERGENCY_CONTACTS = [
  { key: 'hall', icon: 'Building2', label: 'Barangay Hall', value: '(084) 000-0000', note: 'San Isidro Barangay Office' },
  { key: 'hotline', icon: 'PhoneCall', label: 'Emergency Hotline', value: '911', note: 'National emergency number' },
  { key: 'police', icon: 'Shield', label: 'Police', value: '(084) 000-0101', note: 'Local police station' },
  { key: 'fire', icon: 'Flame', label: 'Fire', value: '(084) 000-0102', note: 'Bureau of Fire Protection' },
  { key: 'medical', icon: 'HeartPulse', label: 'Medical Emergency', value: '(084) 000-0103', note: 'Nearest hospital emergency room' },
];

/* ---------------- Footer ---------------- */
export const FOOTER_SERVICES = [
  { to: '/register', label: 'Report a Problem' },
  { to: '/community-map', label: 'Community Map' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/help', label: 'Help Center' },
];

export const FOOTER_INFORMATION = [
  { to: '/about', label: 'About' },
  { to: '/help#privacy', label: 'Privacy' },
  { to: '/help#accessibility', label: 'Accessibility' },
  { to: '/help#terms', label: 'Terms' },
];

export const HELP_TOPICS = [
  {
    key: 'report',
    icon: 'Inbox',
    title: 'How do I report a problem?',
    text: 'Create a resident account or sign in, choose Report a Problem, describe the issue, pin the location, and attach photos. Your report is time-stamped and routed to barangay personnel.',
  },
  {
    key: 'track',
    icon: 'Route',
    title: 'How can I track my report?',
    text: 'Sign in and open My Reports. Every report shows its current stage — submitted, under review, verified, assigned, field response, or resolved.',
  },
  {
    key: 'map',
    icon: 'MapPinned',
    title: 'What is shown on the public map?',
    text: 'The community map shows anonymized reports and emerging hotspots only. It never displays your name, contact details, or exact household location.',
  },
  {
    key: 'ai',
    icon: 'Cpu',
    title: 'Does AI decide what happens to my report?',
    text: 'No. The system uses AI to help organize and prioritize reports, but every verification and decision is made by authorized barangay personnel.',
  },
  {
    key: 'account',
    icon: 'UserPlus',
    title: 'Who can create an account?',
    text: 'Any resident of the barangay can create a resident account to report problems and track their progress. Barangay personnel use a separate, authorized login.',
  },
  {
    key: 'privacy',
    icon: 'Lock',
    title: 'How is my information protected?',
    text: 'Your personal information is visible only to authorized personnel who handle your report. Public map data is anonymized. See the Privacy section for details.',
  },
];
