/**
 * Hero lattice tuning. Values marked (sample) are ported one-to-one from the approved reference hero. Whether the
 * lattice renders at all is a per-block admin switch (heroFramed.lattice).
 */
export const LATTICE = {
  /** (sample) one node per this many CSS px² of hero area, clamped to [minNodes, maxNodes]. */
  areaPerNode: 16_000,
  minNodes: 34,
  /** (sample) cap; also the performance ceiling. */
  maxNodes: 80,
  /** (sample) nodes closer than this are joined by a hairline. */
  linkDistance: 150,
  /** Cursor influence radius. Widened from the sample's 180 so the hover effect reaches further and reads
   *  clearly rather than only affecting the one or two nearest nodes. */
  pointerRadius: 230,
  /** (sample) drift: each velocity component is uniform in ±driftPerAxis CSS px per second (≈ ±0.125 px/frame at 60fps). */
  driftPerAxis: 7.5,
  /** (sample) */
  nodeRadius: 1.4,
  /** Resting opacity, raised from the sample's 0.5 for a more visible lattice at rest. Safe against the AA
   *  worst-case model in atmosphere-contrast.test.ts / hero-signal.spec.ts, which already assumes a fully
   *  opaque signal pixel (alpha 1) behind the text — this stays below that regardless of the value here. */
  nodeAlpha: 0.72,
  /** Resting edge opacity = (1 - distance / linkDistance) * edgeBase, raised from the sample's 0.16 for the
   *  same reason as nodeAlpha above. */
  edgeBase: 0.26,
  edgeWidth: 0.7,
  /** Device pixel ratio cap: a 3x phone screen does not need a 3x canvas. */
  dprCap: 2,
} as const;
