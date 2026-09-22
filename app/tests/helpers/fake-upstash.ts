import { createServer, type Server } from 'node:http';

/**
 * A minimal, in-memory stand-in for the Upstash Redis REST API — just enough of it for this project's own
 * commands (GET/SET/DEL/SADD/SREM/SMEMBERS/ZADD/ZREM/ZRANGE/MGET/INCR/EXPIRE, plus /pipeline) — so tests and
 * local smoke-checks can run against something that speaks the real wire protocol without a live Upstash
 * database. Not used by the shipped app; only by tests/dev tooling that import it directly.
 */

type Value = string | Set<string> | Map<string, number> /* sorted set: member -> score */;

interface Store {
  values: Map<string, Value>;
  expiresAt: Map<string, number>;
}

function isExpired(store: Store, key: string): boolean {
  const at = store.expiresAt.get(key);
  return at !== undefined && at <= Date.now();
}

function get(store: Store, key: string): Value | undefined {
  if (isExpired(store, key)) {
    store.values.delete(key);
    store.expiresAt.delete(key);
    return undefined;
  }
  return store.values.get(key);
}

function runCommand(store: Store, cmd: unknown[]): unknown {
  const [nameRaw, ...args] = cmd as [string, ...string[]];
  const name = String(nameRaw).toUpperCase();

  switch (name) {
    case 'GET': {
      const v = get(store, args[0]!);
      return typeof v === 'string' ? v : null;
    }
    case 'GETDEL': {
      const key = args[0]!;
      const v = get(store, key);
      if (typeof v === 'string') {
        store.values.delete(key);
        store.expiresAt.delete(key);
        return v;
      }
      return null;
    }
    case 'SET': {
      const [key, value, ...opts] = args;
      store.values.set(key!, value!);
      const exIndex = opts.findIndex((o) => o.toUpperCase() === 'EX');
      if (exIndex !== -1 && opts[exIndex + 1]) {
        store.expiresAt.set(key!, Date.now() + Number(opts[exIndex + 1]) * 1000);
      } else {
        store.expiresAt.delete(key!);
      }
      return 'OK';
    }
    case 'DEL': {
      let n = 0;
      for (const key of args) {
        if (store.values.delete(key)) n += 1;
        store.expiresAt.delete(key);
      }
      return n;
    }
    case 'SADD': {
      const [key, ...members] = args;
      let set = get(store, key!) as Set<string> | undefined;
      if (!(set instanceof Set)) {
        set = new Set();
        store.values.set(key!, set);
      }
      let added = 0;
      for (const m of members) {
        if (!set.has(m)) {
          set.add(m);
          added += 1;
        }
      }
      return added;
    }
    case 'SREM': {
      const [key, ...members] = args;
      const set = get(store, key!) as Set<string> | undefined;
      if (!(set instanceof Set)) return 0;
      let removed = 0;
      for (const m of members) if (set.delete(m)) removed += 1;
      return removed;
    }
    case 'SMEMBERS': {
      const set = get(store, args[0]!) as Set<string> | undefined;
      return set instanceof Set ? [...set] : [];
    }
    case 'INCR': {
      const key = args[0]!;
      const current = Number(get(store, key) ?? '0');
      const next = current + 1;
      store.values.set(key, String(next));
      return next;
    }
    case 'DECR': {
      const key = args[0]!;
      const current = Number(get(store, key) ?? '0');
      const next = current - 1;
      store.values.set(key, String(next));
      return next;
    }
    case 'ZCARD': {
      const zset = get(store, args[0]!) as Map<string, number> | undefined;
      return zset instanceof Map ? zset.size : 0;
    }
    case 'EXPIRE': {
      const [key, seconds] = args;
      if (!store.values.has(key!)) return 0;
      store.expiresAt.set(key!, Date.now() + Number(seconds) * 1000);
      return 1;
    }
    case 'ZADD': {
      const [key, ...rest] = args;
      let zset = get(store, key!) as Map<string, number> | undefined;
      if (!(zset instanceof Map)) {
        zset = new Map();
        store.values.set(key!, zset);
      }
      let added = 0;
      for (let i = 0; i < rest.length; i += 2) {
        const score = Number(rest[i]);
        const member = rest[i + 1]!;
        if (!zset.has(member)) added += 1;
        zset.set(member, score);
      }
      return added;
    }
    case 'ZREM': {
      const [key, ...members] = args;
      const zset = get(store, key!) as Map<string, number> | undefined;
      if (!(zset instanceof Map)) return 0;
      let removed = 0;
      for (const m of members) if (zset.delete(m)) removed += 1;
      return removed;
    }
    case 'ZRANGE': {
      const [key, minRaw, maxRaw, ...opts] = args;
      const zset = get(store, key!) as Map<string, number> | undefined;
      if (!(zset instanceof Map)) return [];
      const rev = opts.some((o) => o.toUpperCase() === 'REV');
      let entries = [...zset.entries()].sort((a, b) => a[1] - b[1]);
      if (rev) entries = entries.reverse();
      const start = Number(minRaw);
      const stop = Number(maxRaw);
      const end = stop < 0 ? entries.length + stop + 1 : stop + 1;
      return entries.slice(start, end).map(([member]) => member);
    }
    case 'MGET': {
      return args.map((key) => {
        const v = get(store, key);
        return typeof v === 'string' ? v : null;
      });
    }
    default:
      throw new Error(`fake-upstash: unsupported command ${name}`);
  }
}

function encode(result: unknown): unknown {
  if (typeof result === 'string') return Buffer.from(result, 'utf8').toString('base64');
  if (Array.isArray(result))
    return result.map((r) =>
      typeof r === 'string' ? Buffer.from(r, 'utf8').toString('base64') : r,
    );
  return result;
}

export function startFakeUpstash(
  port = 0,
): Promise<{ url: string; token: string; server: Server; store: Store }> {
  const store: Store = { values: new Map(), expiresAt: new Map() };
  const token = 'fake-token';

  const server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      try {
        const auth = req.headers.authorization;
        if (auth !== `Bearer ${token}`) {
          res.writeHead(401, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ error: 'unauthorized' }));
          return;
        }
        const body = chunks.length > 0 ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : null;
        const isPipeline = req.url === '/pipeline' || req.url === '/multi-exec';

        if (isPipeline) {
          const results = (body as unknown[][]).map((cmd) => {
            try {
              return { result: encode(runCommand(store, cmd)) };
            } catch (error) {
              return { error: error instanceof Error ? error.message : String(error) };
            }
          });
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(JSON.stringify(results));
          return;
        }

        const result = encode(runCommand(store, body as unknown[]));
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ result }));
      } catch (error) {
        res.writeHead(500, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      resolve({ url: `http://127.0.0.1:${port}`, token, server, store });
    });
  });
}
