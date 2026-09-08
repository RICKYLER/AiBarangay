import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Send, ClipboardCheck, ShieldCheck, UserRoundCheck, HardHat, CircleCheck,
  LogIn, ArrowRight,
} from 'lucide-react';
import { animate, createScope, createTimeline, onScroll } from 'animejs';
import { LOGIN_ROUTE, REPORT_ROUTE } from '../../data/publicData';
import { useReducedMotion } from './scroll/scrollFx';

/* The six-stage lifecycle of a resident report. `tone` picks the card's
   accent: dark #1F6F5F / teal #2FA084 alternate, success #6FCF97 closes. */
const STAGES = [
  { num: '01', title: 'Submitted', text: 'Report received and time-stamped.', icon: Send, tone: 'dark' },
  { num: '02', title: 'Under Review', text: 'Barangay personnel review the report.', icon: ClipboardCheck, tone: 'teal' },
  { num: '03', title: 'Verified', text: 'Problem confirmed as a valid incident.', icon: ShieldCheck, tone: 'dark' },
  { num: '04', title: 'Assigned', text: 'Routed to the responsible office.', icon: UserRoundCheck, tone: 'teal' },
  { num: '05', title: 'Field Response', text: 'Personnel respond on site.', icon: HardHat, tone: 'dark' },
  { num: '06', title: 'Resolved', text: 'Resolution recorded and incident closed.', icon: CircleCheck, tone: 'green' },
];

/* Layout-only box of an element (offsetLeft/Top are unaffected by the
   reveal transform, unlike getBoundingClientRect). */
const layoutBox = (el) => ({
  x: el.offsetLeft,
  y: el.offsetTop,
  w: el.offsetWidth,
  h: el.offsetHeight,
});

/* Scroll-story timing, in timeline milliseconds. The timeline is scrubbed
   by anime.js onScroll(), so these positions carve the section's scroll
   range into six sequential segments: card → connector → card → …
   Card 01 is deliberately short so it is visible as soon as the story
   dwell begins; every later card takes a full segment, and revealed
   cards hold their final state (opacity 1) for the rest of the scroll. */
const SEGMENT = 2000;
const cardPosition = (i) => i * SEGMENT;
const linkPosition = (i) => i * SEGMENT + SEGMENT / 2;

/**
 * TransparencyTimeline — "Where your report goes", told as a
 * scroll-synchronized story.
 *
 * A tall wrapper (.pub-road-scroll) gives the section vertical room; a
 * sticky inner stage (.pub-road-sticky) keeps the zig-zagged six-card
 * roadmap on screen while a single anime.js timeline — synced to scroll
 * progress through onScroll({ sync: true }) — reveals the process one
 * stage at a time: 01 appears, the dotted connector draws, 02 appears,
 * and so on to 06. Scroll position maps directly to story progress; the
 * page itself scrolls normally (no wheel hijacking).
 *
 * Each dotted connector is drawn progressively via a mask path whose
 * stroke-dashoffset animates 1 → 0 (pathLength is normalized to 1), so
 * the dots appear along the line as the user scrolls, exactly between
 * the two cards it joins.
 *
 * Under prefers-reduced-motion the timeline is never created and the
 * CSS layer keeps every stage fully visible.
 */
