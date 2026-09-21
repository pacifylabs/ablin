import { z } from 'zod';

/** Minimum seconds a human needs to write a message; faster submissions are treated as bots. */
export const MIN_FILL_MS = 3000;

/** Shared by the browser (inline errors) and the server (authoritative check), so the rules cannot drift. */
export function buildContactSchema(enquiryTypes: readonly string[]) {
  return z.object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Enter your full name.')
      .max(120, 'Use 120 characters or fewer.'),
    email: z
      .string()
      .trim()
      .max(254, 'Use 254 characters or fewer.')
      .pipe(z.email('Enter a valid work email so we can reply.')),
    organisation: z.string().trim().max(160, 'Use 160 characters or fewer.'),
    enquiryType: z
      .string()
      .refine((value) => enquiryTypes.includes(value), 'Choose an enquiry type.'),
    message: z
      .string()
      .trim()
      .min(20, 'Tell us a little more, at least 20 characters.')
      .max(4000, 'Use 4,000 characters or fewer.'),
    consent: z.boolean().refine((value) => value, 'Tick the box to confirm you agree.'),
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
