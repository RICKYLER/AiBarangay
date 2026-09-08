'use client';

import React from 'react';
import { Users, Cpu, ShieldCheck, MapPinned } from 'lucide-react';
import { PUBLIC_CONFIG } from '@/lib/data/publicData';
import ChapterHead from './ChapterHead';
import { Reveal } from './scroll/scrollFx';

/* The four actors of the platform, progressively introduced */
const FACETS = [
  {
    key: 'residents',
    icon: Users,
    title: 'For residents',
    text: 'Anyone in the community can report a problem in minutes — describe it, pin it on the map, attach photos — and follow its progress until it is resolved.',
  },
  {
    key: 'ai',
    icon: Cpu,
    title: 'AI that assists',
    text: 'Artificial intelligence reads incoming reports, recommends categories and priorities, and spots duplicates and patterns — as decision support, never as the decision-maker.',
  },
  {
    key: 'personnel',
    icon: ShieldCheck,
    title: 'For barangay personnel',
    text: 'Authorized personnel verify every report, manage official incidents, and coordinate the response — with the full history recorded and accountable.',
  },
  {
    key: 'map',
    icon: MapPinned,
    title: 'For the whole community',
    text: 'An anonymized public map shows where problems cluster, so the community can see what is being reported, verified, and resolved around them.',
  },
];

/**
 * WhatIsSection — chapter 02: what the platform actually is.
 *
 * A large definitional statement (the name, spelled out) followed by
 * the four facets revealed in sequence as the visitor scrolls. The
 * name statement is the hinge between the problem chapter above and
 * the system story below.
 */
export default function WhatIsSection() {
  return (
    <section className="pub-st-chapter whatis alt" aria-labelledby="pub-st-what-title">
      <div className="pub-container">
        <ChapterHead
          index="02"
          eyebrow="THE PLATFORM"
          title="What is AI Barangay Problem Mapper?"
          sub="One system that connects residents who see community problems with barangay personnel who can solve them — through a clear, trackable, transparent process."
          id="pub-st-what-title"
        />

        <Reveal kind="zoom" className="pub-st-what-statement" delay={80}>
          <span className="pub-st-what-mark" aria-hidden="true">
            <MapPinned size={22} strokeWidth={2} />
          </span>
          <p>
            A <strong>community problem reporting and response platform</strong>{' '}
            operated by {PUBLIC_CONFIG.lgu.name}, combining{' '}
            <em>civic reporting</em>, <em>AI-assisted analysis</em>, and{' '}
            <em>geographic intelligence</em> — so no report gets lost,
            and every response can be traced.
          </p>
        </Reveal>

        <div className="pub-st-what-grid">
          {FACETS.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal
                as="article"
                key={f.key}
                kind="up"
                delay={i * 110}
                className="pub-st-what-card"
              >
                <span className="pub-st-what-icon" aria-hidden="true">
                  <Icon size={20} strokeWidth={1.9} />
                </span>
                <h3 className="pub-st-what-card-title">{f.title}</h3>
                <p className="pub-st-what-card-text">{f.text}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
