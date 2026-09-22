import { randomBytes } from 'node:crypto';

/** Opaque, unguessable session/reset tokens: 256 bits of randomness, base64url so they're cookie- and URL-safe. */
export function randomToken(): string {
  return randomBytes(32).toString('base64url');
}
