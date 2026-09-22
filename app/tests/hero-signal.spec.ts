import { expect, test, type Browser, type Page } from '@playwright/test';
import { HERO_BACKGROUND } from '@/components/hero-signal/config';

// The hero is reviewed on a staging route first; once applied it lives on the home page.
const PATH = process.env.HERO_PATH ?? '/';
const HERO = 'section[aria-labelledby="hero-title"]';
const canvas = (page: Page) => page.locator(`${HERO} [data-lattice]`);

async function open(browser: Browser, opts: Parameters<Browser['newContext']>[0] = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...opts });
  const page = await context.newPage();
  await page.goto(PATH);
  return { page, context };
}

test.describe('hero content and structure (matches the reference)', () => {
  test('has the eyebrow, headline, lead, both CTAs and the frameworks strip, and no photograph', async ({
    page,
  }) => {
    await page.goto(PATH);
    const hero = page.locator(HERO);
    await expect(hero.getByText('Governance, risk & compliance advisory')).toBeVisible();
    await expect(hero.getByRole('heading', { level: 1 })).toHaveText(
      'Governance, Risk & Compliance for a Secure Digital Future',
    );
    await expect(hero.locator('[data-hero="lead"]')).toContainText(
      'Ablin Limited helps organisations navigate',
    );
    const primary = hero.getByRole('link', { name: /Explore Our Services/i });
    const secondary = hero.getByRole('link', { name: /Speak to Our Consultants/i });
    await expect(primary).toHaveAttribute('href', '/services');
    await expect(secondary).toHaveAttribute('href', '/contact');

    const strip = hero.getByRole('list', { name: 'Frameworks we advise on' });
    await expect(strip.locator('li')).toHaveText([
      'ISO 27001',
      'ISO/IEC 42001',
      'UK GDPR & DPA 2018',
      'SOC 2',
      'NIST AI RMF',
    ]);
    // The reference hero has no photograph.
    await expect(hero.locator('img')).toHaveCount(0);
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
    if (HERO_BACKGROUND.mode === 'signal') {
      const layers = await page.evaluate((hero) => {
        const layer = document.querySelector(`${hero} [data-lattice]`)!.parentElement!;
        const has = (s: string) => layer.querySelector(s) !== null;
        const exposed = [layer, ...layer.querySelectorAll('*')].filter(
          (el) => !el.closest('[aria-hidden="true"]'),
        ).length;
        return {
          canvas: has('canvas'),
          contours: has('svg'),
          children: layer.children.length,
          exposed,
        };
      }, HERO);
      expect(layers.canvas).toBe(true);
      expect(layers.contours).toBe(true);
      expect(layers.children).toBe(4); // canvas, contours, glow, scrim
      expect(layers.exposed).toBe(0);
      return;
    }
    if (HERO_BACKGROUND.mode === 'static') {
      const backdrop = page.locator(`${HERO} [aria-hidden="true"] svg`);
      await expect(backdrop).toBeVisible();
      return;
    }
    await expect(page.locator(`${HERO} canvas`)).toHaveCount(0);
  });
});

const describeSignal = HERO_BACKGROUND.mode === 'signal' ? test.describe : test.describe.skip;

