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
 * [foreground, background, minimum ratio] — 4.5 body text, 3 large text / UI.
 * --border-strong is deliberately absent: at ~1.5:1 it is a divider, not an input border.
 * Form controls use --input-border, which must meet WCAG 1.4.11 (3:1).
 */
const pairs: Array<[string, string, number]> = [
  ['text', 'bg', 4.5],
  ['text', 'surface', 4.5],
  ['text', 'panel', 4.5],
  ['text-muted', 'bg', 4.5],
  ['text-muted', 'surface', 4.5],
  ['text-muted', 'panel', 4.5],
  ['heading', 'bg', 4.5],
  ['heading', 'surface', 4.5],
  ['heading', 'surface-2', 4.5],
  ['on-accent', 'accent', 4.5],
  ['on-accent', 'accent-hover', 4.5],
  ['link', 'bg', 4.5],
  ['link', 'surface', 4.5],
  ['accent', 'bg', 3],
  ['focus', 'bg', 3],
  ['focus', 'surface', 3],
  ['feature-text', 'feature-bg', 4.5],
  ['feature-muted', 'feature-bg', 4.5],
  ['footer-text', 'footer-bg', 4.5],
  ['footer-muted', 'footer-bg', 4.5],
  ['input-border', 'bg', 3],
  ['input-border', 'panel', 3],
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
  const value = theme[name] ?? base[name];
  if (value) return value;
  // Tokens defined as var() aliases in the light block.
  const aliases: Record<string, string> = {
    accent: 'brand',
    'accent-hover': 'brand-strong',
    link: 'brand',
    'footer-bg': 'brand-strong',
  };
  const target = aliases[name];
  if (target) return theme[target] ?? base[target] ?? '';
  return '';
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
