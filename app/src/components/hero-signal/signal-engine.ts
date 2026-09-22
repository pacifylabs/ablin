import { LATTICE } from './config';

/** DOM-free lattice logic ported from the reference hero, so the parts that matter can be unit tested. */

export interface SignalNode {
  x: number;
  y: number;
  /** Velocity in CSS px per second. */
  vx: number;
  vy: number;
}

export type Rgb = [number, number, number];

export interface Palette {
  node: Rgb;
  edge: Rgb;
  /** The accent used for anything near the cursor (--signal). */
  hot: Rgb;
}

export interface Pointer {
  x: number;
  y: number;
  active: boolean;
}

/** (sample) count = round(min(80, max(34, area / 16000))). */
export function nodeCount(width: number, height: number): number {
  const raw = Math.round((width * height) / LATTICE.areaPerNode);
  return Math.min(LATTICE.maxNodes, Math.max(LATTICE.minNodes, raw));
}

/** Small seeded PRNG so the reduced-motion static frame is identical on every visit. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createNodes(width: number, height: number, count: number, seed = 1): SignalNode[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    x: random() * width,
    y: random() * height,
    vx: (random() - 0.5) * 2 * LATTICE.driftPerAxis,
    vy: (random() - 0.5) * 2 * LATTICE.driftPerAxis,
  }));
}

/** Advance by `dt` seconds. Time-based (the sample is per-frame), and nodes bounce so none ever leaves the hero. */
export function stepNodes(nodes: SignalNode[], dt: number, width: number, height: number): void {
  for (const node of nodes) {
    node.x += node.vx * dt;
    node.y += node.vy * dt;
    if (node.x < 0) {
      node.x = 0;
      node.vx = Math.abs(node.vx);
    } else if (node.x > width) {
      node.x = width;
      node.vx = -Math.abs(node.vx);
    }
    if (node.y < 0) {
      node.y = 0;
      node.vy = Math.abs(node.vy);
    } else if (node.y > height) {
      node.y = height;
      node.vy = -Math.abs(node.vy);
    }
  }
}

/** (sample) resting edge opacity: linear from `edgeBase` at 0 distance to 0 at the link distance. */
export function edgeAlpha(distance: number): number {
  if (distance >= LATTICE.linkDistance) return 0;
  return (1 - distance / LATTICE.linkDistance) * LATTICE.edgeBase;
}

/** (sample) 1 at the cursor, falling linearly to 0 at the pointer radius. */
export function nearness(px: number, py: number, x: number, y: number): number {
  const d = Math.hypot(x - px, y - py);
  return d < LATTICE.pointerRadius ? 1 - d / LATTICE.pointerRadius : 0;
}

/** Read an RGB triple from a computed colour: `rgb()`/`rgba()` or the `color(srgb …)` form modern browsers return. */
export function parseRgb(css: string): Rgb | null {
  const legacy = css.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (legacy) return [Number(legacy[1]), Number(legacy[2]), Number(legacy[3])];
  const modern = css.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (modern) return [Number(modern[1]) * 255, Number(modern[2]) * 255, Number(modern[3]) * 255];
  return null;
}

const rgba = ([r, g, b]: Rgb, a: number) => `rgba(${r | 0},${g | 0},${b | 0},${a.toFixed(3)})`;

/**
 * Draw one frame, using the reference hero's formulas exactly: edges brighten to the accent and thicken near the
 * cursor (judged at the edge's midpoint); nodes near the cursor grow and brighten, with a soft halo when close.
 */
export function drawLattice(
  ctx: CanvasRenderingContext2D,
  nodes: readonly SignalNode[],
  palette: Palette,
  pointer: Pointer,
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height);
  const link = LATTICE.linkDistance;

  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i]!;
    for (let j = i + 1; j < nodes.length; j += 1) {
      const b = nodes[j]!;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      if (dx >= link || dx <= -link || dy >= link || dy <= -link) continue;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d >= link) continue;
      const base = edgeAlpha(d);
      const near = pointer.active
        ? nearness(pointer.x, pointer.y, (a.x + b.x) / 2, (a.y + b.y) / 2)
        : 0;
      if (near > 0) {
        ctx.strokeStyle = rgba(palette.hot, base + near * 0.65);
        ctx.lineWidth = LATTICE.edgeWidth + near * 1.4;
      } else {
        ctx.strokeStyle = rgba(palette.edge, base);
        ctx.lineWidth = LATTICE.edgeWidth;
      }
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  for (const node of nodes) {
    const near = pointer.active ? nearness(pointer.x, pointer.y, node.x, node.y) : 0;
    ctx.beginPath();
    ctx.arc(node.x, node.y, near > 0 ? 1.5 + near * 2 : LATTICE.nodeRadius, 0, Math.PI * 2);
    ctx.fillStyle =
      near > 0 ? rgba(palette.hot, 0.5 + near * 0.5) : rgba(palette.node, LATTICE.nodeAlpha);
    ctx.fill();
    if (near > 0.25) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 9 + near * 14, 0, Math.PI * 2);
      ctx.fillStyle = rgba(palette.hot, near * 0.22);
      ctx.fill();
    }
  }
}
