/**
 * Re-runnable seed. By default it is NON-DESTRUCTIVE for content:
 *   - upserts admin:user from ADMIN_EMAIL / ADMIN_PASSWORD (skip with --skip-admin)
 *   - writes settings:availability, settings:frameworks, every settings:* global and every page:{slug} ONLY if
 *     that key does not exist yet
 * Opt-in overwrites, for resetting content to the bundled defaults:
 *   --globals   overwrite every settings:* global (not availability)
 *   --pages     overwrite every page:{slug}
 * It never touches insights:* or submission:*.
 *
 * Run with: pnpm seed [-- --pages --globals --skip-admin]
 * (needs UPSTASH_REDIS_REST_URL/TOKEN, and ADMIN_EMAIL/ADMIN_PASSWORD unless --skip-admin; see .env.example).
 */
import { GLOBAL_NAMES, GLOBALS } from '../src/cms/globals';
import { keys } from '../src/cms/keys';
import { redis } from '../src/cms/redis';
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

const flags = new Set(process.argv.slice(2));
const overwriteGlobals = flags.has('--globals');
const overwritePages = flags.has('--pages');
const skipAdmin = flags.has('--skip-admin');

async function seedAdmin() {
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
}

async function main() {
  if (skipAdmin) console.log('Skipped admin:user (--skip-admin).');
  else await seedAdmin();

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

  for (const name of GLOBAL_NAMES) {
    const { key, seed } = GLOBALS[name];
    const exists = (await redis().exists(key)) === 1;
    if (exists && !overwriteGlobals) {
      console.log(`${key} already set — left unchanged (use --globals to overwrite).`);
      continue;
    }
    await redis().set(key, seed);
    console.log(`${exists ? 'Overwrote' : 'Seeded'} ${key}.`);
  }

  for (const page of seedPages) {
    const exists = (await redis().exists(keys.page(page.slug))) === 1;
    if (exists && !overwritePages) {
      console.log(`page:${page.slug} already set — left unchanged (use --pages to overwrite).`);
      continue;
    }
    await putPage(page);
    console.log(
      `${exists ? 'Overwrote' : 'Seeded'} page:${page.slug} (${page.blocks.length} block${page.blocks.length === 1 ? '' : 's'}).`,
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
