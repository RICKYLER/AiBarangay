import { apiGet, apiPost } from './client';
import type { ReviewDetail, ReviewQueueItem } from '@/types/api';

export async function fetchReviewQueue() {
  return apiGet<{ reports: ReviewQueueItem[] }>('/api/barangay/review-queue');
}

export async function fetchReviewDetail(id: string) {
  return apiGet<ReviewDetail>(`/api/barangay/reports/${encodeURIComponent(id)}`);
}

export async function verifyReport(id: string, priorityId?: string) {
  return apiPost<{ ok: boolean; incidentNumber: string; incidentId: string }>(
    `/api/barangay/reports/${encodeURIComponent(id)}/verify`,
    priorityId ? { priorityId } : {}
  );
}

export async function rejectReport(id: string, reason?: string) {
  return apiPost<{ ok: boolean }>(
    `/api/barangay/reports/${encodeURIComponent(id)}/reject`,
    reason ? { reason } : {}
  );
}
