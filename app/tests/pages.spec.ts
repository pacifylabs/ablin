import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/about',
  '/services',
  '/services/governance-risk-compliance',
  '/services/ai-governance',
  '/who-we-serve',
  '/insights',
  '/insights/topic/iso-27001',
  '/contact',
  '/privacy-policy',
  '/cookie-policy',
  '/terms-of-use',
  '/accessibility',
  '/does-not-exist',
];
const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'desktop', width: 1280, height: 900 },
] as const;
const schemes = ['light', 'dark'] as const;

for (const route of routes) {
  for (const viewport of viewports) {
    for (const scheme of schemes) {
      test(`axe: ${route} — ${viewport.name}, ${scheme}`, async ({ browser }) => {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          colorScheme: scheme,
          reducedMotion: 'reduce',
        });
        const page = await context.newPage();
        await page.goto(route);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, 'horizontal overflow').toBe(0);
        await context.close();
      });
    }
  }
}

// Cards that share a row must share a height (no ragged edges).
for (const route of routes.filter((r) => r !== '/does-not-exist')) {
  test(`aligned cards: ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(route);
    const mismatched = await page.evaluate(() => {
      const rows = new Map<number, Set<number>>();
      const counts = new Map<number, number>();
      document
        // Card-like cells: service cards, framework cards and why-grid cells.
        .querySelectorAll<HTMLElement>('li[class*="card"], div[class*="cell"]')
        .forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (!rect.width) return;
          const top = Math.round(rect.top + window.scrollY);
          if (!rows.has(top)) rows.set(top, new Set());
          rows.get(top)!.add(Math.round(rect.height));
          counts.set(top, (counts.get(top) ?? 0) + 1);
        });
      return [...rows.entries()]
        .filter(([top, heights]) => (counts.get(top) ?? 0) > 1 && heights.size > 1)
        .map(([top, heights]) => `${top}: ${[...heights].join('/')}`);
    });
    expect(mismatched).toEqual([]);
  });
}

test('footer: no pause button; the strip stops on hover and on keyboard focus', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /slider|pause|play/i })).toHaveCount(0);
  const strip = page.locator('footer').getByRole('group', { name: /Frameworks list/ });
  const track = page.locator('footer [class*="track"]');
  await expect(track).toHaveCSS('animation-play-state', 'running');
  await strip.hover();
  await expect(track).toHaveCSS('animation-play-state', 'paused');
  await page.mouse.move(0, 0);
  await expect(track).toHaveCSS('animation-play-state', 'running');
  await strip.focus();
  await expect(track).toHaveCSS('animation-play-state', 'paused');
});

test('footer: strip is static under reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('footer [class*="track"]')).toHaveCSS('animation-name', 'none');
  await context.close();
});

test('footer: four columns share a top edge on desktop, frameworks strip below them', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const tops = await page
    .locator('footer > div')
    .first()
    .evaluate((grid) => [...grid.children].map((c) => Math.round(c.getBoundingClientRect().top)));
  expect(tops.length).toBe(4);
  expect(new Set(tops).size).toBe(1);
  const columns = (await page.locator('footer > div').first().boundingBox())!;
  const strip = (await page
    .locator('footer')
    .getByRole('group', { name: /Frameworks list/ })
    .boundingBox())!;
  expect(strip.y).toBeGreaterThan(columns.y + columns.height - 1);
});

test('an unbuilt article 404s, and an unauthenticated admin visit reaches the login page', async ({
  request,
}) => {
  expect((await request.get('/insights/anything')).status()).toBe(404);
  // Middleware redirects to /admin/login (see src/middleware.ts); Playwright's request API follows redirects,
  // so the final response is the login page itself, not a 404 — /admin is a real route now, not unbuilt.
  const res = await request.get('/admin');
  expect(res.status()).toBe(200);
  expect(res.url()).toContain('/admin/login');
});

test('draft legal pages are noindex and carry a visible draft notice', async ({ page }) => {
  for (const route of ['/privacy-policy', '/cookie-policy', '/terms-of-use', '/accessibility']) {
    await page.goto(route);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('#main')).toContainText('Draft for review');
  }
});

test('legal pages: plain header, text in a 760px column', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/privacy-policy');
  await expect(page.locator('#main img')).toHaveCount(0);
  const width = await page
    .locator('#main .prose')
    .first()
    .evaluate((el) => el.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(760);
});

test('service detail follows the DS v3 template', async ({ page }) => {
  await page.goto('/services/ai-governance');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'AI Governance & Responsible AI',
  );
  const h2 = await page.locator('#main h2').allInnerTexts();
  expect(h2).toEqual(
    expect.arrayContaining(['What this covers', 'How we work on this', 'Related services']),
  );
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
  await expect(page.locator('#main form')).toHaveCount(1);
});

test('a topic chip filters the Insights index', async ({ page }) => {
  await page.goto('/insights');
  await page.getByRole('link', { name: 'ISO 27001' }).first().click();
  await expect(page).toHaveURL(/\/insights\/topic\/iso-27001$/);
  await expect(page.getByRole('link', { name: 'ISO 27001' }).first()).toHaveAttribute(
    'aria-current',
    'true',
  );
});

test('availability gate 404s while the site is live', async ({ request }) => {
  expect((await request.get('/status')).status()).toBe(404);
});
