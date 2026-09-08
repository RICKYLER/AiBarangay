/** Shared API types — mirror the backend's query results. */

export type Role =
  | 'RESIDENT'
  | 'DESK_OFFICER'
  | 'BARANGAY_ADMIN'
  | 'BARANGAY_STAFF'
  | 'FIELD_PERSONNEL'
  | 'OFFICE_HEAD'
  | 'LGU_ADMIN'
  | 'SYSTEM_ADMIN';

export const STAFF_ROLES: Role[] = [
  'BARANGAY_ADMIN', 'BARANGAY_STAFF', 'FIELD_PERSONNEL', 'OFFICE_HEAD', 'LGU_ADMIN', 'SYSTEM_ADMIN',
];

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: Role;
  barangayId: string | null;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

/** Row of v_resident_reports */
export interface ResidentReport {
  id: string;
  report_number: string;
  title: string;
  description: string;
  category: string | null;
  category_icon: string | null;
  status: string | null;
  priority: string | null;
  priority_color: string | null;
  submitted_at: string;
  verified_at: string | null;
  closed_at: string | null;
  incident_number: string | null;
  address: string | null;
  barangay_id: string | null;
  latitude: number | null;
  longitude: number | null;
  is_resolved: boolean;
  media_count: number;
}

export interface ReportMedia {
  id: string;
  file_url: string;
  file_type: string;
  mime_type: string | null;
  created_at: string;
}

export interface TimelineEntry {
  kind: 'status' | 'field' | 'resolution';
  at: string;
  text: string;
}

export interface ReportDetail {
  report: ResidentReport;
  media: ReportMedia[];
  timeline: TimelineEntry[];
}

/** Row of v_barangay_review_queue */
export interface ReviewQueueItem {
  id: string;
  report_number: string;
  title: string;
  description: string;
  submitted_at: string;
  category: string | null;
  category_color: string | null;
  barangay_id: string | null;
  barangay: string | null;
  zone: string | null;
  latitude: number | null;
  longitude: number | null;
  resident_name: string | null;
  analysis_type: string | null;
  ai_summary: string | null;
  ai_category: string | null;
  ai_priority: string | null;
  ai_confidence: number | null;
  suggested_priority: string | null;
  pending_duplicate_flags: number;
}

export interface AiAnalysis {
  id: string;
  model_name: string;
  model_version: string | null;
  analysis_type: string;
  summary: string | null;
  confidence_score: number | null;
  detected_keywords: string[];
  category_prediction_name: string | null;
  priority_prediction_name: string | null;
  created_at: string;
}

export interface DuplicateMatch {
  id: string;
  similarity_score: number;
  match_type: string;
  review_status: string;
  matched_report_number: string;
  matched_report_title: string;
}

export interface ReviewDetail {
  report: ResidentReport;
  media: ReportMedia[];
  analyses: AiAnalysis[];
  duplicates: DuplicateMatch[];
  suggestedPriority: { name: string; level: number; color: string | null } | null;
  residentName?: string;
  barangayName?: string | null;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
}

export interface Barangay {
  id: string;
  name: string;
  code: string | null;
  population: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface MapIncident {
  id: string;
  incident_number: string;
  category: string | null;
  category_color: string | null;
  priority: string | null;
  status: string | null;
  latitude: number;
  longitude: number;
  barangay: string | null;
  verified_at: string;
}

export interface MapHotspot {
  barangay: string;
  category: string | null;
  latitude: number;
  longitude: number;
  radius_meters: number;
  incident_count: number;
  severity_score: number | null;
}

export interface CreateReportResult {
  ok: boolean;
  reportNumber: string;
  reportId: string;
  ai: {
    priority: string;
    confidence: number;
    summary: string;
    duplicateCandidates: number;
  };
}

/* ---------- Chat (resident ↔ barangay desk) ---------- */

export interface ChatDesk {
  id: string;
  name: string;
  description: string | null;
}

export interface ChatThread {
  id: string;
  subject: string | null;
  resident_name: string;
  desk_name: string;
  created_at: string;
  last_body: string | null;
  last_side: 'RESIDENT' | 'DESK';
  last_at: string;
  last_sender: string | null;
  unread: number;
}

export interface ChatMessage {
  id: string;
  sender_name: string;
  side: 'RESIDENT' | 'DESK';
  body: string;
  read_at: string | null;
  created_at: string;
}
