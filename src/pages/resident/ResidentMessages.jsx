import React, { useState } from 'react';
import { Send, ShieldCheck } from 'lucide-react';
import { MESSAGE_THREADS, RESIDENT } from '../../data/residentData';

/**
 * ResidentMessages — simple conversations between the resident and
 * barangay offices about their reports. Frontend demo: replies are
 * local only.
 */
export default function ResidentMessages() {
  const [threads, setThreads] = useState(MESSAGE_THREADS);
  const [activeId, setActiveId] = useState(threads[0]?.id ?? null);
  const [draft, setDraft] = useState('');
  const [seq, setSeq] = useState(100);

  const active = threads.find((t) => t.id === activeId);

  const selectThread = (id) => {
    setActiveId(id);
    setThreads((list) => list.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
  };

  const send = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !active) return;
    setSeq((s) => s + 1);
    setThreads((list) =>
      list.map((t) =>
        t.id === active.id
          ? {
              ...t,
              lastTime: 'Just now',
              messages: [
                ...t.messages,
                { id: seq, from: 'me', time: 'Just now', text },
              ],
            }
          : t
      )
    );
    setDraft('');
  };

  return (
    <div className="res-msg-layout res-fade">
      {/* Thread list */}
      <div>
        <span className="res-section-eyebrow" style={{ marginBottom: 10, display: 'inline-flex' }}>
          CONVERSATIONS
        </span>
        <div className="res-threads" role="list" aria-label="Message conversations">
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              role="listitem"
              className={`res-thread ${t.id === activeId ? 'active' : ''}`}
              aria-current={t.id === activeId ? 'true' : undefined}
              onClick={() => selectThread(t.id)}
            >
              <span className="res-thread-top">
                <span className="res-thread-name">{t.with}</span>
                <span className="res-thread-time">{t.lastTime}</span>
              </span>
              <span className="res-thread-subject">{t.subject}</span>
              {t.unread > 0 && <span className="res-thread-badge">{t.unread}</span>}
            </button>
          ))}
        </div>

        <div className="res-note" style={{ marginTop: 12 }}>
          <ShieldCheck size={16} aria-hidden="true" />
          <span>
            Messages are between you and authorized barangay offices about
            your reports.
          </span>
        </div>
      </div>

      {/* Conversation */}
      {active && (
        <div className="res-convo">
          <div className="res-convo-head">
            <span className="res-convo-name">{active.with}</span>
            <span className="res-convo-sub">{active.subject}</span>
          </div>

          <div className="res-convo-body" aria-live="polite">
            {active.messages.map((m) => (
              <div key={m.id} className={`res-msg ${m.from === 'me' ? 'me' : 'them'}`}>
                <span className="res-msg-bubble">{m.text}</span>
                <span className="res-msg-time">
                  {m.from === 'me' ? RESIDENT.firstName : active.with} · {m.time}
                </span>
              </div>
            ))}
          </div>

          <form className="res-composer" onSubmit={send}>
            <label htmlFor="res-msg-input" className="res-visually-hidden">
              Write a message
            </label>
            <input
              id="res-msg-input"
              type="text"
              className="res-input"
              placeholder="Write a message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              type="submit"
              className="res-btn res-btn-primary"
              disabled={!draft.trim()}
            >
              <Send size={15} aria-hidden="true" /> Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
