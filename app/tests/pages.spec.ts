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
        // Cards stacked inside an aside are a column, not a row; the contact spec checks that layout.
        .querySelectorAll<HTMLElement>(
          '.card:not(aside .card), [class*="howStep"], [class*="cell"]',
        )
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

test('footer: bands stack full-width on desktop, with link columns of similar height', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const box = async (sel: string) => (await page.locator(sel).first().boundingBox())!;
  const brand = await box('footer [class*="bandBrand"]');
  const links = await box('footer [class*="bandLinks"]');
  const frameworks = await box('footer [class*="bandFrameworks"]');
  // Bands read top to bottom and share one width, so nothing floats in a pocket beside another column.
  expect(links.y).toBeGreaterThanOrEqual(brand.y + brand.height - 1);
  expect(frameworks.y).toBeGreaterThanOrEqual(links.y + links.height - 1);
  expect(Math.abs(links.width - frameworks.width)).toBeLessThanOrEqual(1);
  // The three link columns end within one row of each other (no long column leaving empty space beside short ones).
  const heights = await page
    .locator('footer nav[aria-labelledby^="footer-"]')
    .evaluateAll((navs) => navs.map((n) => Math.round(n.getBoundingClientRect().height)));
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(110);
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
  await page.goto('/privacy-policy');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.getByRole('note')).toContainText('draft');
});