export default function TransparencyTimeline() {
  const sectionRef = useRef(null);
  const scrollRef = useRef(null);
  const ctaRef = useRef(null);
  const roadRef = useRef(null);
  const cardRefs = useRef([]);
  const linkRefs = useRef([]);
  const drawRefs = useRef([]);
  const [links, setLinks] = useState([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const reduced = useReducedMotion();

  /* ---- Connectors: rebuild dotted paths from the measured layout ---- */
  const measure = useCallback(() => {
    const road = roadRef.current;
    if (!road) return;
    const cards = cardRefs.current.filter(Boolean);
    if (cards.length < 2) return;

    setSize({ w: road.offsetWidth, h: road.offsetHeight });
    const boxes = cards.map(layoutBox);
    const PAD = 10; // breathing room between a card edge and the line

    const next = [];

    for (let i = 0; i < boxes.length - 1; i++) {
      const a = boxes[i];
      const b = boxes[i + 1];
      const aMid = a.y + a.h / 2;
      const bMid = b.y + b.h / 2;
      const horizontal = b.x > a.x + 40 && Math.abs(aMid - bMid) < 72;
      let p1;
      let p2;
      let d;

      if (horizontal) {
        /* same visual row — side to side, gentle S across the gutter */
        p1 = { x: a.x + a.w + PAD, y: aMid };
        p2 = { x: b.x - PAD, y: bMid };
        const dx = p2.x - p1.x;
        d = `M ${p1.x} ${p1.y} C ${p1.x + dx * 0.45} ${p1.y}, ${p2.x - dx * 0.45} ${p2.y}, ${p2.x} ${p2.y}`;
      } else {
        /* staggered row — bottom of one card curving into the top of the next */
        p1 = { x: a.x + a.w / 2, y: a.y + a.h + PAD };
        p2 = { x: b.x + b.w / 2, y: b.y - PAD };
        const dy = p2.y - p1.y;
        d = `M ${p1.x} ${p1.y} C ${p1.x} ${p1.y + dy * 0.5}, ${p2.x} ${p2.y - dy * 0.5}, ${p2.x} ${p2.y}`;
      }
      next.push({ d, dot: { x: p1.x, y: p1.y } });
    }
    setLinks(next);
  }, []);

  useEffect(() => {
    measure();
    const road = roadRef.current;
    const ro = road ? new ResizeObserver(measure) : null;
    if (ro && road) ro.observe(road);
    window.addEventListener('resize', measure);
    /* web fonts change card metrics once loaded — re-measure */
    let cancelled = false;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => !cancelled && measure());
    }
    return () => {
      cancelled = true;
      if (ro) ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  /* ---- The scroll-synchronized story (anime.js onScroll) ----
     One timeline, scrubbed by scroll progress across the tall wrapper:
     its enter/leave window spans the sticky dwell, so 0% → 100% of the
     timeline maps to the user's scroll through the section. Each card
     occupies its own segment; connectors draw in the gaps between them.
     Revealed stages keep their final state as progress grows. */
  useEffect(() => {
    const wrapper = scrollRef.current;
    const cta = ctaRef.current;
    if (!wrapper || reduced) return undefined;

    const scope = createScope({ root: sectionRef.current }).add(() => {
      const tl = createTimeline({
        defaults: {
          duration: 1000,
          ease: 'outCubic',
        },
        autoplay: onScroll({
          target: wrapper,
          axis: 'y',
          enter: 'top center',
          leave: 'bottom bottom',
          sync: true,
        }),
      });

      /* Cards: hidden (CSS) → revealed, one segment each. Card 01 is
         short so the first stage is on screen as the story begins. */
      cardRefs.current.filter(Boolean).forEach((el, i) => {
        tl.add(el, {
          opacity: [0, 1],
          translateY: [40, 0],
          scale: [0.97, 1],
          duration: i === 0 ? 500 : 1000,
        }, cardPosition(i));
      });

      /* Connector groups fade in while their line draws. */
      linkRefs.current.filter(Boolean).forEach((el, i) => {
        tl.add(el, { opacity: [0, 1] }, linkPosition(i));
      });

      /* Connector draw: the mask path's dashoffset 1 → 0 progressively
         unmasks the dotted line, in lock-step with scroll. */
      drawRefs.current.filter(Boolean).forEach((el, i) => {
        tl.add(el, { strokeDashoffset: [1, 0] }, linkPosition(i));
      });

      /* Final CTA — sits after the story wrapper, so it only enters the
         viewport once stage 06 has been scrolled through; it then plays
         one subtle rise (not scrubbed — it lands and stays). */
      if (cta) {
        animate(cta, {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 700,
          ease: 'outCubic',
          autoplay: onScroll({
            target: cta,
            axis: 'y',
            enter: 'bottom center',
          }),
        });
      }
    });

    return () => scope.revert();
  }, [reduced, links]);

  return (
    <section className="pub-section" ref={sectionRef} aria-labelledby="pub-transparency-title">
      <div className="pub-container">
        <div className="pub-section-head center">
          <span className="pub-eyebrow">TRANSPARENCY</span>
          <h2 className="pub-section-title" id="pub-transparency-title">
            WHERE YOUR REPORT GOES
          </h2>
          <p className="pub-section-sub">
            Every report follows a clear, verifiable path — from submission
            to resolution.
          </p>
        </div>

        {/* ---- Scroll space: the tall wrapper the story is mapped to ---- */}
        <div className="pub-road-scroll" ref={scrollRef}>
          <div className="pub-road-sticky">
            <div className="pub-road" ref={roadRef}>
              <svg
                className="pub-road-links"
                width={size.w}
                height={size.h}
                viewBox={`0 0 ${size.w} ${size.h}`}
                aria-hidden="true"
                focusable="no"
              >
                <defs>
                  <marker
                    id="pubRoadArrow"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M0.8 0.8 L9 5 L0.8 9.2 Z" fill="var(--pub-teal)" />
                  </marker>
                  {/* One draw-mask per connector: a solid path (dashoffset
                      1 → 0, pathLength normalized to 1) progressively
                      unmasks the dotted line beneath it. */}
                  {links.map((link, i) => (
                    <mask
                      key={`m${i}`}
                      id={`pubRoadDraw${i}`}
                      maskUnits="userSpaceOnUse"
                    >
                      <path
                        ref={(el) => { drawRefs.current[i] = el; }}
                        className="pub-road-draw"
                        d={link.d}
                        pathLength={1}
                      />
                    </mask>
                  ))}
                </defs>
                {links.map((link, i) => (
                  <g
                    key={i}
                    ref={(el) => { linkRefs.current[i] = el; }}
                    className="pub-road-link"
                  >
                    <path
                      className="pub-road-link-line"
                      d={link.d}
                      markerEnd="url(#pubRoadArrow)"
                      mask={`url(#pubRoadDraw${i})`}
                    />
                    <circle className="pub-road-link-dot" cx={link.dot.x} cy={link.dot.y} r={3} />
                  </g>
                ))}
              </svg>

              <ol className="pub-road-grid">
                {STAGES.map((stage, i) => {
                  const Icon = stage.icon;
                  return (
                    <li
                      key={stage.num}
                      ref={(el) => { cardRefs.current[i] = el; }}
                      className={`pub-road-item tone-${stage.tone}`}
                    >
                      <article className="pub-road-card">
                        <div className="pub-road-card-top">
                          <div className="pub-road-card-id">
                            <span className="pub-road-num">{stage.num}</span>
                            <h3 className="pub-road-title">{stage.title}</h3>
                          </div>
                          <span className="pub-road-icon" aria-hidden="true">
                            <Icon size={19} strokeWidth={2.2} />
                          </span>
                        </div>
                        <p className="pub-road-text">{stage.text}</p>
                        <div className="pub-road-status">
                          <span className="pub-road-dots" aria-hidden="true">
                            {STAGES.map((s, j) => (
                              <i key={s.num} className={j <= i ? 'on' : ''} />
                            ))}
                          </span>
                          <span className="pub-road-count">
                            Stage {stage.num} of 06
                          </span>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>

        {/* ---- Tracking CTA — revealed after the story completes ---- */}
        <div className="pub-road-cta" ref={ctaRef}>
          <h3 className="pub-road-cta-title">Track your own reports</h3>
          <p className="pub-road-cta-text">
            Sign in to see the current status of your submissions, including
            timestamps and resolution updates.
          </p>
          <div className="pub-road-cta-actions">
            <Link to={LOGIN_ROUTE} className="pub-btn pub-btn-primary">
              <LogIn size={15} aria-hidden="true" />
              Log In to Track a Report
            </Link>
            <Link to={REPORT_ROUTE} className="pub-road-cta-alt">
              Create a Resident Account
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
