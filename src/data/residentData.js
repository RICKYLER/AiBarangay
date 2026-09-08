/**
 * residentData.js — demo data for the Resident Portal.
 *
 * The Resident Portal is the citizen-facing application: simple language,
 * personal reports, updates, and community information. No administrative
 * data, no AI internals, no operational detail beyond what a resident
 * needs to track their own report.
 *
 * All records are SAMPLE / DEMONSTRATION data.
 */

/* ------------------------------------------------------------------ */
/* Resident identity (demo)                                            */
/* ------------------------------------------------------------------ */
export const RESIDENT = {
  name: 'Ricky Dela Cruz',
  firstName: 'Ricky',
  email: 'ricky.delacruz@example.com',
  mobile: '+63 917 000 0000',
  barangay: 'Barangay Magugpo Poblacion',
  zone: 'Zone 3',
  memberSince: 'January 2026',
  initial: 'R',
};

/* ------------------------------------------------------------------ */
/* Report categories (Step 1 of the reporting wizard)                  */
/* ------------------------------------------------------------------ */
export const REPORT_CATEGORIES = [
  { key: 'flooding',      label: 'Flooding',            icon: 'Droplets',      hint: 'Standing water, flooded streets' },
  { key: 'road',          label: 'Road Damage',         icon: 'Construction',  hint: 'Potholes, cracked pavement' },
  { key: 'garbage',       label: 'Garbage',             icon: 'Trash2',        hint: 'Uncollected or dumped waste' },
  { key: 'streetlight',   label: 'Broken Streetlight',  icon: 'LightbulbOff',  hint: 'Lights out or flickering' },
  { key: 'water',         label: 'Water Supply',        icon: 'GlassWater',    hint: 'No water, low pressure, leaks' },
  { key: 'drainage',      label: 'Drainage',            icon: 'Waves',         hint: 'Blocked or overflowing canals' },
  { key: 'infrastructure', label: 'Public Infrastructure', icon: 'Landmark',   hint: 'Benches, signs, waiting sheds' },
  { key: 'environment',   label: 'Environment',         icon: 'TreePine',      hint: 'Cut trees, pollution, odors' },
  { key: 'other',         label: 'Other',               icon: 'HelpCircle',    hint: 'Anything else in the community' },
];

/* ------------------------------------------------------------------ */
/* Zones                                                               */
/* ------------------------------------------------------------------ */
export const ZONES = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6', 'Zone 7'];

