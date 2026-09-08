import React from 'react';
import {
  CloudRain, Route, Trash2, Lightbulb, Droplets, Waves,
  Building2, Leaf, HelpCircle,
} from 'lucide-react';
import { REPORT_CATEGORIES } from '@/lib/data/publicData';

const ICONS = {
  CloudRain, Route, Trash2, Lightbulb, Droplets, Waves, Building2, Leaf, HelpCircle,
};

/**
 * ProblemCategoryCard — a single reportable problem category.
 */
export function ProblemCategoryCard({ category }) {
  const Icon = ICONS[category.icon];
  return (
    <article className="pub-cat-card">
      <span className="pub-cat-icon" aria-hidden="true">
        {Icon && <Icon size={20} />}
      </span>
      <div>
        <h3 className="pub-cat-name">{category.label}</h3>
        <p className="pub-cat-text">{category.text}</p>
      </div>
    </article>
  );
}

/**
 * ReportableProblems — "What can you report?" section.
 */
export default function ReportableProblems({ showHeading = true }) {
  return (
    <section className="pub-section" aria-labelledby="pub-categories-title">
      <div className="pub-container">
        {showHeading && (
          <div className="pub-section-head center">
            <span className="pub-eyebrow">REPORTABLE PROBLEMS</span>
            <h2 className="pub-section-title" id="pub-categories-title">
              What can you report?
            </h2>
            <p className="pub-section-sub">
              If it affects your street, your safety, or your community, the
              barangay wants to know about it.
            </p>
          </div>
        )}

        <div className="pub-cat-grid">
          {REPORT_CATEGORIES.map((c) => (
            <ProblemCategoryCard key={c.key} category={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
