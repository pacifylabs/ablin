import { config } from '@/lib/config';

export interface ContactMessage {
  fullName: string;
  email: string;
  organisation: string;
  /** Human label for the enquiry type, taken from trusted content, never from the visitor. */
  enquiryLabel: string;
  message: string;
}

export type DeliveryResult =
  { ok: true } | { ok: false; reason: 'not_configured' | 'rejected' | 'unreachable' };

export interface DeliveryDeps {
  fetchImpl?: typeof fetch;
  contact?: typeof config.contact;
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/** Strip line breaks so nothing a visitor typed can add a header or a second subject line. */
function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

/**
 * Emails an enquiry to the firm. Only fields the firm needs to reply are sent; no IP address or user agent leaves
 * the server. `reply_to` is the enquirer's address (already validated as an email), so replying goes to them.
 * A failure is returned, never swallowed: the caller must not tell the visitor it worked.
 */
export async function deliverContact(
  message: ContactMessage,
  deps: DeliveryDeps = {},
): Promise<DeliveryResult> {
  const { resendApiKey, toEmail, fromEmail } = deps.contact ?? config.contact;
  const fetchImpl = deps.fetchImpl ?? fetch;

  if (!resendApiKey || !toEmail || !fromEmail) return { ok: false, reason: 'not_configured' };

  const lines = [
    `Name: ${oneLine(message.fullName)}`,
    `Email: ${message.email}`,
    `Organisation: ${oneLine(message.organisation) || 'Not given'}`,
    `Enquiry type: ${message.enquiryLabel}`,
    '',
    message.message,
  ];

  try {
    const response = await fetchImpl(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: message.email,
        subject: `Website enquiry: ${message.enquiryLabel}`,
        text: lines.join('\n'),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error(`Enquiry email rejected by the provider with status ${response.status}.`);
      return { ok: false, reason: 'rejected' };
    }
    return { ok: true };
  } catch (error) {
    console.error(
      'Enquiry email provider unreachable:',
      error instanceof Error ? error.message : 'unknown error',
    );
    return { ok: false, reason: 'unreachable' };
  }
}
