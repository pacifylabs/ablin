import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Comments are stripped first: they may mention `--token:` in prose, which must not be parsed as a declaration.
const css = readFileSync(join(__dirname, '../../src/styles/tokens.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

export type Theme = 'light' | 'dark';
export type Rgb = [number, number, number];

const SELECTORS: Record<Theme, string> = { light: ':root {', dark: ":root[data-theme='dark'] {" };

function block(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`Block not found: ${selector}`);
  const end = css.indexOf('\n}', start);
  const out: Record<string, string> = {};
  for (const m of css.slice(start, end).matchAll(/--([\w-]+):\s*([^;]+);/g))
    out[m[1]!] = m[2]!.trim();
  return out;
}

/** Resolve a design token for a theme, following `var(--x)` aliases and falling back to the light theme. */
export function token(theme: Theme, name: string): string {
  const themed = block(SELECTORS[theme]);
  const light = block(SELECTORS.light);
  let value = themed[name] ?? light[name];
  for (let hops = 0; value?.startsWith('var('); hops += 1) {
    if (hops > 5) throw new Error(`Alias loop resolving ${name}`);
    const next = /var\(--([\w-]+)\)/.exec(value)?.[1];
    value = next ? (themed[next] ?? light[next]) : undefined;
  }
  if (!value) throw new Error(`Token --${name} not found for ${theme}`);
  return value;
}

export function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToken(theme: Theme, name: string): Rgb {
  return hexToRgb(token(theme, name));
}

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance([r, g, b]: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Alpha-composite `top` at opacity `alpha` over `bottom` (sRGB space, as browsers do). */
export function blend(bottom: Rgb, top: Rgb, alpha: number): Rgb {
  return bottom.map((c, i) => Math.round(c * (1 - alpha) + top[i]! * alpha)) as Rgb;
}
