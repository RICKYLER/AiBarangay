'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Info, Tags, Copy, Flag, LineChart, MapPinned, MessageSquareText,
  Image as ImageIcon, MapPin, Clock, Cpu, UserRoundCheck, RotateCcw, FileCheck2,
} from 'lucide-react';
import { AI_CAPABILITIES, AI_DEMO } from '@/lib/data/publicData';
import ChapterHead from './ChapterHead';
import { Reveal, useReducedMotion } from './scroll/scrollFx';

const ICONS = { Tags, Copy, Flag, LineChart, MapPinned, MessageSquareText };

/* Phase timings (ms) for the analysis sequence:
   input → analyzing → outputs 1..4 → verification. */
const T_ANALYZE = 900;
const T_OUTPUT = 700;
const T_VERIFY = 800;

/**
 * AiIntelligence — chapter 04: what the AI actually does.
 *
 * The centerpiece is a live demonstration of one raw resident report
 * (text + photos + location) being transformed, step by step, into
 * structured incident intelligence: category, priority, duplicate
 * detection, location analysis — and finally the human verification
 * that alone turns it into an official incident.
 *
 * The sequence auto-plays once when the panel scrolls into view and
 * can be replayed. Each step is a CSS transition toggled by a class,
 * so the animation stays on the compositor; under
 * prefers-reduced-motion the pipeline renders in its final state.
 *
 * The capability grid and the decision-support note below restate the
 * platform's honest position: AI recommends, people decide.
 */
