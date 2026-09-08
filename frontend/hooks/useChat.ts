'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchChatDesks, fetchChatMessages, fetchChatThreads,
  sendChatMessage, startChatThread,
} from '@/lib/api/chat';
import type { ChatDesk, ChatThread, ChatMessage } from '@/types/api';

/**
 * useChat — resident ↔ desk conversations, shared by the resident
 * Messages page and the admin desk inbox.
 *
 * Polls the thread list (15s) and the open conversation (8s) while
 * the tab is visible — same low-tech approach as the notification
 * polling. No websockets needed.
 */
export function useChat() {
  const [threads, setThreads] = useState<ChatThread[] | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const [viewerSide, setViewerSide] = useState<'RESIDENT' | 'DESK'>('RESIDENT');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [activeMeta, setActiveMeta] = useState<ChatThread | null>(null);
  const [sending, setSending] = useState(false);

  /* Desks for the "start a conversation" picker (resident page). */
  const [desks, setDesks] = useState<ChatDesk[] | null>(null);

  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  const reloadThreads = useCallback(async () => {
    try {
      const data = await fetchChatThreads();
      setThreads(data.threads);
      setTotalUnread(data.totalUnread);
      setViewerSide(data.viewerSide);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  const reloadDesks = useCallback(async () => {
    try {
      const data = await fetchChatDesks();
      setDesks(data.desks);
    } catch { /* picker stays empty; thread list shows the real error */ }
  }, []);

  useEffect(() => {
    void reloadThreads();
    void reloadDesks();
  }, [reloadThreads, reloadDesks]);

  /* Poll the thread list while the tab is visible. */
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') void reloadThreads();
    }, 15_000);
    return () => clearInterval(t);
  }, [reloadThreads]);

  /* Load + poll the open conversation. Opening it marks the other
     side's messages read (the GET endpoint does this server-side). */
  useEffect(() => {
    if (!activeId) {
      setMessages(null);
      setActiveMeta(null);
      return;
    }
    let alive = true;

    const load = async () => {
      try {
        const data = await fetchChatMessages(activeId);
        if (!alive) return;
        setMessages(data.messages);
        setActiveMeta((prev) => prev ?? null);
        const t = data.thread;
        setThreads((list) => (list || []).map((x) => (
          x.id === t.id
            ? { ...x, subject: t.subject, resident_name: t.resident_name, desk_name: t.desk_name, unread: 0 }
            : x
        )));
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : 'Could not load messages.');
      }
    };
    void load();

    const t = setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, 8_000);

    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [activeId]);

  const selectThread = useCallback((id: string | null) => {
    setActiveId(id);
    setMessages(null);
    setThreads((list) => (list || []).map((x) => (x.id === id ? { ...x, unread: 0 } : x)));
    setTotalUnread((n) => {
      const thread = (threads || []).find((x) => x.id === id);
      return Math.max(0, n - (thread?.unread || 0));
    });
  }, [threads]);

  const send = useCallback(async (body: string) => {
    const text = body.trim();
    if (!text || !activeIdRef.current || sending) return;
    setSending(true);
    try {
      const { message } = await sendChatMessage(activeIdRef.current, text);
      setMessages((list) => [...(list || []), message]);
      void reloadThreads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Your message was not sent.');
      throw err;
    } finally {
      setSending(false);
    }
  }, [sending, reloadThreads]);

  const startThread = useCallback(async (deskId: string, subject?: string) => {
    const { thread } = await startChatThread(deskId, subject);
    await reloadThreads();
    setActiveId(thread.id);
    setMessages(null);
    return thread.id;
  }, [reloadThreads]);

  return {
    threads, totalUnread, viewerSide, loading, error,
    activeId, messages, activeMeta, sending, desks,
    selectThread, send, startThread, reloadThreads,
  };
}
