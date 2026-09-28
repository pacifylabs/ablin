/**
 * Re-runnable seed. By default it is NON-DESTRUCTIVE for content:
 *   - upserts admin:user from ADMIN_EMAIL / ADMIN_PASSWORD (skip with --skip-admin)
 *   - writes settings:availability, settings:frameworks, every settings:* global and every page:{slug} ONLY if
 *     that key does not exist yet
 * Opt-in overwrites, for resetting content to the bundled defaults:
 *   --globals      overwrite every settings:* global (not availability)
 *   --pages        overwrite every page:{slug}
 *   --collections  overwrite services:*, frameworks and topics
 *   --media        re-create every bundled media:{id} (re-uploading to Cloudinary when configured)
 * One-time migration: a v2 settings:frameworks / topics:index is converted into frameworks / topics (when those
 * don't exist yet) and then deleted.
 * Media: each bundled photo in public/image/photo becomes media:{id}. When CLOUDINARY_* is set it is uploaded to
 * Cloudinary (fixed public_id, so re-running replaces rather than duplicates); otherwise it points at the local file.
 * It never touches insights:* or submission:*.
 *
 * Run with: pnpm seed [-- --pages --globals --skip-admin]
 * (needs UPSTASH_REDIS_REST_URL/TOKEN, and ADMIN_EMAIL/ADMIN_PASSWORD unless --skip-admin; see .env.example).
 */
import { GLOBAL_NAMES, GLOBALS } from '../src/cms/globals';
import { keys } from '../src/cms/keys';
import { redis } from '../src/cms/redis';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { seedPages } from '../src/cms/seed-data';
import {
  getAdminUser,
  getAvailability,
  putAdminUser,
  putPage,
  setAvailability,
} from '../src/cms/store';
import { hashPassword } from '../src/admin/auth/password';
import { uploadImage } from '../src/admin/upload/cloudinary';
import {
  SEED_FRAMEWORKS,
  fromLegacyFramework,
  frameworksListSchema,
  putFrameworks,
} from '../src/cms/collections/frameworks';
import { SEED_MEDIA, putMedia } from '../src/cms/collections/media';
import { SEED_SERVICES, putService } from '../src/cms/collections/services';
import { SEED_TOPICS, putTopics, topicsFromNames } from '../src/cms/collections/topics';

const now = () => new Date().toISOString();

const flags = new Set(process.argv.slice(2));
const overwriteGlobals = flags.has('--globals');
const overwritePages = flags.has('--pages');
const skipAdmin = flags.has('--skip-admin');
const overwriteCollections = flags.has('--collections');
const overwriteMedia = flags.has('--media');

async function exists(key: string): Promise<boolean> {
  return (await redis().exists(key)) === 1;
}

async function seedFrameworksCollection() {
  if ((await exists(keys.frameworksList)) && !overwriteCollections) {
    console.log('frameworks already set — left unchanged (use --collections to overwrite).');
  } else {
    const legacy = await redis().get(keys.legacyFrameworks);
    const migrated = legacy
      ? frameworksListSchema.safeParse(
          z
            .array(z.any())
            .parse(legacy)
            .map((f) => fromLegacyFramework(f)),
        )
      : null;
    if (migrated?.success && !overwriteCollections) {
      await putFrameworks(migrated.data);
      console.log(`Migrated settings:frameworks → frameworks (${migrated.data.length}).`);
    } else {
      await putFrameworks(SEED_FRAMEWORKS);
      console.log(`Seeded frameworks (${SEED_FRAMEWORKS.length}).`);
    }
  }
  if (await exists(keys.legacyFrameworks)) {
    await redis().del(keys.legacyFrameworks);
    console.log('Deleted legacy settings:frameworks.');
  }
}

async function seedTopicsCollection() {
  const legacy = await redis().smembers<string[]>(keys.legacyTopicsIndex);
  if ((await exists(keys.topics)) && !overwriteCollections) {
    console.log('topics already set — left unchanged (use --collections to overwrite).');
  } else {
    // Keep any topic an article introduced (v2 topics:index) after the curated seed list.
    const names = [...SEED_TOPICS.map((t) => t.name), ...legacy];
    const topics = topicsFromNames(names);
    await putTopics(topics);
    console.log(`Seeded topics (${topics.length}).`);
  }
  if (legacy.length > 0 || (await exists(keys.legacyTopicsIndex))) {
    await redis().del(keys.legacyTopicsIndex);
    console.log('Deleted legacy topics:index.');
  }
}

async function seedServicesCollection() {
  for (const service of SEED_SERVICES) {
    const key = keys.service(service.slug);
    if ((await exists(key)) && !overwriteCollections) {
      console.log(`${key} already set — left unchanged.`);
      continue;
    }
    await putService(service);
    console.log(`Seeded ${key}.`);
  }
}

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
  process.env.CLOUDINARY_API_KEY?.trim() &&
  process.env.CLOUDINARY_API_SECRET?.trim(),
);

async function seedMediaCollection() {
  for (const media of SEED_MEDIA) {
    const key = keys.media(media.id);
    if ((await exists(key)) && !overwriteMedia) {
      console.log(`${key} already set — left unchanged (use --media to re-create).`);
      continue;
    }
    let { url, publicId } = media;
    if (cloudinaryConfigured) {
      const buffer = readFileSync(join(process.cwd(), 'public', media.url));
      const result = await uploadImage(buffer, `${media.id}.jpg`, {
        folder: 'ablin-seed',
        publicId: media.id,
      });
      if (!result.ok) throw new Error(`Cloudinary upload failed for ${media.id}: ${result.reason}`);
      ({ url, publicId } = result.data);
    }
    await putMedia({ ...media, url, publicId, createdAt: now() });
    console.log(`Seeded ${key}${publicId ? ' (Cloudinary)' : ' (local file)'}.`);
  }
}

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

  await seedMediaCollection();
  await seedFrameworksCollection();
  await seedTopicsCollection();
  await seedServicesCollection();

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
