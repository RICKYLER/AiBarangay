/* Category / priority colors shared by the gov console. Kept in a
   leaflet-free module so pages can import colors without pulling the
   map (and Leaflet's window access) into the server bundle. */
export const PRIORITY_COLORS = {
  CRITICAL: '#d14343',
  HIGH: '#d08c1e',
  MEDIUM: '#2fa084',
  LOW: '#6fcf97',
};

export const CATEGORY_COLORS = {
  Flooding: '#2b6cb8',
  'Road Damage': '#b45309',
  Garbage: '#6b7280',
  Streetlight: '#8b5cf6',
  'Water Leak': '#0e7490',
};
