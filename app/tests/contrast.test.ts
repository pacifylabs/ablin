import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(join(__dirname, '../src/styles/tokens.css'), 'utf8');

/** Extract `--name: #hex` pairs from a block that starts at `selector {`. */
function readBlock(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`Block not found: ${selector}`);
  const end =
    css.indexOf('\n  }', start) > -1 && selector.includes('@media')
      ? css.indexOf('\n  }', start)
      : css.indexOf('\n}', start);
  const body = css.slice(start, end);
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) out[m[1]!] = m[2]!;
  return out;
}

const light = readBlock(':root {');
const dark = readBlock(":root[data-theme='dark'] {");
const system = readBlock(":root:not([data-theme='light']) {");

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}
function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * [foreground, background, minimum ratio] — 4.5 body text, 3 large text / UI (DS v3 §2, §10).
 * --line-strong is deliberately absent: it is a divider, not an input border. Form controls use --muted, which must
 * meet WCAG 1.4.11 (3:1).
 */
const pairs: Array<[string, string, number]> = [
  ['text', 'bg', 4.5],
  ['text', 'surface', 4.5],
  ['text', 'panel', 4.5],
  ['muted', 'bg', 4.5],
  ['muted', 'surface', 4.5],
  ['muted', 'panel', 4.5],
  ['heading', 'bg', 4.5],
  ['heading', 'surface', 4.5],
  ['heading', 'chip', 4.5],
  ['btn-text', 'btn-bg', 4.5],
  ['btn-text', 'btn-hover', 4.5],
  ['link', 'bg', 4.5],
  ['link', 'surface', 4.5],
  ['focus', 'bg', 3],
  ['focus', 'surface', 3],
  ['band-text', 'band', 4.5],
  ['band-muted', 'band', 4.5],
  ['muted', 'bg', 3],
  ['error', 'bg', 4.5],
  ['error', 'panel', 4.5],
  ['error', 'surface', 4.5],
  ['success', 'bg', 4.5],
];

function resolve(
  theme: Record<string, string>,
  base: Record<string, string>,
  name: string,
): string {
  return theme[name] ?? base[name] ?? '';
}

describe.each([
  ['light', light, light],
  ['dark', dark, light],
  ['system-dark mirror', system, light],
])('%s theme contrast', (_label, theme, base) => {
  it.each(pairs)('%s on %s ≥ %d:1', (fg, bg, min) => {
    const a = resolve(theme, base, fg);
    const b = resolve(theme, base, bg);
    expect(a, `missing token ${fg}`).toMatch(/^#/);
    expect(b, `missing token ${bg}`).toMatch(/^#/);
    expect(ratio(a, b)).toBeGreaterThanOrEqual(min);
  });
});

describe('theme parity', () => {
  it('system-dark mirror defines the same values as [data-theme=dark]', () => {
    for (const [name, value] of Object.entries(dark)) {
      expect(system[name], name).toBe(value);
    }
  });
});

/** DS v3 §2: the client palette plus its navy tints and the two form status colours. Nothing else may appear. */
const ALLOWED = new Set(
  [
    '#1C4E8B',
    '#143A69',
    '#0E2747',
    '#FFFFFF',
    '#2C2C2C',
    '#F3F5F8',
    '#0C1626',
    '#111E33',
    '#14233A',
    '#D2DAE5',
    '#13233A',
    '#F1F4F8',
    '#5A6474',
    '#95A2B5',
    '#E3E8EF',
    '#21324B',
    '#CCD5E1',
    '#2E4463',
    '#9BBBE6',
    '#C3D6F0',
    '#2A5E9E',
    '#0A1424',
    '#BFD0E6',
    '#95A9C6',
    '#EEF2F7',
    '#172A45',
    '#2E7D5B',
    '#4FB183',
    '#C0392B',
    '#E06A5C',
  ].map((h) => h.toLowerCase()),
);

describe('palette', () => {
  it('tokens.css uses only DS v3 colours', () => {
    const used = [...css.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0].toLowerCase());
    expect(used.filter((h) => !ALLOWED.has(h))).toEqual([]);
  });

  it('has no --signal accent', () => {
    expect(css).not.toMatch(/--signal/);
  });
});
