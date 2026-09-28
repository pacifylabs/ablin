import { expect, test, type Browser, type Page } from '@playwright/test';

const PATH = '/';
// The Home heroFramed block (seed id home-hero): DS v3 §7.3.
const HERO = 'section[aria-labelledby="home-hero-title"]';
const canvas = (page: Page) => page.locator(`${HERO} [data-lattice]`);

async function open(browser: Browser, opts: Parameters<Browser['newContext']>[0] = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...opts });
  const page = await context.newPage();
  await page.goto(PATH);
  return { page, context };
}

test.describe('hero content and structure (matches the reference)', () => {
  test('has the eyebrow, headline, lead, location tag, both CTAs and a decorative photo', async ({
    page,
  }) => {
    await page.goto(PATH);
    const hero = page.locator(HERO);
    await expect(hero.getByText('Governance, risk & compliance advisory')).toBeVisible();
    await expect(hero.getByRole('heading', { level: 1 })).toHaveText(
      'Governance, Risk & Compliance for a Secure Digital Future',
    );
    await expect(hero.getByText('UNITED KINGDOM')).toHaveAttribute('aria-hidden', 'true');
    await expect(hero.getByRole('link', { name: 'Explore Our Services' })).toHaveAttribute(
      'href',
      '/services',
    );
    await expect(hero.getByRole('link', { name: 'Speak to Our Consultants' })).toHaveAttribute(
      'href',
      '/contact',
    );
    // The photo sits under the navy shade and is decorative (DS v3 §7.3).
    await expect(hero.locator('img')).toHaveCount(1);
    await expect(hero.locator('img')).toHaveAttribute('alt', '');
  });

  test('capability panels overlap the hero by 120px on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(PATH);
    const frame = await page.locator(`${HERO} > div`).boundingBox();
    const panels = await page.locator('#main ul').first().boundingBox();
    expect(Math.round(frame!.y + frame!.height - panels!.y)).toBe(120);
  });

  test('never states certification, accreditation or partnership in the hero', async ({ page }) => {
    await page.goto(PATH);
    const text = (await page.locator(HERO).innerText()).toLowerCase();
    for (const banned of ['certified', 'accredited', 'approved by', 'partner', 'trusted by']) {
      expect(text, banned).not.toContain(banned);
    }
  });

  test('background layers exist and are all decorative (aria-hidden)', async ({ page }) => {
    await page.goto(PATH);
    const layers = await page.evaluate((hero) => {
      const layer = document.querySelector(`${hero} [data-lattice]`)!.parentElement!;
      const has = (s: string) => layer.querySelector(s) !== null;
      const exposed = [layer, ...layer.querySelectorAll('*')].filter(
        (el) => !el.closest('[aria-hidden="true"]'),
      ).length;
      return {
        canvas: has('canvas'),
        children: layer.children.length,
        exposed,
      };
    }, HERO);
    expect(layers.canvas).toBe(true);
    expect(layers.children).toBe(1); // the canvas; photo and shade belong to the hero frame
    expect(layers.exposed).toBe(0);
  });
});

