import { expect, test, type Page } from '@playwright/test';

async function fillValid(page: Page) {
  await page.getByLabel('Full name').fill('Amina Yusuf');
  await page.getByLabel('Work email').fill('amina@example.com');
  await page.getByLabel('Enquiry type').selectOption('grc');
  await page.getByLabel('Message').fill('We need help mapping our obligations under UK GDPR.');
  await page.getByRole('checkbox', { name: /I agree to Ablin Limited/ }).check();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/contact');
  // The submission-time trap needs a person-length pause; keep the page open past it.
  await page.waitForTimeout(3200);
});

test('empty submit shows a message per required field and focuses the first', async ({ page }) => {
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Enter your full name.')).toBeVisible();
  await expect(page.getByText('Enter a valid work email so we can reply.')).toBeVisible();
  await expect(page.getByText('Choose an enquiry type.')).toBeVisible();
  await expect(page.getByText('Tell us a little more, at least 20 characters.')).toBeVisible();
  await expect(page.getByText('Tick the box to confirm you agree.')).toBeVisible();
  await expect(page.getByLabel('Full name')).toBeFocused();
  await expect(page.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Full name')).toHaveAttribute('aria-describedby', 'fullName-error');
});

test('a fixed field clears its own error', async ({ page }) => {
  await page.getByRole('button', { name: 'Send message' }).click();
  await page.getByLabel('Full name').fill('Amina Yusuf');
  await expect(page.getByText('Enter your full name.')).toBeHidden();
});

test('success: shows confirmation and moves focus to it', async ({ page }) => {
  await page.route('**/api/contact', (route) => route.fulfill({ status: 200, json: { ok: true } }));
  await fillValid(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  const heading = page.getByRole('heading', { name: 'Message sent' });
  await expect(heading).toBeVisible();
  await expect(heading).toBeFocused();
  await expect(page.getByText('amina@example.com')).toBeVisible();
});

test('sends the honeypot empty and a submission timestamp', async ({ page }) => {
  let body: Record<string, unknown> = {};
  await page.route('**/api/contact', async (route) => {
    body = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 200, json: { ok: true } });
  });
  await fillValid(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('heading', { name: 'Message sent' })).toBeVisible();
  expect(body.website).toBe('');
  expect(typeof body.startedAt).toBe('number');
});

test('delivery failure is reported, never shown as success', async ({ page }) => {
  await page.route('**/api/contact', (route) =>
    route.fulfill({ status: 503, json: { error: 'unavailable' } }),
  );
  await fillValid(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('#form-summary')).toContainText('We could not send your message');
  await expect(page.getByRole('heading', { name: 'Message sent' })).toHaveCount(0);
  // The visitor's input is kept so they can retry.
  await expect(page.getByLabel('Full name')).toHaveValue('Amina Yusuf');
});

test('rate limiting is reported in plain words', async ({ page }) => {
  await page.route('**/api/contact', (route) =>
    route.fulfill({ status: 429, json: { error: 'rate_limited' } }),
  );
  await fillValid(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('#form-summary')).toContainText('Wait a few minutes');
});

test('desktop: form and aside columns end on the same line', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const form = await page
    .locator('main form')
    .locator('xpath=ancestor::div[contains(@class,"card")]')
    .boundingBox();
  const aside = await page.locator('main aside').boundingBox();
  expect(form && aside).toBeTruthy();
  expect(Math.abs(form!.y + form!.height - (aside!.y + aside!.height))).toBeLessThanOrEqual(1);
});

test('honeypot field is not reachable by keyboard or assistive technology', async ({ page }) => {
  const trap = page.locator('#website');
  await expect(trap).toHaveAttribute('tabindex', '-1');
  await expect(
    page.locator('#website').locator('xpath=ancestor::div[@aria-hidden="true"]'),
  ).toHaveCount(1);
});
