import type { Block, BlockType } from '@/cms/schema';
import type { BlockRefs } from './BlockFields';

const EMPTY_DOC = { type: 'doc' as const, content: [{ type: 'paragraph' }] };

/** A sensible, valid starting `data` for a freshly added block of the given type. */
function defaultData(type: BlockType, refs: BlockRefs): Block['data'] {
  switch (type) {
    case 'hero':
      return { variant: 'page', title: '', lead: '', illustration: 'structure' };
    case 'capabilityGrid':
      return {
        title: '',
        lead: '',
        items: [
          {
            title: '',
            description: '',
            serviceSlug: refs.services[0]?.slug ?? '',
            illustration: 'structure',
          },
        ],
      };
    case 'serviceList':
      return {
        variant: 'overview',
        title: '',
        lead: '',
        serviceSlugs: refs.services.map((s) => s.slug),
      };
    case 'approachSteps':
      return {
        kicker: '',
        title: '',
        lead: '',
        steps: Array.from({ length: 5 }, () => ({ title: '', description: '' })),
      };
    case 'audienceGrid':
      return {
        variant: 'rows',
        title: '',
        lead: '',
        audienceSlugs: refs.audiences.map((a) => a.slug),
      };
    case 'whyList':
      return {
        variant: 'cells',
        title: '',
        lead: '',
        items: [
          { title: '', description: '' },
          { title: '', description: '' },
          { title: '', description: '' },
        ],
      };
    case 'frameworkIndex':
      return { title: '', lead: '', note: '', frameworkIds: [] };
    case 'textRich':
      return { variant: 'split', heading: '', doc: EMPTY_DOC };
    case 'image':
      return { url: '', alt: '', width: 1, height: 1, blur: '' };
    case 'ctaBand':
      return { title: '', body: '', primary: { label: '', href: '/contact' } };
    default: {
      const never: never = type;
      throw new Error(`Unhandled block type: ${String(never)}`);
    }
  }
}

export function newBlock(type: BlockType, refs: BlockRefs): Block {
  return { id: `${type}-${crypto.randomUUID()}`, type, data: defaultData(type, refs) } as Block;
}
