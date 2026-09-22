/**
 * One-time (and re-runnable) seed: creates the admin user, sets the site to "live" if it has no availability
 * setting yet, seeds the frameworks list if it has never been saved, and writes a page:{slug} document for each
 * of the 10 known routes from src/cms/seed-data.ts.
 *
 * Run with: pnpm seed   (needs UPSTASH_REDIS_REST_URL/TOKEN, ADMIN_EMAIL, ADMIN_PASSWORD in the environment —
 * see .env.example). Re-running is safe: it overwrites admin:user and every page:{slug}, but never touches
 * insights:*, submission:*, settings:availability or settings:frameworks once each already has a value.
 */
import { seedFrameworks, seedPages } from '../src/cms/seed-data';
import {
  getAdminUser,
  getAvailability,
  getFrameworks,
  putAdminUser,
  putFrameworks,
  putPage,
  setAvailability,
} from '../src/cms/store';
import { hashPassword } from '../src/admin/auth/password';

const now = () => new Date().toISOString();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must both be set (see .env.example) to seed the admin user.',
    );
  }
  if (password.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters.');

  const existingUser = await getAdminUser();
  const passwordHash = await hashPassword(password);
  await putAdminUser({
    id: existingUser?.id ?? crypto.randomUUID(),
    email,
    passwordHash,
    updatedAt: now(),
  });
  console.log(existingUser ? `Updated admin user: ${email}` : `Created admin user: ${email}`);

  const availability = await getAvailability();
  if (!availability) {
    await setAvailability({ mode: 'live', message: '', updatedAt: now() });
    console.log('Set settings:availability to "live".');
  } else {
    console.log(`settings:availability already set (mode: ${availability.mode}) — left unchanged.`);
  }

  const frameworks = await getFrameworks();
  if (!frameworks) {
    await putFrameworks(seedFrameworks);
    console.log(`Seeded settings:frameworks (${seedFrameworks.length} frameworks).`);
  } else {
    console.log(
      `settings:frameworks already set (${frameworks.length} frameworks) — left unchanged.`,
    );
  }

  for (const page of seedPages) {
    await putPage(page);
    console.log(
      `Seeded page:${page.slug} (${page.blocks.length} block${page.blocks.length === 1 ? '' : 's'}).`,
    );
  }

  console.log(
    '\nDone. No Insights articles were seeded — the site has none published yet, same as before.',
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
