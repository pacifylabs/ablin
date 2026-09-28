/**
 * The fixed line-icon set (DS v3 §7): an admin picks an icon by name for capability panels, frameworks, the why and
 * values grids. The names are data; the drawings live in components/public/LineIcon.tsx. No uploads, so no icon can
 * drift from the design system.
 */
export const ICON_NAMES = [
  'square-check',
  'shield-check',
  'shield',
  'database',
  'target',
  'document',
  'layers',
  'trend',
  'briefcase',
  'monitor',
  'bars',
  'building',
  'compass',
  'cycle',
  'users',
  'scale',
  'search',
  'cloud',
] as const;
export type IconName = (typeof ICON_NAMES)[number];
