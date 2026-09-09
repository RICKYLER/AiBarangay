/**
 * Shared helpers for the public news feed components. Plain data
 * mapping only — safe to import from both NewsFeed and NewsPreview
 * (which are client components).
 */

/* DB category name → key + display label (same heuristics as the map). */
export function catInfo(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('flood')) return { key: 'flooding', label: 'Flooding' };
  if (n.includes('road') || n.includes('pothole')) return { key: 'roads', label: 'Road Damage' };
  if (n.includes('garbage') || n.includes('waste') || n.includes('trash') || n.includes('dumping'))
    return { key: 'garbage', label: 'Garbage' };
  if (n.includes('street') || n.includes('light')) return { key: 'streetlight', label: 'Streetlights' };
  if (n.includes('water') || n.includes('leak') || n.includes('drain'))
    return { key: 'water', label: 'Water & Drainage' };
  if (n.includes('infra') || n.includes('power') || n.includes('traffic') || n.includes('safety'))
    return { key: 'infrastructure', label: 'Infrastructure' };
  if (n.includes('environment') || n.includes('noise') || n.includes('tree'))
    return { key: 'environment', label: 'Environment' };
  return { key: 'other', label: 'Other Concern' };
}
