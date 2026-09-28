import { expect, test } from '@playwright/test';

// DS v3 §5 / reference HTML: the Home page structure and the visual rules that can be checked mechanically.

test('home sections run in the DS v3 order', async ({ page }) => {
  await page.goto('/');
  const headings = await page.locator('#main h1, #main h2').allInnerTexts();
  const order = [
    'Governance, Risk & Compliance for a Secure Digital Future',
    'Governance, Risk & Compliance',
    'A consultancy built on governance, delivered in practice',
    'Eight areas of advisory work',
    'We do more than identify problems',
    'Organisations that need clear governance over risk',
    'Governance principles, practical delivery',
    'Guidance on the areas we advise on',
    'Discuss your governance and compliance requirements',
  ];
  let from = 0;
  for (const heading of order) {
    const at = headings.indexOf(heading, from);
    expect(at, heading).toBeGreaterThanOrEqual(from);
    from = at;
  }
});

test('photographs: decorative ones have empty alt, meaningful ones descriptive alt, none use filters', async ({
  page,
}) => {
  await page.goto('/');
  const images = await page.locator('#main img').evaluateAll((imgs) =>
    imgs.map((img) => ({
      alt: img.getAttribute('alt'),
      filter: getComputedStyle(img).filter,
    })),
  );
  expect(images.length).toBeGreaterThan(5);
  for (const image of images) {
    expect(image.alt).not.toBeNull();
    expect(image.filter).toBe('none');
  }
});

test('service carousel: four cards visible at 1240, next scrolls by one card, keyboard-focusable track', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const track = page.getByRole('list', { name: 'Services' }).first();
  await expect(track).toHaveAttribute('tabindex', '0');
  const cards = track.locator('li');
  await expect(cards).toHaveCount(8);
  const trackBox = (await track.boundingBox())!;
  const visible = await cards.evaluateAll(
    (els, right) => els.filter((el) => el.getBoundingClientRect().right <= right + 1).length,
    trackBox.x + trackBox.width,
  );
  expect(visible).toBe(4);
  const firstCard = (await cards.first().boundingBox())!;
  await page.getByRole('button', { name: 'Next services' }).click();
  await expect
    .poll(() => track.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(firstCard.width - 2);
  // Every card shows its code pill and a 4:5 photo.
  const ratio = await cards
    .first()
    .locator('img')
    .evaluate((img) => {
      const r = img.parentElement!.getBoundingClientRect();
      return r.width / r.height;
    });
  expect(ratio).toBeCloseTo(0.8, 1);
});

test('fact strip shows only the four service-structure counts', async ({ page }) => {
  await page.goto('/');
  const values = await page.locator('#main dl dd').allInnerTexts();
  expect(values).toEqual(['3', '8', '5', '5']);
});

test('frameworks strip states advisory framing and shows no certificate wording', async ({
  page,
}) => {
  await page.goto('/');
  const strip = page.getByText('Advisory and readiness support only', { exact: false }).first();
  await expect(strip).toBeVisible();
  const text = (await page.locator('#main').innerText()).toLowerCase();
  for (const banned of ['we are certified', 'accredited by', 'trusted by', 'testimonial']) {
    expect(text, banned).not.toContain(banned);
  }
});

test('no placeholder articles: the latest-articles grid renders nothing while none are published', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.locator('#main a[href^="/insights/"]:not([href^="/insights/topic/"])'),
  ).toHaveCount(0);
});

test('approach badge links to contact and the steps are numbered 01–05', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Request a Consultation' }).first()).toHaveAttribute(
    'href',
    '/contact',
  );
  const numbers = await page.locator('#main ol').first().locator('li > span').allInnerTexts();
  expect(numbers).toEqual(['01', '02', '03', '04', '05']);
});

test('nothing moves on load under reduced motion, and no scroll-triggered animation exists', async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  const animated = await page.evaluate(
    () =>
      [...document.querySelectorAll('#main *')].filter(
        (el) => getComputedStyle(el).animationName !== 'none',
      ).length,
  );
  expect(animated).toBe(0);
  await context.close();
});
