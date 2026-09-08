export const MOCK_RESIDENT_REPORTS = [
  {
    id: 'RPT-2026-001284',
    title: 'Severe Urban Flooding & Blocked Drainage',
    category: 'Flooding',
    zone: 'Zone 3 (Riverside Road)',
    barangay: 'Barangay Magugpo Poblacion',
    city: 'Tagum City',
    dateSubmitted: 'Sept 6, 2026 — 08:30 AM',
    status: 'Under Review',
    statusStep: 2, // 1: Submitted, 2: Under Review, 3: Verified, 4: Assigned, 5: In Progress, 6: Resolved
    priority: 'HIGH PRIORITY',
    severity: 'High',
    description: 'Water has accumulated along Riverside Road after heavy rainfall. Drainage culvert is completely blocked by silt and debris.',
    images: [
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=800&q=80'
    ],
    officialUpdate: 'Drainage inspection has been scheduled by Tagum City Engineering.',
    lastUpdated: 'Sept 6, 2026 — 03:42 PM',
    aiConfidence: 94,
    aiDuplicateRisk: 12,
    aiRecommendation: 'Consider drainage inspection and high-capacity pump deployment along Riverside Road.'
  },
  {
    id: 'RPT-2026-001283',
    title: 'Broken Solar Streetlight Fixture',
    category: 'Streetlight',
    zone: 'Zone 2 (Pioneer Extension)',
    barangay: 'Barangay Magugpo Poblacion',
    city: 'Tagum City',
    dateSubmitted: 'Sept 5, 2026 — 06:15 PM',
    status: 'Resolved',
    statusStep: 6,
    priority: 'MEDIUM PRIORITY',
    severity: 'Medium',
    description: 'Streetlight lamp has been flickering and is now completely out of service near the alley entrance.',
    images: [
      'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80'
    ],
    officialUpdate: 'Electrical team replaced battery module and LED bulb unit.',
    lastUpdated: 'Sept 6, 2026 — 10:15 AM',
    aiConfidence: 91,
    aiDuplicateRisk: 5,
    aiRecommendation: 'Routine streetlight battery replacement.'
  },
  {
    id: 'RPT-2026-001280',
    title: 'Uncollected Commercial Waste Dump',
    category: 'Garbage',
    barangay: 'Barangay Visayan Village',
    zone: 'Zone 5 (Sobrecarey St)',
    city: 'Tagum City',
    dateSubmitted: 'Sept 4, 2026 — 02:40 PM',
    status: 'In Progress',
    statusStep: 5,
    priority: 'MEDIUM PRIORITY',
    severity: 'Medium',
    description: 'Commercial waste accumulation along sidewalk creating foul odor and health concerns.',
    images: [
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
    ],
    officialUpdate: 'CENRO Tagum Garbage Truck Unit 4 en route for clearing.',
    lastUpdated: 'Sept 6, 2026 — 01:20 PM',
    aiConfidence: 93,
    aiDuplicateRisk: 8,
    aiRecommendation: 'Issue sanitation violation notice to commercial food vendor.'
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    time: '10 minutes ago',
    dateGroup: 'Today',
    text: 'Your report RPT-2026-001284 was verified by Tagum Review Officer.',
    read: false
  },
  {
    id: 2,
    time: '1 hour ago',
    dateGroup: 'Today',
    text: 'Your report RPT-2026-001284 has been assigned to Tagum City Engineering Office.',
    read: false
  },
  {
    id: 3,
    time: 'Yesterday',
    dateGroup: 'Yesterday',
    text: 'Your report RPT-2026-001283 (Broken Streetlight) was marked as Resolved.',
    read: true
  }
];

export const MOCK_MESSAGES = [
  {
    id: 1,
    sender: 'Tagum Barangay Duty Desk',
    role: 'Official',
    time: '09:42 AM',
    text: 'Good morning Ricky. Your flooding report RPT-2026-001284 has been verified by our team.'
  },
  {
    id: 2,
    sender: 'Tagum Barangay Duty Desk',
    role: 'Official',
    time: '10:05 AM',
    text: 'A field inspection by Tagum City Engineering has been scheduled for today at 2:00 PM.'
  },
  {
    id: 3,
    sender: 'Ricky Dela Cruz',
    role: 'Resident',
    time: '10:12 AM',
    text: 'Thank you very much! The water level is still knee-high on Riverside Road.'
  }
];

export const MOCK_INCIDENTS_ADMIN = [
  {
    id: 'INC-2026-0186',
    reportId: 'RPT-2026-001284',
    title: 'Severe Flooding on Riverside Road',
    category: 'Flooding',
    zone: 'Zone 3',
    barangay: 'Magugpo Poblacion',
    priority: 'CRITICAL',
    status: 'VERIFIED',
    assignedOffice: 'Public Works & Engineering',
    assignedPersonnel: 'Juan Dela Cruz',
    lat: 7.4475,
    lng: 125.8055
  },
  {
    id: 'INC-2026-0182',
    reportId: 'RPT-2026-001282',
    title: 'Deep Pothole Cluster',
    category: 'Road Damage',
    zone: 'Zone 2',
    barangay: 'Mankilam',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedOffice: 'City Highways Unit',
    assignedPersonnel: 'Juan Dela Cruz',
    lat: 7.4612,
    lng: 125.8021
  },
  {
    id: 'INC-2026-0181',
    reportId: 'RPT-2026-001280',
    title: 'Commercial Garbage Accumulation',
    category: 'Garbage',
    zone: 'Zone 5',
    barangay: 'Visayan Village',
    priority: 'MEDIUM',
    status: 'ON_SITE',
    assignedOffice: 'CENRO Tagum',
    assignedPersonnel: 'Maria Santos',
    lat: 7.4395,
    lng: 125.8152
  }
];
