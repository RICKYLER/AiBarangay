'use client';

import React from 'react';
import { MapPin, Layers, Flame, Grid3x3, TrendingUp } from 'lucide-react';
import ChapterHead from './ChapterHead';
import { Reveal } from './scroll/scrollFx';
import CommunityMapPreview from './CommunityMapPreview';

/* The GIS reading list — each layer of the map, revealed in the
   order a analyst would turn it on. */
const LAYERS = [
  {
    key: 'markers',
    icon: MapPin,
    title: 'Incident markers',
    text: 'Every verified incident is placed on the map at its reported location.',
  },
  {
    key: 'clusters',
    icon: Layers,
    title: 'Clusters',
    text: 'Nearby related reports group together, showing where attention concentrates.',
  },
  {
    key: 'hotspots',
    icon: Flame,
    title: 'Emerging hotspots',
    text: 'AI-detected areas where a problem type keeps recurring.',
  },
  {
    key: 'zones',
    icon: Grid3x3,
    title: 'Barangay zones',
    text: 'Zone boundaries anchor every report to the community it belongs to.',
  },
  {
    key: 'patterns',
    icon: TrendingUp,
    title: 'Geographic patterns',
    text: 'Over time, the map becomes evidence — where problems form, and why.',
  },
];

/**
 * GisStory — chapter 05: the community map as a civic GIS interface.
 *
 * Wraps the existing interactive public map panel (category filters,
 * legend, anonymization notice — unchanged) in the landing story: the
 * chapter head frames it, and the reading list beside the map reveals
 * each layer progressively, teaching the visitor how to read what they
 * are looking at.
 */
export default function GisStory() {
  return (
    <section className="pub-st-chapter gis" aria-labelledby="pub-st-gis-title">
      <div className="pub-container">
        <ChapterHead
          index="05"
          eyebrow="GIS · COMMUNITY MAP"
          title={<>The whole barangay,<br />on one map.</>}
          sub="Reports are not just lists — they are places. The community map turns every verified incident into geographic intelligence the whole barangay can see."
          id="pub-st-gis-title"
        />

        <div className="pub-st-gis-layout">
          {/* Reading list — how to read the map, layer by layer */}
          <div className="pub-st-gis-layers" aria-label="How to read the community map">
            <Reveal kind="up" className="pub-st-gis-layers-label">
              Reading the map
            </Reveal>
            <ol>
              {LAYERS.map((l, i) => {
                const Icon = l.icon;
                return (
                  <Reveal
                    as="li"
                    key={l.key}
                    kind="left"
                    delay={i * 100}
                    className="pub-st-gis-layer"
                  >
                    <span className="pub-st-gis-layer-icon" aria-hidden="true">
                      <Icon size={16} strokeWidth={1.9} />
                    </span>
                    <div>
                      <h3 className="pub-st-gis-layer-title">{l.title}</h3>
                      <p className="pub-st-gis-layer-text">{l.text}</p>
                    </div>
                  </Reveal>
                );
              })}
            </ol>
          </div>

          {/* The map itself — existing interactive panel, embedded flat */}
          <Reveal kind="zoom" className="pub-st-gis-panel">
            <CommunityMapPreview flat />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
