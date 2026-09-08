import { apiGet, apiUpload } from './client';
import type { CreateReportResult, ReportDetail, ResidentReport } from '@/types/api';

export async function fetchMyReports() {
  return apiGet<{ reports: ResidentReport[] }>('/api/reports/mine');
}

export async function fetchReport(id: string) {
  return apiGet<ReportDetail>(`/api/reports/${encodeURIComponent(id)}`);
}

export interface CreateReportInput {
  title: string;
  description: string;
  categoryId?: string;
  categoryName?: string;
  latitude: number;
  longitude: number;
  address?: string;
  zone?: string;
  accuracy?: number;
  photo?: File | null;
}

export async function createReport(input: CreateReportInput) {
  const form = new FormData();
  form.set('title', input.title);
  form.set('description', input.description);
  if (input.categoryId) form.set('categoryId', input.categoryId);
  if (input.categoryName) form.set('categoryName', input.categoryName);
  form.set('latitude', String(input.latitude));
  form.set('longitude', String(input.longitude));
  if (input.address) form.set('address', input.address);
  if (input.zone) form.set('zone', input.zone);
  if (input.accuracy != null) form.set('accuracy', String(input.accuracy));
  if (input.photo) form.set('photo', input.photo);

  return apiUpload<CreateReportResult>('/api/reports', form);
}
