import { hash, verify } from '@node-rs/argon2';

/**
 * argon2id password hashing. Node runtime only — @node-rs/argon2 is a native binding and cannot run on the edge,
 * which is why these are called from Route Handlers (Node runtime, the default) and never from middleware.
 */

const OPTIONS = {
  algorithm: 2, // Algorithm.Argon2id — the numeric value is used directly because it's an ambient const enum,
  // which isolatedModules (required by Next's per-file compilation) does not allow importing and inlining.
  memoryCost: 19456, // 19 MiB, OWASP's current minimum recommendation for argon2id
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, OPTIONS);
}

export function verifyPassword(passwordHash: string, plain: string): Promise<boolean> {
  return verify(passwordHash, plain).catch(() => false);
}

export const MIN_PASSWORD_LENGTH = 12;

export function isPasswordStrongEnough(plain: string): boolean {
  return plain.length >= MIN_PASSWORD_LENGTH;
}
