import { config } from '@/lib/config';

export type ResetEmailResult = { ok: true } | { ok: false; reason: 'not_configured' | 'upstream' };

/**
 * Emails the password-reset link through Resend's HTTP API — the same approach lib/contact-delivery.ts uses for
 * enquiries, so there is one pattern for outbound email in the project rather than two. No SDK: a plain fetch.
 */
export async function sendResetEmail(
  to: string,
  resetUrl: string,
  deps: { fetchImpl?: typeof fetch } = {},
): Promise<ResetEmailResult> {
  const { resendApiKey } = config.contact;
  const fromEmail = config.admin.resetFromEmail;
  const fetchImpl = deps.fetchImpl ?? fetch;

  if (!resendApiKey || !fromEmail) return { ok: false, reason: 'not_configured' };

  try {
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: 'Reset your Ablin admin password',
        text: [
          'A password reset was requested for the Ablin Limited admin dashboard.',
          '',
          `Reset your password: ${resetUrl}`,
          '',
          'This link expires in 30 minutes and can be used once. If you did not request this, ignore this email.',
        ].join('\n'),
      }),
    });
    if (!response.ok) return { ok: false, reason: 'upstream' };
    return { ok: true };
  } catch {
    return { ok: false, reason: 'upstream' };
  }
}
