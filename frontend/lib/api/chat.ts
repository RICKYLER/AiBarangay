import { apiGet, apiPost } from './client';
import type { ChatDesk, ChatMessage, ChatThread } from '@/types/api';

export async function fetchChatDesks() {
  return apiGet<{ desks: ChatDesk[] }>('/api/chat/desks');
}

export async function fetchChatThreads() {
  return apiGet<{
    threads: ChatThread[];
    totalUnread: number;
    viewerSide: 'RESIDENT' | 'DESK';
  }>('/api/chat/threads');
}

export async function startChatThread(deskId: string, subject?: string) {
  return apiPost<{ ok: boolean; thread: { id: string } }>(
    '/api/chat/threads',
    { deskId, subject: subject || undefined }
  );
}

export async function fetchChatMessages(threadId: string) {
  return apiGet<{
    thread: { id: string; subject: string | null; resident_name: string; desk_name: string; created_at: string };
    messages: ChatMessage[];
    viewerSide: 'RESIDENT' | 'DESK';
  }>(`/api/chat/threads/${encodeURIComponent(threadId)}/messages`);
}

export async function sendChatMessage(threadId: string, body: string) {
  return apiPost<{ ok: boolean; message: ChatMessage }>(
    `/api/chat/threads/${encodeURIComponent(threadId)}/messages`,
    { body }
  );
}
