/** SHA-256 hex digest. Uses Web Crypto so the same helper works in middleware (edge) and Route Handlers (Node). */
export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, 'hex')).join('');
}