/* ------------------------------------------------------------------ */
/* The resident's own reports — 12 total:                              */
/* 2 Under Review · 3 In Progress · 7 Resolved                         */
/* ------------------------------------------------------------------ */
export const MY_REPORTS = [
  {
    id: 'RPT-2026-001284',
    category: 'Flooding',
    categoryKey: 'flooding',
    title: 'Flooding along Riverside Road',
    location: 'Riverside Road, Zone 3',
    zone: 'Zone 3',
    dateSubmitted: 'September 6, 2026',
    lastUpdated: '2 hours ago',
    status: 'In Progress',
    stage: 5, /* 1 Submitted · 2 Under Review · 3 Verified · 4 Assigned · 5 Field Response · 6 Resolved */
    description:
      'Water accumulates along Riverside Road after heavy rainfall. The drainage culvert appears blocked by silt and debris, and the water reaches knee height near the junction.',
    photos: 2,
    update:
      'A drainage inspection has been scheduled. Field personnel will assess the blocked culvert along Riverside Road.',
    updates: [
      { date: '2 hours ago', text: 'Field response underway — drainage crew dispatched to Riverside Road.' },
      { date: 'Yesterday', text: 'Report assigned to the Barangay Field Response Team.' },
      { date: 'September 6, 2026', text: 'Report verified by authorized barangay personnel.' },
      { date: 'September 6, 2026', text: 'Report submitted and received.' },
    ],
  },
  {
    id: 'RPT-2026-001283',
    category: 'Road Damage',
    categoryKey: 'road',
    title: 'Deep pothole on Pioneer Extension',
    location: 'Pioneer Extension, Zone 2',
    zone: 'Zone 2',
    dateSubmitted: 'September 5, 2026',
    lastUpdated: '5 hours ago',
    status: 'In Progress',
    stage: 5,
    description:
      'A deep pothole has formed near the alley entrance. It fills with water when it rains and is difficult to see, especially at night.',
    photos: 1,
    update: 'Road patching crew scheduled. Area will be cordoned off during repairs.',
    updates: [
      { date: '5 hours ago', text: 'Field response underway — road patching crew scheduled.' },
      { date: 'September 5, 2026', text: 'Report assigned to the Barangay Field Response Team.' },
      { date: 'September 5, 2026', text: 'Report verified by authorized barangay personnel.' },
      { date: 'September 5, 2026', text: 'Report submitted and received.' },
    ],
  },
  {
    id: 'RPT-2026-001280',
    category: 'Garbage',
    categoryKey: 'garbage',
    title: 'Uncollected garbage on Sobrecarey Street',
    location: 'Sobrecarey Street, Zone 5',
    zone: 'Zone 5',
    dateSubmitted: 'September 4, 2026',
    lastUpdated: '1 day ago',
    status: 'In Progress',
    stage: 5,
    description:
      'Garbage bags have not been collected for several days along the sidewalk, causing a foul odor and attracting pests.',
    photos: 1,
    update: 'Collection truck assigned. Clearing scheduled within the collection round.',
    updates: [
      { date: '1 day ago', text: 'Field response underway — collection truck assigned.' },
      { date: 'September 4, 2026', text: 'Report assigned to the garbage collection unit.' },
      { date: 'September 4, 2026', text: 'Report verified by authorized barangay personnel.' },
      { date: 'September 4, 2026', text: 'Report submitted and received.' },
    ],
  },
  {
    id: 'RPT-2026-001278',
    category: 'Water Supply',
    categoryKey: 'water',
    title: 'Low water pressure in Zone 3',
    location: 'Mabini Street, Zone 3',
    zone: 'Zone 3',
    dateSubmitted: 'September 3, 2026',
    lastUpdated: '1 day ago',
    status: 'Under Review',
    stage: 2,
    description:
      'Water pressure has been very low since Tuesday, especially in the mornings. Neighbors on the same street report the same problem.',
    photos: 0,
    update: 'Your report is being reviewed by authorized barangay personnel.',
    updates: [
      { date: 'September 3, 2026', text: 'Report submitted and received.' },
    ],
  },
  {
    id: 'RPT-2026-001275',
    category: 'Environment',
    categoryKey: 'environment',
    title: 'Burning of leaves and yard waste',
    location: 'Empty lot, Zone 6',
    zone: 'Zone 6',
    dateSubmitted: 'September 2, 2026',
    lastUpdated: '2 days ago',
    status: 'Under Review',
    stage: 2,
    description:
      'Yard waste is being burned in the empty lot in the afternoons. The smoke drifts into nearby homes and affects children with asthma.',
    photos: 1,
    update: 'Your report is being reviewed by authorized barangay personnel.',
    updates: [
      { date: 'September 2, 2026', text: 'Report submitted and received.' },
    ],
  },
  {
    id: 'RPT-2026-001271',
    category: 'Broken Streetlight',
    categoryKey: 'streetlight',
    title: 'Streetlight out near the chapel',
    location: 'Chapel Road, Zone 1',
    zone: 'Zone 1',
    dateSubmitted: 'August 30, 2026',
    lastUpdated: 'August 31, 2026',
    status: 'Resolved',
    stage: 6,
    description:
      'The streetlight near the chapel entrance has been completely out for a week. The area is very dark at night.',
    photos: 1,
    update: 'The lamp and battery module were replaced. Light is working again.',
    updates: [
      { date: 'August 31, 2026', text: 'Problem resolved — lamp unit replaced and tested.' },
      { date: 'August 30, 2026', text: 'Field response underway — electrical team dispatched.' },
      { date: 'August 30, 2026', text: 'Report assigned to the electrical maintenance team.' },
      { date: 'August 30, 2026', text: 'Report verified by authorized barangay personnel.' },
      { date: 'August 30, 2026', text: 'Report submitted and received.' },
    ],
  },
  {
    id: 'RPT-2026-001268',
    category: 'Drainage',
    categoryKey: 'drainage',
    title: 'Blocked canal behind the market',
    location: 'Market Back Road, Zone 4',
    zone: 'Zone 4',
    dateSubmitted: 'August 28, 2026',
    lastUpdated: 'August 29, 2026',
    status: 'Resolved',
    stage: 6,
    description:
      'The canal behind the market is blocked with plastic and organic waste. Water overflows onto the path when it rains.',
    photos: 2,
    update: 'Canal cleared and desilted. Water flows normally again.',
    updates: [
      { date: 'August 29, 2026', text: 'Problem resolved — canal cleared and desilted.' },
      { date: 'August 28, 2026', text: 'Field response underway — canal clearing crew dispatched.' },
      { date: 'August 28, 2026', text: 'Report verified by authorized barangay personnel.' },
      { date: 'August 28, 2026', text: 'Report submitted and received.' },
    ],
  },
  {
    id: 'RPT-2026-001264',
    category: 'Road Damage',
    categoryKey: 'road',
    title: 'Cracked pavement at the basketball court',
    location: 'Court Street, Zone 2',
    zone: 'Zone 2',
    dateSubmitted: 'August 25, 2026',
    lastUpdated: 'August 27, 2026',
    status: 'Resolved',
    stage: 6,
    description:
      'The pavement near the basketball court has cracked and pieces are loose. Someone could trip, especially children playing in the afternoon.',
    photos: 1,
    update: 'Pavement patched and leveled.',
    updates: [
      { date: 'August 27, 2026', text: 'Problem resolved — pavement patched.' },
      { date: 'August 25, 2026', text: 'Report submitted and received.' },
    ],
  },
  {
    id: 'RPT-2026-001260',
    category: 'Public Infrastructure',
    categoryKey: 'infrastructure',
    title: 'Broken bench at the waiting shed',
    location: 'National Highway, Zone 3',
    zone: 'Zone 3',
    dateSubmitted: 'August 22, 2026',
    lastUpdated: 'August 24, 2026',
    status: 'Resolved',
    stage: 6,
    description: 'One of the benches at the waiting shed is broken and has sharp exposed edges.',
    photos: 1,
    update: 'Bench replaced with a new unit.',
    updates: [
      { date: 'August 24, 2026', text: 'Problem resolved — bench replaced.' },
      { date: 'August 22, 2026', text: 'Report submitted and received.' },
    ],
  },
  {
    id: 'RPT-2026-001255',
    category: 'Flooding',
    categoryKey: 'flooding',
    title: 'Flooded pathway after heavy rain',
    location: 'Ipil Street, Zone 3',
    zone: 'Zone 3',
    dateSubmitted: 'August 18, 2026',
    lastUpdated: 'August 20, 2026',
    status: 'Resolved',
    stage: 6,
    description: 'The pathway beside Ipil Street floods after heavy rain, making it hard to pass on foot.',
    photos: 1,
    update: 'Drainage inlet cleaned; flooding subsided and pathway cleared.',
    updates: [
      { date: 'August 20, 2026', text: 'Problem resolved — drainage inlet cleaned.' },
      { date: 'August 18, 2026', text: 'Report submitted and received.' },
    ],
  },
  {
    id: 'RPT-2026-001249',
    category: 'Garbage',
    categoryKey: 'garbage',
    title: 'Illegal dump near the creek',
    location: 'Creek Side Road, Zone 7',
    zone: 'Zone 7',
    dateSubmitted: 'August 12, 2026',
    lastUpdated: 'August 14, 2026',
    status: 'Resolved',
    stage: 6,
    description: 'Household waste is being dumped near the creek, blocking the waterway.',
    photos: 2,
    update: 'Waste cleared and a clean-up drive was conducted in the area.',
    updates: [
      { date: 'August 14, 2026', text: 'Problem resolved — waste cleared.' },
      { date: 'August 12, 2026', text: 'Report submitted and received.' },
    ],
  },
  {
    id: 'RPT-2026-001243',
    category: 'Other',
    categoryKey: 'other',
    title: 'Stray dogs near the school gate',
    location: 'School Gate Road, Zone 1',
    zone: 'Zone 1',
    dateSubmitted: 'August 5, 2026',
    lastUpdated: 'August 7, 2026',
    status: 'Resolved',
    stage: 6,
    description: 'A group of stray dogs stays near the school gate during dismissal time.',
    photos: 0,
    update: 'Dogs were rescued and turned over to the city pound.',
    updates: [
      { date: 'August 7, 2026', text: 'Problem resolved — dogs rescued.' },
      { date: 'August 5, 2026', text: 'Report submitted and received.' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Notifications (demo)                                                */
/* ------------------------------------------------------------------ */
export const NOTIFICATIONS = [
  {
    id: 1, type: 'update',  group: 'Today', time: '10:24 AM', read: false,
    title: 'Field response underway',
    text: 'Your flooding report RPT-2026-001284 is now being handled by the field response team.',
  },
  {
    id: 2, type: 'update',  group: 'Today', time: '8:02 AM', read: false,
    title: 'Report assigned',
    text: 'Report RPT-2026-001283 has been assigned to the road maintenance crew.',
  },
  {
    id: 3, type: 'resolved', group: 'Yesterday', time: '4:45 PM', read: false,
    title: 'Problem resolved',
    text: 'Your streetlight report RPT-2026-001271 has been resolved. Thank you for reporting.',
  },
  {
    id: 4, type: 'message', group: 'Yesterday', time: '9:42 AM', read: true,
    title: 'New message from the Barangay Duty Desk',
    text: 'Your flooding report RPT-2026-001284 has been verified by our team.',
  },
  {
    id: 5, type: 'verified', group: 'This Week', time: 'Aug 30', read: true,
    title: 'Report verified',
    text: 'Report RPT-2026-001268 was verified by authorized barangay personnel.',
  },
  {
    id: 6, type: 'announce', group: 'This Week', time: 'Aug 28', read: true,
    title: 'Community clean-up drive',
    text: 'A barangay clean-up drive will be held this Saturday. Residents are welcome to join.',
  },
];

/* ------------------------------------------------------------------ */
/* Message threads (demo)                                              */
/* ------------------------------------------------------------------ */
export const MESSAGE_THREADS = [
  {
    id: 1,
    with: 'Barangay Duty Desk',
    subject: 'Report RPT-2026-001284 — Flooding',
    lastTime: '10:12 AM',
    unread: 1,
    messages: [
      { id: 1, from: 'them', time: '09:42 AM', text: 'Good morning Ricky. Your flooding report RPT-2026-001284 has been verified by our team.' },
      { id: 2, from: 'them', time: '10:05 AM', text: 'A field inspection has been scheduled for today. You may see personnel along Riverside Road this afternoon.' },
      { id: 3, from: 'me',   time: '10:12 AM', text: 'Thank you! The water level is still high near the junction. Please be careful there.' },
    ],
  },
  {
    id: 2,
    with: 'Barangay Health Office',
    subject: 'Clean-up drive — question',
    lastTime: 'Aug 28',
    unread: 0,
    messages: [
      { id: 1, from: 'me',   time: 'Aug 27', text: 'Good day. Can residents volunteer for the clean-up drive on Saturday?' },
      { id: 2, from: 'them', time: 'Aug 28', text: 'Yes! Volunteers are welcome. Please proceed to the barangay hall at 6:00 AM with gloves and water. Thank you for your interest.' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Help topics (demo)                                                  */
/* ------------------------------------------------------------------ */
export const RESIDENT_HELP_TOPICS = [
  {
    key: 'how-report',
    q: 'How do I report a problem?',
    a: 'Tap "Report a Problem", choose the category that best matches the issue, describe what happened, mark the location, and add photos if you have them. You will receive a reference number you can use to track your report.',
  },
  {
    key: 'track',
    q: 'How can I track my report?',
    a: 'Open "My Reports" to see all of your reports and their current status. Select any report to view its full history, from submission to resolution.',
  },
  {
    key: 'how-long',
    q: 'How long does a report take to resolve?',
    a: 'It depends on the type of problem. Simple issues like broken streetlights are often resolved within a few days. Larger problems such as flooding or road damage may take longer because they involve field inspection and coordination.',
  },
  {
    key: 'privacy',
    q: 'Who can see my report?',
    a: 'Your name and contact details are never shown on the public community map. Authorized barangay personnel can see your report details so they can respond to it and update you.',
  },
  {
    key: 'photos',
    q: 'Do I need to add photos?',
    a: 'No, photos are optional — but they help barangay personnel understand the problem faster, which usually leads to a faster response.',
  },
];

/* ------------------------------------------------------------------ */
/* Community map (anonymized, demo) — Tagum City, Davao del Norte      */
/* ------------------------------------------------------------------ */

/* City center used to frame the map (Tagum City poblacion) */
export const TAGUM_CENTER = [7.4487, 125.8096];

export const COMMUNITY_MAP_CATEGORIES = {
  flooding:      { label: 'Flooding',      color: '#2b6cb8' },
  road:          { label: 'Roads',         color: '#b45309' },
  garbage:       { label: 'Garbage',       color: '#6b7280' },
  water:         { label: 'Water',         color: '#0e7490' },
  infrastructure: { label: 'Infrastructure', color: '#8b5cf6' },
};

export const COMMUNITY_MAP_MARKERS = [
  { id: 1, category: 'flooding', lat: 7.4382, lng: 125.7995, level: 'critical' },
  { id: 2, category: 'road', lat: 7.4512, lng: 125.8121, level: 'normal' },
  { id: 3, category: 'garbage', lat: 7.4433, lng: 125.8163, level: 'normal' },
  { id: 4, category: 'water', lat: 7.4562, lng: 125.8083, level: 'normal' },
  { id: 5, category: 'infrastructure', lat: 7.4470, lng: 125.8185, level: 'normal' },
  { id: 6, category: 'flooding', lat: 7.4593, lng: 125.7963, level: 'normal' },
  { id: 7, category: 'road', lat: 7.4396, lng: 125.8062, level: 'normal' },
  { id: 8, category: 'garbage', lat: 7.4551, lng: 125.8031, level: 'normal' },
  { id: 9, category: 'infrastructure', lat: 7.4421, lng: 125.8238, level: 'normal' },
  { id: 10, category: 'water', lat: 7.4624, lng: 125.8147, level: 'normal' },
];

export const COMMUNITY_MAP_HOTSPOTS = [
  { lat: 7.4382, lng: 125.7995, radius: 700, label: 'Emerging hotspot — frequent flooding reports' },
];

/* ------------------------------------------------------------------ */
/* Status helpers                                                      */
/* ------------------------------------------------------------------ */
export const STATUS_ORDER = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

export const REPORT_STAGES = [
  { n: 1, label: 'Submitted',     hint: 'Report received' },
  { n: 2, label: 'Under Review',  hint: 'Being checked by personnel' },
  { n: 3, label: 'Verified',      hint: 'Confirmed as a real problem' },
  { n: 4, label: 'Assigned',      hint: 'Given to a response team' },
  { n: 5, label: 'Field Response', hint: 'Work is underway' },
  { n: 6, label: 'Resolved',      hint: 'Problem fixed' },
];

/** Derive the summary counts shown on the dashboard. */
export function reportSummary(reports) {
  return {
    total: reports.length,
    underReview: reports.filter((r) => r.status === 'Under Review').length,
    inProgress: reports.filter((r) => r.status === 'In Progress').length,
    resolved: reports.filter((r) => r.status === 'Resolved').length,
  };
}

/** Next reference number for a newly submitted report (demo). */
export function nextReferenceNumber(reports) {
  const max = reports.reduce((acc, r) => {
    const n = parseInt(String(r.id).slice(-6), 10);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `RPT-2026-${String(max + 1).padStart(6, '0')}`;
}
