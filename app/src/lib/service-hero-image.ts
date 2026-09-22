import imagesJson from '@/content/images.json';

type ImageId = keyof typeof imagesJson;

/** Stock hero photograph per service detail page until client assets replace placeholders. */
const BY_SLUG: Partial<Record<string, ImageId>> = {
  'governance-risk-compliance': 'review-documents',
  'iso-compliance-readiness': 'geometric-facade',
  'data-protection-privacy': 'colleagues-desk',
  'ai-governance': 'glass-facade',
  'cybersecurity-governance': 'hero-stairs',
  'technology-risk-it-controls': 'light-stairs',
  'soc2-controls-readiness': 'zigzag-stairs',
  'audit-assurance-regulatory-readiness': 'geometric-facade',
};

export function serviceHeroImageId(slug: string): ImageId {
  return BY_SLUG[slug] ?? 'glass-facade';
}
