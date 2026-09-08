import { apiGet } from './client';
import type { Barangay, Category } from '@/types/api';

export async function fetchCategories() {
  return apiGet<{ categories: Category[] }>('/api/lookups/categories');
}

export async function fetchBarangays() {
  return apiGet<{ barangays: Barangay[] }>('/api/lookups/barangays');
}