test.describe('hero lattice behaviour', () => {
  test('runs when motion is allowed', async ({ browser }) => {
    const { page, context } = await open(browser, { reducedMotion: 'no-preference' });
    await expect(canvas(page)).toHaveAttribute('data-lattice', 'running', { timeout: 6000 });
    await context.close();
  });

  test('under reduced motion it draws one static frame and pointer tracking is off', async ({
    browser,
  }) => {
    const { page, context } = await open(browser, { reducedMotion: 'reduce' });
    await expect(canvas(page)).toHaveAttribute('data-lattice', 'static', { timeout: 6000 });
    const snapshot = () => canvas(page).evaluate((c: HTMLCanvasElement) => c.toDataURL());
    const first = await snapshot();
    expect(first.length).toBeGreaterThan(2000);
    await page.waitForTimeout(1200);
    expect(await snapshot()).toBe(first);
    await page.mouse.move(600, 300);
    await expect(canvas(page)).toHaveAttribute('data-pointer', 'away');
    await context.close();
  });

  test('pauses when the hero scrolls off screen and resumes on return', async ({ browser }) => {
    const { page, context } = await open(browser, { reducedMotion: 'no-preference' });
    await expect(canvas(page)).toHaveAttribute('data-lattice', 'running', { timeout: 6000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(canvas(page)).toHaveAttribute('data-lattice', 'paused', { timeout: 4000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(canvas(page)).toHaveAttribute('data-lattice', 'running', { timeout: 4000 });
    await context.close();
  });

  test('pauses when the tab is hidden', async ({ browser }) => {
    const { page, context } = await open(browser, { reducedMotion: 'no-preference' });
    await expect(canvas(page)).toHaveAttribute('data-lattice', 'running', { timeout: 6000 });
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(canvas(page)).toHaveAttribute('data-lattice', 'paused');
    await context.close();
  });

  test('tracks the cursor on a desktop pointer', async ({ browser }) => {
    const { page, context } = await open(browser, { reducedMotion: 'no-preference' });
    await expect(canvas(page)).toHaveAttribute('data-lattice', 'running', { timeout: 6000 });
    await page.mouse.move(900, 300);
    await expect(canvas(page)).toHaveAttribute('data-pointer', 'near');
    await context.close();
  });

  test('caps the canvas at 2x device pixel ratio', async ({ browser }) => {
    const { page, context } = await open(browser, {
      deviceScaleFactor: 3,
      reducedMotion: 'reduce',
    });
    await expect(canvas(page)).toHaveAttribute('data-lattice', 'static', { timeout: 6000 });
    const ratio = await canvas(page).evaluate((c: HTMLCanvasElement) => c.width / c.clientWidth);
    expect(ratio).toBeLessThanOrEqual(2.01);
    expect(ratio).toBeGreaterThan(1.5);
    await context.close();
  });

  test('node count scales with the hero, between 34 and 80', async ({ browser }) => {
    const small = await open(browser, {
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    });
    await expect(canvas(small.page)).toHaveAttribute('data-nodes', /\d+/, { timeout: 6000 });
    const smallCount = Number(await canvas(small.page).getAttribute('data-nodes'));
    await small.context.close();
    const big = await open(browser, {
      viewport: { width: 3840, height: 2160 },
      reducedMotion: 'reduce',
    });
    await expect(canvas(big.page)).toHaveAttribute('data-nodes', /\d+/, { timeout: 6000 });
    const bigCount = Number(await canvas(big.page).getAttribute('data-nodes'));
    await big.context.close();
    expect(smallCount).toBeGreaterThanOrEqual(34);
    expect(bigCount).toBeLessThanOrEqual(80);
    expect(bigCount).toBeGreaterThan(smallCount);
  });
});

test.describe('calm hero buttons', () => {
  test('never move on hover: no transform, no positional transition, glow or border only', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(PATH);
    // Let the one-time load rise (a transform on the CTA row, not the buttons) finish first.
    await page.waitForTimeout(1200);
    for (const name of ['Explore Our Services', 'Speak to Our Consultants']) {
      const button = page.locator(HERO).getByRole('link', { name });
      await button.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      // Page coordinates, so a scroll caused by hovering can't be mistaken for the button moving.
      const pageBox = () =>
        button.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x + window.scrollX, y: r.y + window.scrollY, width: r.width };
        });
      const before = await pageBox();
      const rest = await button.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          transform: s.transform,
          translate: s.translate,
          property: s.transitionProperty,
          shadow: s.boxShadow,
        };
      });
      expect(rest.transform, name).toBe('none');
      expect(rest.translate, name).toBe('none');
      expect(rest.property, name).not.toMatch(/all|transform|translate|scale|margin|top|left/);

      await button.hover();
      await page.waitForTimeout(450);
      const after = await pageBox();
      const hovered = await button.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          transform: s.transform,
          shadow: s.boxShadow,
          border: s.borderColor,
          color: s.color,
        };
      });
      expect(hovered.transform, name).toBe('none');
      expect(after!.x, name).toBeCloseTo(before!.x, 1);
      expect(after!.y, name).toBeCloseTo(before!.y, 1);
      expect(after!.width, name).toBeCloseTo(before!.width, 1);
      // Something changed (calm glow / border / colour), so hover is still visible.
      expect(hovered.shadow !== rest.shadow || hovered.border !== 'rgba(0, 0, 0, 0)').toBe(true);
    }
  });

  test('a cursor sweeping across a button does not pull it (no magnetic effect)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(PATH);
    const button = page.locator(HERO).getByRole('link', { name: 'Explore Our Services' });
    await button.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + 4, box.y + 4);
    const start = await button.boundingBox();
    for (let i = 0; i <= 12; i += 1) {
      await page.mouse.move(box.x + 4 + (box.width - 8) * (i / 12), box.y + box.height - 4);
    }
    const end = await button.boundingBox();
    expect(end!.x).toBeCloseTo(start!.x, 1);
    expect(end!.y).toBeCloseTo(start!.y, 1);
  });

  test('keeps a visible keyboard focus indicator', async ({ page }) => {
    await page.goto(PATH);
    const button = page.locator(HERO).getByRole('link', { name: 'Explore Our Services' });
    await button.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    const outline = await button.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
  });
});

