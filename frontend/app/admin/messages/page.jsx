'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, Send, Loader2, Users } from 'lucide-react';
import { PageHeader, Card, SearchInput, FilterSelect, FilterBar, EmptyState } from '@/components/gov';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';

/** Roles that may answer on behalf of a desk (matches chat RLS). */
const DESK_REPLY_ROLES = ['BARANGAY_ADMIN', 'BARANGAY_STAFF', 'DESK_OFFICER'];

/* No gov-visually-hidden utility — inline the same trick. */
const VISUALLY_HIDDEN = {
  position: 'absolute', width: 1, height: 1, padding: 0,
  margin: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap', border: 0,
};

function timeLabel(iso) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
  }
  const days = Math.floor((now - d) / 86_400_000);
  if (days < 7) return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * AdminMessages — the desk inbox. Every conversation between
 * residents and this barangay's desks (RLS-scoped: a DESK_OFFICER
 * only sees their own desk's threads). Replying posts as the desk.
 */
export default function AdminMessages() {
  const { user } = useAuth();
  const {
    threads, loading, error, totalUnread,
    activeId, messages, sending,
    selectThread, send,
  } = useChat();

  const [search, setSearch] = useState('');
  const [deskFilter, setDeskFilter] = useState('All');
  const [draft, setDraft] = useState('');
  const bodyRef = useRef(null);

  const canReply = user ? DESK_REPLY_ROLES.includes(user.role) : false;
  const active = (threads || []).find((t) => t.id === activeId);

  const deskOptions = useMemo(
    () => ['All', ...Array.from(new Set((threads || []).map((t) => t.desk_name))).sort()],
    [threads]
  );

  const visibleThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (threads || []).filter((t) => {
      if (deskFilter !== 'All' && t.desk_name !== deskFilter) return false;
      if (!q) return true;
      return (
        t.resident_name.toLowerCase().includes(q)
        || (t.subject || '').toLowerCase().includes(q)
        || (t.last_body || '').toLowerCase().includes(q)
      );
    });
  }, [threads, search, deskFilter]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, activeId]);

  const submit = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeId || !canReply) return;
    setDraft('');
    try {
      await send(text);
    } catch { /* hook surfaces the error */ }
  };

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle={
          user?.role === 'DESK_OFFICER'
            ? 'Resident conversations for your desk. You reply on the desk\'s behalf.'
            : 'Resident conversations across this barangay\'s desks.'
        }
      />

      <FilterBar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search residents, subjects, or messages…"
          width={280}
        />
        <FilterSelect
          label="Desk"
          value={deskFilter}
          onChange={setDeskFilter}
          options={deskOptions.slice(1)}
          hideLabel
        />
        <span className="gov-badge teal" style={{ marginLeft: 'auto' }}>
          {totalUnread > 0 ? `${totalUnread} unread` : 'All read'}
        </span>
      </FilterBar>

      <div className="gov-chat-layout">
        {/* Thread list */}
        <Card title="Conversations" icon={MessageSquare} flush>
          <div className="gov-chat-list" role="list" aria-label="Conversations">
            {loading && (
              <div className="gov-chat-list-state">
                <Loader2 size={18} className="gov-spin" aria-hidden="true" /> Loading…
              </div>
            )}
            {error && <div className="gov-chat-list-state gov-chat-error" role="alert">{error}</div>}
            {!loading && !error && visibleThreads.length === 0 && (
              <div className="gov-chat-list-state">
                {threads && threads.length === 0
                  ? 'No resident conversations yet.'
                  : 'No conversations match this filter.'}
              </div>
            )}
            {visibleThreads.map((t) => (
              <button
                key={t.id}
                type="button"
                role="listitem"
                className={`gov-chat-item ${t.id === activeId ? 'active' : ''} ${t.unread > 0 ? 'unread' : ''}`}
                aria-current={t.id === activeId ? 'true' : undefined}
                onClick={() => selectThread(t.id)}
              >
                <span className="gov-chat-item-top">
                  <span className="gov-chat-item-name">{t.resident_name}</span>
                  <span className="gov-chat-item-time">{timeLabel(t.last_at)}</span>
                </span>
                <span className="gov-chat-item-desk">{t.desk_name}{t.subject ? ` · ${t.subject}` : ''}</span>
                <span className="gov-chat-item-preview">
                  {t.last_side === 'RESIDENT' ? '' : 'You: '}{t.last_body || 'No messages yet'}
                </span>
                {t.unread > 0 && <span className="gov-chat-item-badge">{t.unread}</span>}
              </button>
            ))}
          </div>
        </Card>

        {/* Conversation */}
        <Card
          title={active ? active.resident_name : 'Conversation'}
          subtitle={active
            ? `${active.desk_name}${active.subject ? ` · ${active.subject}` : ''}`
            : 'Select a conversation to read and reply'}
          icon={Users}
          flush
        >
          {active ? (
            <div className="gov-chat-panel">
              <div className="gov-chat-body" aria-live="polite" ref={bodyRef}>
                {(messages || []).map((m) => (
                  <div key={m.id} className={`gov-chat-msg ${m.side === 'DESK' ? 'me' : 'them'}`}>
                    <span className="gov-chat-bubble">{m.body}</span>
                    <span className="gov-chat-msg-time">
                      {m.sender_name} · {timeLabel(m.created_at)}
                    </span>
                  </div>
                ))}
                {messages === null && (
                  <div className="gov-chat-list-state">Loading messages…</div>
                )}
                {messages && messages.length === 0 && (
                  <div className="gov-chat-list-state">No messages yet.</div>
                )}
              </div>

              {canReply ? (
                <form className="gov-chat-composer" onSubmit={submit}>
                  <label htmlFor="gov-chat-input" style={VISUALLY_HIDDEN}>Write a reply</label>                  <input
                    id="gov-chat-input"
                    type="text"
                    className="gov-input"
                    placeholder="Reply as the desk…"
                    value={draft}
                    maxLength={2000}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="gov-btn gov-btn-primary"
                    disabled={!draft.trim() || sending}
                  >
                    {sending
                      ? <Loader2 size={15} className="gov-spin" aria-hidden="true" />
                      : <Send size={15} aria-hidden="true" />}
                    Send
                  </button>
                </form>
              ) : (
                <div className="gov-chat-composer gov-chat-readonly">
                  Your role can view these conversations but not reply.
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="No conversation selected"
              sub="Pick a conversation from the list to read the full exchange and reply."
            />
          )}
        </Card>
      </div>
    </>
  );
}
