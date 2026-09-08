import { apiGet, apiPost } from './client';
import type { User } from '@/types/api';

export async function register(input: {
  fullName: string;
  email: string;
  mobile: string;
  barangay: string;
  zone?: string;
  password: string;
}) {
  return apiPost<{ ok: boolean; resent?: boolean; email: string }>('/api/auth/register', input);
}

export async function login(email: string, password: string) {
  return apiPost<{ ok: boolean; user: User }>('/api/auth/login', { email, password });
}

export async function logout() {
  return apiPost<{ ok: boolean }>('/api/auth/logout');
}

export async function me() {
  return apiGet<{ user: User }>('/api/auth/me');
}

export async function resendVerification(email: string) {
  return apiPost<{ ok: boolean }>('/api/auth/resend', { email });
}
