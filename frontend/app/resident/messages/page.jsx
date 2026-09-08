'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Send, ShieldCheck, Plus, Loader2, MessageSquare, ArrowLeft } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';

function timeLabel(iso) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
  }
  const days = Math.floor((now - d) / 86_400_000);
  if (days < 7) return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * ResidentMessages — real conversations with barangay desks
 * (GET/POST /api/chat/*). Desks are shared inboxes; the desk's
 * officers reply on the desk's behalf.
 */
export default function ResidentMessages() {
  const { user } = useAuth();
  const {
    threads, loading, error, desks,
    activeId, messages, sending,
    selectThread, send, startThread,
  } = useChat();

  const [draft, setDraft] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDesk, setNewDesk] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);

  const active = (threads || []).find((t) => t.id === activeId);
  const bodyRef = useRef(null);

  /* Keep the conversation scrolled to the newest message. */
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, activeId]);

  const submit = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeId) return;
    setDraft('');
    try {
      await send(text);
    } catch { /* hook surfaces the error; keep the draft cleared */ }
  };

  const submitNew = async (e) => {
    e.preventDefault();
    if (!newDesk || starting) return;
    setStarting(true);
    setStartError(null);
    try {
      await startThread(newDesk, newSubject.trim() || undefined);
      setShowNew(false);
      setNewSubject('');
      setNewDesk('');
    } catch (err) {
      setStartError(err instanceof Error ? err.message : 'Could not start the conversation.');
    } finally {
      setStarting(false);
    }
  };

  const myName = user ? user.firstName : 'You';

  return (
    <div className="res-msg-layout res-fade">
      {/* Thread list */}
      <div>
        <span className="res-section-eyebrow" style={{ marginBottom: 10, display: 'inline-flex' }}>
          CONVERSATIONS
        </span>

        <button
          type="button"
          className="res-btn res-btn-primary"
          style={{ width: '100%', marginBottom: 10 }}
          onClick={() => setShowNew((v) => !v)}
        >
          <Plus size={15} aria-hidden="true" />
          {showNew ? 'Cancel' : 'New conversation'}
        </button>

        {showNew && (
          <form
            className="res-thread"
            style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10, padding: 15 }}
            onSubmit={submitNew}
          >
            {startError && <p className="res-error" role="alert">{startError}</p>}
            <label className="res-label" htmlFor="new-desk">Message which desk?</label>
            <select
              id="new-desk"
              className="res-input"
              value={newDesk}
              onChange={(e) => setNewDesk(e.target.value)}
              required
            >
              <option value="" disabled>Choose a desk…</option>
              {(desks || []).map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <label className="res-label" htmlFor="new-subject">Subject (optional)</label>
            <input
              id="new-subject"
              type="text"
              className="res-input"
              placeholder="e.g. Follow-up on my flooding report"
              value={newSubject}
              maxLength={200}
              onChange={(e) => setNewSubject(e.target.value)}
            />
            <button type="submit" className="res-btn res-btn-primary" disabled={!newDesk || starting}>
              {starting ? <Loader2 size={15} className="res-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
              Start conversation
            </button>
          </form>
        )}

        {error && <p className="res-error" role="alert">{error}</p>}

        {loading ? (
          <p className="res-empty">Loading conversations…</p>
        ) : (
          <div className="res-threads" role="list" aria-label="Message conversations">
            {(threads || []).map((t) => (
              <button
                key={t.id}
                type="button"
                role="listitem"
                className={`res-thread ${t.id === activeId ? 'active' : ''}`}
                aria-current={t.id === activeId ? 'true' : undefined}
                onClick={() => selectThread(t.id)}
              >
                <span className="res-thread-top">
                  <span className="res-thread-name">{t.desk_name}</span>
                  <span className="res-thread-time">{timeLabel(t.last_at)}</span>
                </span>
                <span className="res-thread-subject">{t.subject || t.last_body || 'No messages yet'}</span>
                {t.unread > 0 && <span className="res-thread-badge">{t.unread}</span>}
              </button>
            ))}
            {threads && threads.length === 0 && (
              <p className="res-empty">
                No conversations yet. Start one above — the barangay desk will see your message.
              </p>
            )}
          </div>
        )}

        <div className="res-note" style={{ marginTop: 12 }}>
          <ShieldCheck size={16} aria-hidden="true" />
          <span>
            Messages are between you and authorized barangay desks about
            your reports.
          </span>
        </div>
      </div>

      {/* Conversation */}
      {active ? (
        <div className="res-convo">
          <div className="res-convo-head">
            <button
              type="button"
              className="res-convo-back"
              aria-label="Back to conversations"
              onClick={() => selectThread(null)}
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
            <span className="res-convo-name">{active.desk_name}</span>
            <span className="res-convo-sub">{active.subject || 'Conversation'}</span>
          </div>

          <div className="res-convo-body" aria-live="polite" ref={bodyRef}>
            {(messages || []).map((m) => (
              <div key={m.id} className={`res-msg ${m.side === 'RESIDENT' ? 'me' : 'them'}`}>
                <span className="res-msg-bubble">{m.body}</span>
                <span className="res-msg-time">
                  {m.side === 'RESIDENT' ? myName : m.sender_name} · {timeLabel(m.created_at)}
                </span>
              </div>
            ))}
            {messages === null && <p className="res-empty">Loading messages…</p>}
            {messages && messages.length === 0 && (
              <p className="res-empty">No messages yet — say hello.</p>
            )}
          </div>

          <form className="res-composer" onSubmit={submit}>
            <label htmlFor="res-msg-input" className="res-visually-hidden">
              Write a message
            </label>
            <input
              id="res-msg-input"
              type="text"
              className="res-input"
              placeholder="Write a message…"
              value={draft}
              maxLength={2000}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              type="submit"
              className="res-btn res-btn-primary"
              disabled={!draft.trim() || sending}
            >
              <Send size={15} aria-hidden="true" /> Send
            </button>
          </form>
        </div>
      ) : (
        <div className="res-convo res-convo-placeholder">
          <MessageSquare size={28} aria-hidden="true" />
          <p>Select a conversation, or start a new one with a barangay desk.</p>
        </div>
      )}
    </div>
  );
}
