/**
 * Hero "signal structure": switches and tuning. Values marked (sample) are ported one-to-one from the approved
 * reference hero (ablin-signal-structure.html).
 *
 * OFF SWITCH: set `HERO_BACKGROUND.enabled` to `false` and the hero keeps its content and layout but drops the whole
 * animated background (canvas, contours, glow, scrim). Nothing else depends on it.
 */
export const HERO_BACKGROUND = {
  enabled: true,
} as const;

export const LATTICE = {
  /** (sample) one node per this many CSS px² of hero area, clamped to [minNodes, maxNodes]. */
  areaPerNode: 16_000,
  minNodes: 34,
  /** (sample) cap; also the performance ceiling. */
  maxNodes: 80,
  /** (sample) nodes closer than this are joined by a hairline. */
  linkDistance: 150,
  /** (sample) cursor influence radius. */
  pointerRadius: 180,
  /** (sample) drift: each velocity component is uniform in ±driftPerAxis CSS px per second (≈ ±0.125 px/frame at 60fps). */
  driftPerAxis: 7.5,
  /** (sample) */
  nodeRadius: 1.4,
  nodeAlpha: 0.5,
  /** (sample) edge opacity = (1 - distance / linkDistance) * edgeBase. */
  edgeBase: 0.16,
  edgeWidth: 0.6,
  /** Device pixel ratio cap: a 3x phone screen does not need a 3x canvas. */
  dprCap: 2,
} as const;

/** (sample) scroll parallax: px of translateY per px scrolled. */
export const PARALLAX = {
  contours: 0.18,
  glow: 0.1,
} as const;

/**
 * Text-protection scrim: the page background at this opacity behind the headline column, solid across the copy and
 * feathering out beyond it. The sample's scrim tops out at 78%; that leaves up to 22% of a bright signal pixel
 * showing behind body text, which does not hold AA in the worst case. This is stronger, with the sample's shape and
 * position unchanged. Both tests/atmosphere-contrast.test.ts (tokens) and the browser pixel test enforce it.
 */
export const SCRIM_ALPHA = 0.92;