export default function AiIntelligence() {
  const panelRef = useRef(null);
  const [phase, setPhase] = useState(0); // 0 idle · 1 analyzing · 2..5 outputs · 6 verified
  const [started, setStarted] = useState(false);
  const reduced = useReducedMotion();
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const run = useCallback(() => {
    clearTimers();
    setPhase(0);
    if (reduced) {
      setPhase(6);
      return;
    }
    const seq = [
      [T_ANALYZE, () => setPhase(1)],
      [T_OUTPUT, () => setPhase(2)],
      [T_OUTPUT, () => setPhase(3)],
      [T_OUTPUT, () => setPhase(4)],
      [T_OUTPUT, () => setPhase(5)],
      [T_VERIFY, () => setPhase(6)],
    ];
    let acc = 120;
    seq.forEach(([wait, fn]) => {
      acc += wait;
      timers.current.push(setTimeout(fn, acc));
    });
  }, [reduced]);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          run();
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => { io.disconnect(); clearTimers(); };
  }, [run]);

  const analyzing = started && phase >= 1 && phase < 6;
  const outputOn = (i) => (reduced ? true : started && phase >= i + 2);
  const verified = reduced ? true : phase >= 6;

  return (
    <section className="pub-st-chapter ai alt" aria-labelledby="pub-st-ai-title">
      <div className="pub-container">
        <ChapterHead
          index="04"
          eyebrow="AI INTELLIGENCE"
          title={<>From plain words<br />to incident intelligence.</>}
          sub="Residents describe problems in everyday language. The system transforms each report into structured intelligence that helps barangay personnel act faster — while people stay in charge of every decision."
          id="pub-st-ai-title"
        />

        {/* ---- Interactive pipeline demonstration ---- */}
        <div className="pub-st-ai-demo" ref={panelRef}>
          <div className="pub-st-ai-demo-toolbar">
            <span className="pub-st-ai-demo-badge">INTERACTIVE · SAMPLE DATA</span>
            <button
              type="button"
              className="pub-st-ai-replay"
              onClick={run}
            >
              <RotateCcw size={13} aria-hidden="true" />
              Replay analysis
            </button>
          </div>

          <div className="pub-st-ai-demo-grid">
            {/* INPUT — what the resident submits */}
            <article className="pub-st-ai-card input">
              <header className="pub-st-ai-card-head">
                <span className="pub-st-ai-card-tag">INPUT</span>
                <h3 className="pub-st-ai-card-title">Raw resident report</h3>
              </header>

              <blockquote className="pub-st-ai-quote">
                {AI_DEMO.input.text}
              </blockquote>
              <p className="pub-st-ai-quote-note">{AI_DEMO.input.textNote}</p>

              <ul className="pub-st-ai-input-meta">
                <li><ImageIcon size={13} aria-hidden="true" />{AI_DEMO.input.image}</li>
                <li><MapPin size={13} aria-hidden="true" />{AI_DEMO.input.location}</li>
                <li><Clock size={13} aria-hidden="true" />{AI_DEMO.input.time}</li>
              </ul>
            </article>

            {/* PROCESSOR — the AI analysis step */}
            <div className="pub-st-ai-processor" aria-hidden="true">
              <span className={`pub-st-ai-processor-node ${analyzing ? 'working' : ''} ${verified ? 'done' : ''}`}>
                <Cpu size={22} strokeWidth={1.8} />
              </span>
              <span className="pub-st-ai-processor-label">AI ANALYSIS</span>
              <span className="pub-st-ai-processor-flow">
                <i /><i /><i />
              </span>
            </div>

            {/* OUTPUT — structured intelligence */}
            <article className="pub-st-ai-card output">
              <header className="pub-st-ai-card-head">
                <span className="pub-st-ai-card-tag teal">OUTPUT</span>
                <h3 className="pub-st-ai-card-title">Structured incident intelligence</h3>
              </header>

              <ul className="pub-st-ai-outputs">
                {AI_DEMO.outputs.map((o, i) => (
                  <li
                    key={o.key}
                    className={`pub-st-ai-output ${outputOn(i) ? 'on' : ''}`}
                  >
                    <span className="pub-st-ai-output-label">
                      {o.label}
                    </span>
                    <span className="pub-st-ai-output-value">{o.value}</span>
                    <span className="pub-st-ai-output-flag">{o.confidence}</span>
                  </li>
                ))}
              </ul>

              {/* HUMAN VERIFICATION — the final and deciding step */}
              <div className={`pub-st-ai-verify ${verified ? 'on' : ''}`}>
                <span className="pub-st-ai-verify-icon" aria-hidden="true">
                  <UserRoundCheck size={17} />
                </span>
                <div>
                  <strong className="pub-st-ai-verify-title">HUMAN VERIFICATION</strong>
                  <p className="pub-st-ai-verify-text">{AI_DEMO.verification}</p>
                </div>
                <span className="pub-st-ai-verify-stamp" aria-hidden="true">
                  <FileCheck2 size={30} strokeWidth={1.4} />
                </span>
              </div>
            </article>
          </div>

          <p className="pub-st-ai-demo-caption">
            Text + image + location → AI analysis → recommendations → human verification.
            The AI output above is advisory; the incident exists only because a person confirmed it.
          </p>
        </div>

        {/* ---- Capabilities ---- */}
        <Reveal kind="up" className="pub-st-ai-caps-head">
          <h3 className="pub-st-ai-caps-title">How the AI assists barangay personnel</h3>
        </Reveal>
        <div className="pub-st-ai-caps">
          {AI_CAPABILITIES.map((cap, i) => {
            const Icon = ICONS[cap.icon];
            return (
              <Reveal
                as="article"
                key={cap.key}
                kind="up"
                delay={i * 80}
                className="pub-st-ai-cap"
              >
                <span className="pub-st-ai-cap-icon" aria-hidden="true">
                  {Icon && <Icon size={18} strokeWidth={1.9} />}
                </span>
                <h4 className="pub-st-ai-cap-title">{cap.title}</h4>
                <p className="pub-st-ai-cap-text">{cap.text}</p>
              </Reveal>
            );
          })}
        </div>

        <Reveal kind="up">
          <div className="pub-ai-note" role="note">
            <Info size={18} aria-hidden="true" />
            <span>
              <strong>AI provides decision support only.</strong> Final verification
              and decisions remain with authorized human personnel. The system never
              issues penalties, approvals, or government decisions on its own.
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
