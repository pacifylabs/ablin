import { describe, expect, it, vi } from 'vitest';
import { LATTICE } from '@/components/hero-signal/config';
import {
  createNodes,
  drawLattice,
  edgeAlpha,
  mulberry32,
  nearness,
  nodeCount,
  parseRgb,
  stepNodes,
  type Palette,
} from '@/components/hero-signal/signal-engine';

describe('nodeCount (sample: round(min(80, max(34, area / 16000))))', () => {
  it('matches the reference formula', () => {
    expect(nodeCount(1440, 800)).toBe(72);
    expect(nodeCount(1000, 700)).toBe(44);
  });

  it('is capped at 80 however large the viewport', () => {
    expect(LATTICE.maxNodes).toBe(80);
    expect(nodeCount(3840, 2160)).toBe(80);
    expect(nodeCount(10_000, 10_000)).toBe(80);
  });

  it('never drops below the sample minimum of 34', () => {
    expect(nodeCount(390, 700)).toBe(34);
    expect(nodeCount(1, 1)).toBe(34);
  });

  it('scales with area between the bounds', () => {
    expect(nodeCount(900, 700)).toBeLessThan(nodeCount(1400, 900));
  });
});

describe('createNodes and stepNodes', () => {
  it('is deterministic for a seed, so the reduced-motion frame never changes between visits', () => {
    expect(createNodes(1000, 600, 40, 1)).toEqual(createNodes(1000, 600, 40, 1));
    expect(createNodes(1000, 600, 40, 1)).not.toEqual(createNodes(1000, 600, 40, 2));
  });

  it('places nodes inside the bounds with drift within the sample range', () => {
    for (const n of createNodes(640, 480, 80, 5)) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x).toBeLessThanOrEqual(640);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeLessThanOrEqual(480);
      expect(Math.abs(n.vx)).toBeLessThanOrEqual(LATTICE.driftPerAxis);
      expect(Math.abs(n.vy)).toBeLessThanOrEqual(LATTICE.driftPerAxis);
    }
  });

  it('moves nodes and keeps them inside the bounds over a long run', () => {
    const nodes = createNodes(400, 300, 60, 3);
    const before = nodes.map((n) => ({ x: n.x, y: n.y }));
    for (let i = 0; i < 6000; i += 1) stepNodes(nodes, 0.016, 400, 300);
    expect(nodes.some((n, i) => n.x !== before[i]!.x || n.y !== before[i]!.y)).toBe(true);
    for (const n of nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x).toBeLessThanOrEqual(400);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeLessThanOrEqual(300);
    }
  });

  it('bounces off an edge instead of leaving', () => {
    const node = { x: 1, y: 50, vx: -100, vy: 0 };
    stepNodes([node], 0.1, 200, 100);
    expect(node.x).toBe(0);
    expect(node.vx).toBeGreaterThan(0);
  });
});

describe('edgeAlpha and nearness (sample formulas)', () => {
  it('fades linearly from 0.16 at contact to nothing at the 150px link distance', () => {
    expect(edgeAlpha(0)).toBeCloseTo(0.16);
    expect(edgeAlpha(75)).toBeCloseTo(0.08);
    expect(edgeAlpha(150)).toBe(0);
    expect(edgeAlpha(400)).toBe(0);
  });

  it('is 1 at the cursor and falls linearly to 0 at 180px', () => {
    expect(nearness(10, 10, 10, 10)).toBe(1);
    expect(nearness(0, 0, 90, 0)).toBeCloseTo(0.5);
    expect(nearness(0, 0, 180, 0)).toBe(0);
    expect(nearness(0, 0, 500, 0)).toBe(0);
  });
});

describe('parseRgb', () => {
  it('reads legacy rgb() and modern color(srgb) computed colours', () => {
    expect(parseRgb('rgb(77, 163, 255)')).toEqual([77, 163, 255]);
    expect(parseRgb('rgba(30, 111, 219, 0.5)')).toEqual([30, 111, 219]);
    const modern = parseRgb('color(srgb 0.3 0.6 1)')!;
    expect(modern[0]).toBeCloseTo(76.5);
    expect(modern[2]).toBeCloseTo(255);
  });

  it('returns null for something it cannot read', () => {
    expect(parseRgb('nonsense')).toBeNull();
  });
});

describe('mulberry32', () => {
  it('produces values in [0, 1) and repeats for the same seed', () => {
    const a = mulberry32(9);
    const b = mulberry32(9);
    for (let i = 0; i < 50; i += 1) {
      const v = a();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      expect(v).toBe(b());
    }
  });
});

describe('drawLattice', () => {
  const palette: Palette = { node: [10, 20, 30], edge: [40, 50, 60], hot: [70, 80, 90] };

  function fakeContext() {
    const strokes: string[] = [];
    const widths: number[] = [];
    const ctx = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(() => {
        strokes.push(ctx.strokeStyle);
        widths.push(ctx.lineWidth);
      }),
      arc: vi.fn(),
      fill: vi.fn(),
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 0,
    };
    return { ctx: ctx as unknown as CanvasRenderingContext2D, strokes, widths, raw: ctx };
  }

  const pair = [
    { x: 100, y: 100, vx: 0, vy: 0 },
    { x: 160, y: 100, vx: 0, vy: 0 },
  ];

  it('joins two close nodes with one hairline in the edge colour', () => {
    const { ctx, strokes, widths } = fakeContext();
    drawLattice(ctx, pair, palette, { x: -9999, y: -9999, active: false }, 400, 300);
    expect(strokes).toHaveLength(1);
    expect(strokes[0]).toContain('rgba(40,50,60,');
    expect(widths[0]).toBeCloseTo(LATTICE.edgeWidth);
  });

  it('draws no edge between nodes beyond the link distance', () => {
    const { ctx, strokes } = fakeContext();
    const far = [pair[0]!, { x: 400, y: 100, vx: 0, vy: 0 }];
    drawLattice(ctx, far, palette, { x: -9999, y: -9999, active: false }, 600, 300);
    expect(strokes).toHaveLength(0);
  });

  it('brightens and thickens an edge near the cursor, in the accent colour', () => {
    const { ctx, strokes, widths } = fakeContext();
    drawLattice(ctx, pair, palette, { x: 130, y: 100, active: true }, 400, 300);
    expect(strokes[0]).toContain('rgba(70,80,90,');
    expect(widths[0]).toBeGreaterThan(LATTICE.edgeWidth);
  });

  it('ignores the pointer when it is inactive, however close its last position', () => {
    const { ctx, strokes } = fakeContext();
    drawLattice(ctx, pair, palette, { x: 130, y: 100, active: false }, 400, 300);
    expect(strokes[0]).toContain('rgba(40,50,60,');
  });

  it('draws a halo around a node the cursor sits on', () => {
    const { ctx, raw } = fakeContext();
    drawLattice(ctx, [pair[0]!], palette, { x: 100, y: 100, active: true }, 400, 300);
    // node disc + halo
    expect(raw.arc).toHaveBeenCalledTimes(2);
  });
});