describeSignal('hero lattice behaviour', () => {
  test('runs when motion is allowed', async ({ browser }) => {
    const { page, context } = await open(browser, { reducedMotion: 'no-preference' });
    await expect(canvas(page)).toHaveAttribute('data-lattice', 'running', { timeout: 6000 });
    await context.close();
  });

  test('under reduced motion it draws one static frame, and parallax and pointer tracking are off', async ({
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
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(300);
    const transform = await page
      .locator(`${HERO} svg[viewBox="0 0 1200 700"]`)
      .evaluate((el) => (el as SVGElement).style.transform);
    expect(transform).toBe('');
    await context.close();
  });

  test('scroll parallax moves the contours in proportion to the scroll (0.18 px per px)', async ({
    browser,
  }) => {
    const { page, context } = await open(browser, {
      reducedMotion: 'no-preference',
      viewport: { width: 1280, height: 700 },
    });
    await expect(canvas(page)).toHaveAttribute('data-lattice', 'running', { timeout: 6000 });
    await page.evaluate(() => window.scrollTo(0, 200));
    await expect
      .poll(async () =>
        page.evaluate((hero) => {
          const svg = document.querySelector(`${hero} svg[viewBox="0 0 1200 700"]`) as SVGElement;
          const y = Number(
            /translate3d\(0(?:px)?,\s*([\d.]+)px/.exec(svg.style.transform)?.[1] ?? 'NaN',
          );
          return Math.abs(y - window.scrollY * 0.18) < 0.6 && window.scrollY > 100;
        }, HERO),
      )
      .toBe(true);
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

  test('a theme switch re-reads the colours', async ({ browser }) => {
    const { page, context } = await open(browser, {
      reducedMotion: 'reduce',
      colorScheme: 'light',
    });
    await expect(canvas(page)).toHaveAttribute('data-lattice', 'static', { timeout: 6000 });
    const before = await canvas(page).evaluate((c: HTMLCanvasElement) => c.toDataURL());
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await expect
      .poll(() => canvas(page).evaluate((c: HTMLCanvasElement) => c.toDataURL()))
      .not.toBe(before);
    await context.close();
  });
});

// Real-pixel contrast: force the worst case (a solid, fully bright --signal canvas under the scrim), hide the text so
// only the background is captured, then check every pixel behind the headline and lead against the text colour.
type Case = { theme: 'light' | 'dark'; width: number; height: number };
const cases: Case[] = (['light', 'dark'] as const).flatMap((theme) =>
  [
    [1440, 900],
    [1280, 800],
    [1024, 768],
    [390, 844],
  ].map(([width, height]) => ({ theme, width: width!, height: height! })),
);

for (const c of cases) {
  const contrastTest = HERO_BACKGROUND.mode === 'signal' ? test : test.skip;
  contrastTest(`hero copy is AA over a worst-case lattice — ${c.theme}, ${c.width}px`, async ({
    browser,
  }) => {
    const { page, context } = await open(browser, {
      colorScheme: c.theme,
      viewport: { width: c.width, height: c.height },
      reducedMotion: 'reduce',
    });
    await expect(canvas(page)).toHaveAttribute('data-lattice', 'static', { timeout: 6000 });

    for (const selector of ['#hero-title', `${HERO} [data-hero="lead"]`]) {
      const target = page.locator(selector).first();
      const textColour = await target.evaluate((el) => getComputedStyle(el).color);
      await page.addStyleTag({
        content: `${HERO} [data-lattice]{background:var(--signal)!important}${selector}{color:transparent!important}`,
      });
      const png = (await target.screenshot()).toString('base64');
      const worst = await page.evaluate(
        async ({ png, textColour }) => {
          const channel = (v: number) => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          };
          const lum = (r: number, g: number, b: number) =>
            0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
          const [tr, tg, tb] = (textColour.match(/[\d.]+/g) ?? []).map(Number) as [
            number,
            number,
            number,
          ];
          const tl = lum(tr, tg, tb);
          const img = new Image();
          img.src = `data:image/png;base64,${png}`;
          await img.decode();
          const cv = document.createElement('canvas');
          cv.width = img.width;
          cv.height = img.height;
          const ctx = cv.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          const { data } = ctx.getImageData(0, 0, cv.width, cv.height);
          let min = Infinity;
          for (let i = 0; i < data.length; i += 4 * 7) {
            const bl = lum(data[i]!, data[i + 1]!, data[i + 2]!);
            const ratio = (Math.max(tl, bl) + 0.05) / (Math.min(tl, bl) + 0.05);
            if (ratio < min) min = ratio;
          }
          return min;
        },
        { png, textColour },
      );
      expect(worst, `${selector} worst-case contrast`).toBeGreaterThanOrEqual(4.5);
    }
    await context.close();
  });
}

test.describe('calm hero buttons', () => {
  test('never move on hover: no transform, no positional transition, glow or border only', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(PATH);
    for (const name of [/Explore Our Services/i, /Speak to Our Consultants/i]) {
      const button = page.locator(HERO).getByRole('link', { name });
      await page.mouse.move(0, 0);
      const before = await button.boundingBox();
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
      const after = await button.boundingBox();
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
    const button = page.locator(HERO).getByRole('link', { name: /Explore Our Services/i });
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
    const button = page.locator(HERO).getByRole('link', { name: /Explore Our Services/i });
    await button.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    const outline = await button.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
  });
});
