import { expect, test } from '@playwright/test';

test('photographs: decorative ones have empty alt, meaningful ones have descriptive alt', async ({
  page,
}) => {
  await page.goto('/');
  const imgs = await page
    .locator('main img')
    .evaluateAll((nodes) =>
      nodes.map((n) => ({ alt: (n as HTMLImageElement).alt, src: (n as HTMLImageElement).src })),
    );
  expect(imgs.length).toBeGreaterThanOrEqual(3);
  for (const img of imgs) {
    // Either intentionally decorative (empty) or genuinely described; never a filename or generic word.
    expect(img.alt === '' || img.alt.length > 10, img.src).toBe(true);
    expect(img.alt.toLowerCase()).not.toMatch(/\.(jpg|png)|image of|photo of/);
  }
});

test('photographs use the navy duotone filter and all lazy-load (the hero has no photograph)', async ({
  page,
}) => {
  await page.goto('/');
  const first = page.locator('main img').first();
  await expect(first).toHaveCSS('filter', /grayscale/);
  // The two blend layers that map greyscale onto the navy pair live on the frame.
  const blends = await first.evaluate((img) => {
    const frame = img.parentElement as HTMLElement;
    return [
      getComputedStyle(frame, '::before').mixBlendMode,
      getComputedStyle(frame, '::after').mixBlendMode,
    ];
  });
  expect(blends).toEqual(['multiply', 'lighten']);
  const loading = await page
    .locator('main img')
    .evaluateAll((n) => n.map((i) => (i as HTMLImageElement).loading));
  // The largest thing above the fold is now text, so no image needs priority: everything lazy-loads.
  expect(loading.length).toBeGreaterThan(0);
  expect(loading.every((l) => l === 'lazy')).toBe(true);
});

test('decorative motifs are hidden from assistive technology', async ({ page }) => {
  await page.goto('/');
  const exposed = await page
    .locator('main svg')
    .evaluateAll((nodes) => nodes.filter((n) => !n.closest('[aria-hidden="true"]')).length);
  expect(exposed).toBe(0);
});

test('frameworks section states advisory framing and shows no certificate wording', async ({
  page,
}) => {
  await page.goto('/');
  // The section's id is generated per-block (see cms/BlockRenderer.tsx) rather than fixed, so it's found by its
  // heading instead.
  const section = page.locator('section', {
    has: page.getByRole('heading', { name: 'Frameworks we advise on' }),
  });
  await expect(section).toContainText('do not issue certificates');
  const text = (await section.innerText()).toLowerCase();
  for (const banned of ['certified', 'accredited', 'approved by', 'partner']) {
    expect(text, banned).not.toContain(banned);
  }
  await expect(section.locator('ul').first().locator('> li')).toHaveCount(5);
  // Every framework links out to its authoritative page, safely.
  const links = await section.locator('a[href^="https://"]').evaluateAll((as) =>
    as.map((a) => ({
      href: (a as HTMLAnchorElement).href,
      rel: a.getAttribute('rel'),
      target: a.getAttribute('target'),
    })),
  );
  expect(links.length).toBeGreaterThanOrEqual(5);
  for (const link of links) {
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
  }
});

test('the hero flows straight into the tagline strip', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const hero = await page.locator('section[aria-labelledby="hero-title"]').boundingBox();
  const strip = await page
    .getByText('Secure · Scalable · Smart IT Consulting')
    .first()
    .boundingBox();
  expect(hero && strip).toBeTruthy();
  expect(strip!.y).toBeGreaterThanOrEqual(hero!.y + hero!.height - 1);
});
