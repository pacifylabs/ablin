import { describe, expect, it } from 'vitest';
import { SCRIM_ALPHA } from '@/components/hero-signal/config';
import { blend, contrast, rgbToken, type Theme } from './helpers/tokens';

/**
 * The hero headline sits above a scrim of the page background, and everything else (glow, contours, canvas) sits
 * BELOW the scrim. So the strongest thing that can show through behind text is a fully bright --signal pixel
 * attenuated to (1 - SCRIM_ALPHA). Body copy and headings must still be AA.
 * (tests/hero-signal.spec.ts repeats this on the actual rendered pixels.)
 */
describe.each(['light', 'dark'] as Theme[])(
  'hero text contrast over the atmosphere — %s theme',
  (theme) => {
    const bg = rgbToken(theme, 'bg');
    const signal = rgbToken(theme, 'signal');
    const leak = 1 - SCRIM_ALPHA;
    // The glow, contours and canvas all sit BELOW the scrim, so the strongest thing that can show through behind text
    // is one fully bright signal pixel attenuated by the scrim; the glow cannot add to it.
    const worst = blend(bg, signal, leak);

    it.each([
      ['heading', 'heading', 4.5],
      ['body text', 'text', 4.5],
      ['muted lead text', 'text-muted', 4.5],
    ])('%s stays at least %d:1 in the worst case', (_label, tokenName, min) => {
      expect(contrast(rgbToken(theme, tokenName), worst)).toBeGreaterThanOrEqual(min);
    });

    it('the scrim is strong enough that the leak is small', () => {
      expect(leak).toBeLessThanOrEqual(0.1);
    });

    it('primary button text keeps AA when the hover glow ring is added', () => {
      // The glow is a ring around the button, never behind its label, but check the label against the accent anyway.
      expect(
        contrast(rgbToken(theme, 'on-accent'), rgbToken(theme, 'accent-hover')),
      ).toBeGreaterThanOrEqual(4.5);
    });
  },
);

describe('--signal token', () => {
  it('is a real colour in both themes (guards against a mis-parsed token)', () => {
    for (const theme of ['light', 'dark'] as Theme[]) {
      const [r, g, b] = rgbToken(theme, 'signal');
      expect(r + g + b, theme).toBeGreaterThan(0);
      expect([r, g, b].every((c) => Number.isFinite(c) && c >= 0 && c <= 255)).toBe(true);
    }
  });
});
