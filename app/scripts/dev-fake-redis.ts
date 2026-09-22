/**
 * Dev-only: runs tests/helpers/fake-upstash.ts as a standalone server on a fixed port, so `pnpm dev`/`pnpm
 * start` can point UPSTASH_REDIS_REST_URL at something real-enough for manual smoke testing without a live
 * Upstash database. Never used by the shipped app or by CI — see tests/helpers/fake-upstash.ts itself for what
 * it does and doesn't implement.
 */
import { startFakeUpstash } from '../tests/helpers/fake-upstash';

const PORT = Number(process.env.FAKE_REDIS_PORT ?? 8079);

startFakeUpstash(PORT)
  .then(({ url, token }) => {
    console.log(`Fake Upstash REST server: ${url}`);
    console.log('Set in .env.local:');
    console.log(`  UPSTASH_REDIS_REST_URL=${url}`);
    console.log(`  UPSTASH_REDIS_REST_TOKEN=${token}`);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
