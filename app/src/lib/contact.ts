import { z } from 'zod';

/** Minimum seconds a human needs to write a message; faster submissions are treated as bots. */
export const MIN_FILL_MS = 3000;

/** The visitor-facing validation messages, from `settings:contact.errors`. */
export interface ContactMessages {
  fullName: string;
  email: string;
  enquiryType: string;
  message: string;
  consent: string;
  tooLong: string;
}

/**
 * Shared by the browser (inline errors) and the server (authoritative check), so the rules cannot drift. Messages
 * are admin copy; the limits are fixed here.
 */
export function buildContactSchema(enquiryTypes: readonly string[], messages: ContactMessages) {
  return z.object({
    fullName: z.string().trim().min(2, messages.fullName).max(120, messages.tooLong),
    email: z.string().trim().max(254, messages.tooLong).pipe(z.email(messages.email)),
    organisation: z.string().trim().max(160, messages.tooLong),
    enquiryType: z.string().refine((value) => enquiryTypes.includes(value), messages.enquiryType),
    message: z.string().trim().min(20, messages.message).max(4000, messages.tooLong),
    consent: z.boolean().refine((value) => value, messages.consent),
    /** Honeypot: hidden from people, so any value means a bot. */
    website: z.string().max(0),
    /** When the form was shown (epoch ms), for the submission-time trap. */
    startedAt: z.number().int().positive(),
  });
}

export type ContactInput = z.infer<ReturnType<typeof buildContactSchema>>;
export type ContactField = keyof ContactInput;
export type FieldErrors = Partial<Record<ContactField, string>>;

/** Flatten zod issues to one message per field. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as ContactField | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
