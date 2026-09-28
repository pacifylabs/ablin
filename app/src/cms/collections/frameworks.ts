import { cache } from 'react';
import { z } from 'zod';
import { readCached } from '../cached';
import { textSchema, optionalTextSchema } from '../fields';
import { keys } from '../keys';
import { redis } from '../redis';
import frameworksJson from '@/content/frameworks.json';
import { ICON_NAMES } from './icons';
import { mediaRefSchema, resolveImage, type ResolvedImage } from './media';

/**
 * The frameworks Ablin advises on (DS v3 §9), one ordered list under `frameworks`: array order is display order.
 * A real certification or partner logo renders ONLY when `approvedByClient` is true (DS v3 §7.6, §11); otherwise the
 * framework shows its line icon.
 */
export const frameworkSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens'),
  name: textSchema,
  /** Short descriptor under the name, e.g. "Information security". */
  descriptor: textSchema,
  icon: z.enum(ICON_NAMES),
  logo: mediaRefSchema.nullable(),
  approvedByClient: z.boolean(),
  /** Who publishes the framework, stated as a fact, never as an endorsement. */
  publisher: optionalTextSchema,
  edition: optionalTextSchema,
  /** Authoritative pages so a reader can check the framework at its source. */
  sources: z.array(z.object({ label: textSchema, url: z.url().startsWith('https://') })),
});
export type Framework = z.infer<typeof frameworkSchema>;

export const frameworksListSchema = z
  .array(frameworkSchema)
  .refine(
    (list) => new Set(list.map((f) => f.id)).size === list.length,
    'Framework ids must be unique',
  );

const ICON_BY_ID: Record<string, Framework['icon']> = {
  'iso-27001': 'shield-check',
  'iso-42001': 'target',
  'uk-gdpr': 'document',
  'soc-2': 'layers',
  'nist-ai-rmf': 'trend',
};
const DESCRIPTOR_BY_ID: Record<string, string> = {
  'iso-27001': 'Information security',
  'iso-42001': 'AI management',
  'uk-gdpr': 'Data protection',
  'soc-2': 'Controls readiness',
  'nist-ai-rmf': 'AI risk management',
};

type LegacyFramework = {
  id: string;
  name: string;
  scope: string;
  publisher: string;
  edition?: string;
  sources: { label: string; url: string }[];
};

/** Maps the v2 shape (content/frameworks.json, settings:frameworks) onto the v3 collection. */
export function fromLegacyFramework(f: LegacyFramework): Framework {
  return {
    id: f.id,
    name: f.name,
    descriptor: DESCRIPTOR_BY_ID[f.id] ?? f.scope,
    icon: ICON_BY_ID[f.id] ?? 'document',
    logo: null,
    approvedByClient: false,
    publisher: f.publisher,
    edition: f.edition ?? '',
    sources: f.sources,
  };
}

export const SEED_FRAMEWORKS: readonly Framework[] = frameworksListSchema.parse(
  (frameworksJson as LegacyFramework[]).map(fromLegacyFramework),
);

export const getFrameworks = cache(() =>
  readCached<readonly Framework[]>(keys.frameworksList, frameworksListSchema, SEED_FRAMEWORKS),
);

export async function readFrameworks(): Promise<Framework[] | null> {
  const raw = await redis().get(keys.frameworksList);
  return raw ? frameworksListSchema.parse(raw) : null;
}

export async function putFrameworks(list: readonly Framework[]): Promise<void> {
  await redis().set(keys.frameworksList, list);
}

export interface FrameworkWithMark extends Framework {
  /** The approved logo, resolved; null unless `approvedByClient` is true and the media exists. */
  mark: ResolvedImage | null;
}

/** Resolve each framework's logo, honouring the client-approval rule (DS v3 §7.6). */
export async function withMarks(list: readonly Framework[]): Promise<FrameworkWithMark[]> {
  return Promise.all(
    list.map(async (f) => ({
      ...f,
      mark: f.approvedByClient && f.logo ? await resolveImage(f.logo) : null,
    })),
  );
}