// Real-pixel contrast (DS v3 §2): with the copy hidden, every pixel behind the headline and lead must keep AA against
// the white/pale text, in both themes and at a range of widths. The shade is what guarantees it, over any photo.
function luminance([r, g, b]: number[]): number {
  const c = (v: number) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * c(r!) + 0.7152 * c(g!) + 0.0722 * c(b!);
}

for (const scheme of ['light', 'dark'] as const) {
  for (const [width, height] of [
    [1440, 900],
    [1024, 768],
    [390, 844],
  ] as const) {
    test(`hero copy keeps AA over the photo — ${scheme}, ${width}px`, async ({ browser }) => {
      const { page, context } = await open(browser, {
        colorScheme: scheme,
        viewport: { width, height },
        reducedMotion: 'reduce',
      });
      await page.waitForLoadState('networkidle');
      const boxes = await page.evaluate((hero) => {
        const q = (s: string) => document.querySelector(`${hero} ${s}`)!.getBoundingClientRect();
        const rect = (r: DOMRect) => ({ x: r.x, y: r.y, width: r.width, height: r.height });
        return [rect(q('h1')), rect(q('h1 + p'))];
      }, HERO);
      await page.addStyleTag({
        content: `${HERO} h1, ${HERO} h1 + p { color: transparent !important; }`,
      });
      for (const [i, box] of boxes.entries()) {
        const png = await page.screenshot({ clip: box });
        const worst = await page.evaluate(async (b64) => {
          const img = new Image();
          img.src = `data:image/png;base64,${b64}`;
          await img.decode();
          const c = document.createElement('canvas');
          c.width = img.width;
          c.height = img.height;
          const ctx = c.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          const d = ctx.getImageData(0, 0, c.width, c.height).data;
          let max = [0, 0, 0];
          let maxL = -1;
          for (let p = 0; p < d.length; p += 4) {
            const l = 0.2126 * d[p]! + 0.7152 * d[p + 1]! + 0.0722 * d[p + 2]!;
            if (l > maxL) {
              maxL = l;
              max = [d[p]!, d[p + 1]!, d[p + 2]!];
            }
          }
          return max;
        }, png.toString('base64'));
        // Headline is white; the lead is #D2DAE5.
        const text = i === 0 ? [255, 255, 255] : [0xd2, 0xda, 0xe5];
        const ratio = (luminance(text) + 0.05) / (luminance(worst) + 0.05);
        expect(
          ratio,
          `${i === 0 ? 'headline' : 'lead'} worst pixel ${worst}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
      await context.close();
    });
  }
}
