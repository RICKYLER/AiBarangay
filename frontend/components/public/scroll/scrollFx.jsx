'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Scroll-experience primitives for the public landing page.
 *
 * Everything here is deliberately lightweight: one IntersectionObserver
 * per revealed element, one rAF-throttled scroll listener per scrubbed
 * section, and no animation library. Continuous scroll effects are
 * written to a `--p` CSS custom property (0 → 1) on the section element
 * so the browser composites transforms without React re-renders.
 *
 * All effects degrade under `prefers-reduced-motion` — the CSS layer
 * disables transforms/transitions and these hooks snap to final values.
 */

/* Media query for reduced-motion preference (SSR-safe) */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/**
 * useScrub — continuously writes scroll progress (0 → 1) of an element
 * to its `--p` CSS variable.
 *
 * mode 'through': for tall sticky sections — 0 when the section top
 *   reaches the viewport top, 1 when its bottom reaches the viewport
 *   bottom (the full sticky dwell).
 * mode 'exit': for the hero — 0 at rest, 1 as the element leaves.
 */
export function useScrub(ref, mode = 'through') {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      let p;
      if (mode === 'exit') {
        p = -rect.top / (vh * 0.85);
      } else if (rect.height > vh) {
        p = -rect.top / (rect.height - vh);
      } else {
        p = (vh - rect.top) / (vh + rect.height);
      }
      el.style.setProperty('--p', clamp01(p).toFixed(4));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref, mode]);
}

/**
 * useScrubIndex — quantized scrub progress for step-driven sections
 * (workflow timeline, report tracking). Returns an integer 0..count
 * so React only re-renders when the active step actually changes.
 */
export function useScrubIndex(ref, count, from = 0.08, to = 0.88) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let ticking = false;
    let last = -1;
    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const span = rect.height > vh ? rect.height - vh : rect.height;
      const p = span > 0 ? clamp01(-rect.top / span) : 1;
      const t = clamp01((p - from) / (to - from));
      const next = Math.min(count, Math.floor(t * (count + 1)));
      if (next !== last) {
        last = next;
        setIndex(next);
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref, count, from, to]);
  return index;
}

/**
 * useReveal — one-shot IntersectionObserver reveal.
 * Returns [ref, shown]; pair with the `.pub-sx-r` CSS class.
 */
export function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -36px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, shown];
}

/**
 * Reveal — wrapper that fades/slides children in when scrolled into
 * view. `kind` picks the motion (up | left | right | zoom | lines).
 * Purely presentational: content is always in the DOM (visible without
 * JS or with reduced motion via the CSS override).
 */
export function Reveal({ kind = 'up', delay = 0, className = '', as: Tag = 'div', children, ...rest }) {
  const [ref, shown] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`pub-sx-r pub-sx-r-${kind} ${shown ? 'in' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * useCountUp — animated number counter. Starts when `active` becomes
 * true (pair with useReveal). Snaps instantly under reduced motion.
 * Returns the formatted display string.
 */
export function useCountUp(target, { active = true, decimals = 0, duration = 1500, prefix = '', suffix = '' }) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    if (reduced) {
      setValue(target);
      return undefined;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration, reduced]);

  const formatted = value >= target
    ? target.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(value).toLocaleString('en-US');
  return `${prefix}${formatted}${suffix}`;
}

/**
 * SectionShell — shared frame for every scroll section: reserves the
 * tall scrub height, holds the sticky viewport, and carries the teal
 * "system thread" line that visually connects the whole page.
 */
export function SectionShell({ height = 'auto', stick = false, thread = false, id, className = '', children }) {
  const ref = useRef(null);
  useScrub(ref, 'through');
  return (
    <section
      id={id}
      ref={ref}
      className={`pub-sx-sec ${stick ? 'pub-sx-sticky-sec' : ''} ${className}`}
      style={height !== 'auto' ? { minHeight: height } : undefined}
    >
      {thread && <span className="pub-sx-thread" aria-hidden="true"><span className="pub-sx-thread-fill" /></span>}
      {children}
    </section>
  );
}
