'use client';

import { useId } from 'react';
import type { Block } from '@/cms/schema';
import { RichTextEditor } from './RichTextEditor';
import { ImagePicker } from './ImagePicker';
import {
  CtaField,
  IllustrationField,
  LabelledSelectField,
  SelectField,
  SlugChecklist,
  StringListEditor,
  TextField,
  TitleDescListEditor,
} from './fields/shared';
import styles from './admin.module.css';

export interface BlockRefs {
  services: readonly { slug: string; title: string }[];
  audiences: readonly { slug: string; title: string }[];
  frameworks: readonly { id: string; name: string }[];
}

/**
 * One edit form per block type, matching cms/schema.ts's Block union exactly (and cms/BlockRenderer.tsx's
 * switch, which is what actually turns this data into markup). Editing `data` here can never produce a shape
 * BlockRenderer doesn't already know how to render — the two are typed from the same union.
 */
export function BlockFields({
  block,
  onChange,
  refs,
}: {
  block: Block;
  onChange: (data: Block['data']) => void;
  refs: BlockRefs;
}) {
  const secondaryToggleId = useId();
  switch (block.type) {
    case 'hero': {
      const data = block.data;
      if (data.variant === 'home') {
        return (
          <>
            <SelectField
              label="Variant"
              value="home"
              options={['home', 'page']}
              onChange={(v) =>
                v === 'page' &&
                onChange({
                  variant: 'page',
                  title: data.title,
                  lead: data.lead,
                  illustration: 'structure',
                })
              }
            />
            <TextField
              label="Eyebrow"
              value={data.eyebrow}
              onChange={(v) => onChange({ ...data, eyebrow: v })}
            />
            <TextField
              label="Title"
              value={data.title}
              onChange={(v) => onChange({ ...data, title: v })}
              multiline
            />
            <TextField
              label="Lead"
              value={data.lead}
              onChange={(v) => onChange({ ...data, lead: v })}
              multiline
            />
            <CtaField
              label="Primary button"
              value={data.primary}
              onChange={(v) => onChange({ ...data, primary: v })}
            />
            <CtaField
              label="Secondary button"
              value={data.secondary}
              onChange={(v) => onChange({ ...data, secondary: v })}
            />
            <TextField
              label="Frameworks strip label"
              value={data.frameworksLabel}
              onChange={(v) => onChange({ ...data, frameworksLabel: v })}
            />
            <StringListEditor
              label="Framework names shown"
              items={data.frameworkNames}
              onChange={(v) => onChange({ ...data, frameworkNames: v })}
            />
          </>
        );
      }
      return (
        <>
          <SelectField
            label="Variant"
            value="page"
            options={['home', 'page']}
            onChange={(v) =>
              v === 'home' &&
              onChange({
                variant: 'home',
                title: data.title,
                lead: data.lead,
                eyebrow: '',
                primary: { label: '', href: '/contact' },
                secondary: { label: '', href: '/contact' },
                frameworksLabel: '',
                frameworkNames: [],
              })
            }
          />
          <TextField
            label="Kicker (optional)"
            value={data.kicker ?? ''}
            onChange={(v) => onChange({ ...data, kicker: v || undefined })}
          />
          <TextField
            label="Title"
            value={data.title}
            onChange={(v) => onChange({ ...data, title: v })}
            multiline
          />
          <TextField
            label="Lead"
            value={data.lead}
            onChange={(v) => onChange({ ...data, lead: v })}
            multiline
          />
          <IllustrationField
            value={data.illustration}
            onChange={(v) => onChange({ ...data, illustration: v })}
          />
          <ImagePicker
            label="Photo (replaces the illustration when set)"
            value={data.image}
            onChange={(v) => onChange({ ...data, image: v })}
          />
        </>
      );
    }

    case 'capabilityGrid': {
      const data = block.data;
      return (
        <>
          <TextField
            label="Title"
            value={data.title}
            onChange={(v) => onChange({ ...data, title: v })}
          />
          <TextField
            label="Lead"
            value={data.lead}
            onChange={(v) => onChange({ ...data, lead: v })}
            multiline
          />
          <div className={styles.field}>
            <label>Capabilities</label>
            {data.items.map((item, i) => (
              <fieldset key={i} className={styles.repeatItem}>
                <legend className={styles.hint}>Capability {i + 1}</legend>
                <TextField
                  label="Title"
                  value={item.title}
                  onChange={(v) =>
                    onChange({
                      ...data,
                      items: data.items.map((it, j) => (j === i ? { ...it, title: v } : it)),
                    })
                  }
                />
                <TextField
                  label="Description"
                  value={item.description}
                  onChange={(v) =>
                    onChange({
                      ...data,
                      items: data.items.map((it, j) => (j === i ? { ...it, description: v } : it)),
                    })
                  }
                  multiline
                />
                <LabelledSelectField
                  label="Links to service"
                  value={item.serviceSlug}
                  options={refs.services.map((s) => ({ value: s.slug, label: s.title }))}
                  onChange={(v) =>
                    onChange({
                      ...data,
                      items: data.items.map((it, j) => (j === i ? { ...it, serviceSlug: v } : it)),
                    })
                  }
                />
                <IllustrationField
                  value={item.illustration}
                  onChange={(v) =>
                    onChange({
                      ...data,
                      items: data.items.map((it, j) => (j === i ? { ...it, illustration: v } : it)),
                    })
                  }
                />
                {data.items.length > 1 ? (
                  <button
                    type="button"
                    className={styles.iconBtn}
                    data-danger="true"
                    style={{ width: 'auto', padding: '0 0.75rem' }}
                    onClick={() =>
                      onChange({ ...data, items: data.items.filter((_, j) => j !== i) })
                    }
                  >
                    Remove
                  </button>
                ) : null}
              </fieldset>
            ))}
            <button
              type="button"
              className={styles.iconBtn}
              style={{ width: 'auto', padding: '0 0.75rem' }}
              onClick={() =>
                onChange({
                  ...data,
                  items: [
                    ...data.items,
                    {
                      title: '',
                      description: '',
                      serviceSlug: refs.services[0]?.slug ?? '',
                      illustration: 'structure',
                    },
                  ],
                })
              }
            >
              + Add capability
            </button>
          </div>
        </>
      );
    }

    case 'serviceList': {
      const data = block.data;
      return (
        <>
          <SelectField
            label="Variant"
            value={data.variant}
            options={['overview', 'catalogue']}
            onChange={(v) => onChange({ ...data, variant: v } as typeof data)}
          />
          {data.variant === 'overview' ? (
            <TextField
              label="Kicker (optional)"
              value={data.kicker ?? ''}
              onChange={(v) => onChange({ ...data, kicker: v || undefined })}
            />
          ) : null}
          <TextField
            label="Title"
            value={data.title}
            onChange={(v) => onChange({ ...data, title: v })}
          />
          <TextField
            label="Lead"
            value={data.lead}
            onChange={(v) => onChange({ ...data, lead: v })}
            multiline
          />
          <SlugChecklist
            label="Services shown"
            options={refs.services}
            selected={data.serviceSlugs}
            onChange={(v) => onChange({ ...data, serviceSlugs: v })}
          />
        </>
      );
    }

    case 'approachSteps': {
      const data = block.data;
      return (
        <>
          <TextField
            label="Kicker"
            value={data.kicker}
            onChange={(v) => onChange({ ...data, kicker: v })}
          />
          <TextField
            label="Title"
            value={data.title}
            onChange={(v) => onChange({ ...data, title: v })}
          />
          <TextField
            label="Lead"
            value={data.lead}
            onChange={(v) => onChange({ ...data, lead: v })}
            multiline
          />
          <TitleDescListEditor
            label="Step"
            items={data.steps}
            onChange={(v) => onChange({ ...data, steps: v as typeof data.steps })}
            fixedCount
          />
        </>
      );
    }

    case 'audienceGrid': {
      const data = block.data;
      if (data.variant === 'teaser') {
        return (
          <>
            <SelectField
              label="Variant"
              value="teaser"
              options={['teaser', 'rows']}
              onChange={(v) =>
                v === 'rows' &&
                onChange({
                  variant: 'rows',
                  title: data.title,
                  lead: data.lead,
                  audienceSlugs: data.audienceSlugs,
                })
              }
            />
            <TextField
              label="Kicker"
              value={data.kicker}
              onChange={(v) => onChange({ ...data, kicker: v })}
            />
            <TextField
              label="Title"
              value={data.title}
              onChange={(v) => onChange({ ...data, title: v })}
            />
            <TextField
              label="Lead"
              value={data.lead}
              onChange={(v) => onChange({ ...data, lead: v })}
              multiline
            />
            <ImagePicker
              label="Photo"
              value={data.image}
              onChange={(v) => v && onChange({ ...data, image: v })}
            />
            <SlugChecklist
              label="Audiences shown"
              options={refs.audiences}
              selected={data.audienceSlugs}
              onChange={(v) => onChange({ ...data, audienceSlugs: v })}
            />
          </>
        );
      }
      return (
        <>
          <SelectField
            label="Variant"
            value="rows"
            options={['teaser', 'rows']}
            onChange={(v) =>
              v === 'teaser' &&
              refs.audiences[0] &&
              onChange({
                variant: 'teaser',
                title: data.title,
                lead: data.lead,
                kicker: '',
                audienceSlugs: data.audienceSlugs,
                image: { url: '', alt: '', width: 1, height: 1, blur: '' },
              })
            }
          />
          <TextField
            label="Title"
            value={data.title}
            onChange={(v) => onChange({ ...data, title: v })}
          />
          <TextField
            label="Lead"
            value={data.lead}
            onChange={(v) => onChange({ ...data, lead: v })}
            multiline
          />
          <SlugChecklist
            label="Audiences shown"
            options={refs.audiences}
            selected={data.audienceSlugs}
            onChange={(v) => onChange({ ...data, audienceSlugs: v })}
          />
        </>
      );
    }

    case 'whyList': {
      const data = block.data;
      if (data.variant === 'cards') {
        return (
          <>
            <SelectField
              label="Variant"
              value="cards"
              options={['cards', 'cells']}
              onChange={(v) =>
                v === 'cells' &&
                onChange({
                  variant: 'cells',
                  title: data.title,
                  lead: data.lead,
                  items: data.points,
                })
              }
            />
            <TextField
              label="Title"
              value={data.title}
              onChange={(v) => onChange({ ...data, title: v })}
            />
            <TextField
              label="Lead"
              value={data.lead}
              onChange={(v) => onChange({ ...data, lead: v })}
              multiline
            />
            <IllustrationField
              value={data.illustration}
              onChange={(v) => onChange({ ...data, illustration: v })}
            />
            <TitleDescListEditor
              label="Point"
              items={data.points}
              onChange={(v) => onChange({ ...data, points: v })}
            />
          </>
        );
      }
      return (
        <>
          <SelectField
            label="Variant"
            value="cells"
            options={['cards', 'cells']}
            onChange={(v) =>
              v === 'cards' &&
              onChange({
                variant: 'cards',
                title: data.title,
                lead: data.lead,
                illustration: 'controls',
                points: data.items,
              })
            }
          />
          <TextField
            label="Title"
            value={data.title}
            onChange={(v) => onChange({ ...data, title: v })}
          />
          <TextField
            label="Lead"
            value={data.lead}
            onChange={(v) => onChange({ ...data, lead: v })}
            multiline
          />
          <TitleDescListEditor
            label="Item"
            items={data.items}
            onChange={(v) => onChange({ ...data, items: v })}
          />
        </>
      );
    }

    case 'frameworkIndex': {
      const data = block.data;
      return (
        <>
          <TextField
            label="Title"
            value={data.title}
            onChange={(v) => onChange({ ...data, title: v })}
          />
          <TextField
            label="Lead"
            value={data.lead}
            onChange={(v) => onChange({ ...data, lead: v })}
            multiline
          />
          <TextField
            label="Note"
            value={data.note}
            onChange={(v) => onChange({ ...data, note: v })}
            multiline
          />
          <SlugChecklist
            label="Frameworks shown (none selected = show all)"
            options={refs.frameworks.map((f) => ({ slug: f.id, title: f.name }))}
            selected={data.frameworkIds}
            onChange={(v) => onChange({ ...data, frameworkIds: v })}
          />
        </>
      );
    }

    case 'textRich': {
      const data = block.data;
      if (data.variant === 'split') {
        return (
          <>
            <TextField
              label="Heading"
              value={data.heading}
              onChange={(v) => onChange({ ...data, heading: v })}
            />
            <div className={styles.field}>
              <label>Content</label>
              <RichTextEditor
                value={data.doc}
                onChange={(v) => onChange({ ...data, doc: v })}
                ariaLabel="Rich text content"
              />
            </div>
          </>
        );
      }
      return (
        <>
          <TextField
            label="Page title"
            value={data.title}
            onChange={(v) => onChange({ ...data, title: v })}
          />
          <TextField
            label="Lead"
            value={data.lead}
            onChange={(v) => onChange({ ...data, lead: v })}
            multiline
          />
          <TextField
            label="Last updated"
            value={data.updated}
            onChange={(v) => onChange({ ...data, updated: v })}
          />
          <SelectField
            label="Review status"
            value={data.reviewStatus}
            options={['draft', 'approved']}
            onChange={(v) => onChange({ ...data, reviewStatus: v })}
          />
          <div className={styles.field}>
            <label>Content (each heading starts a new section)</label>
            <RichTextEditor
              value={data.doc}
              onChange={(v) => onChange({ ...data, doc: v })}
              ariaLabel="Legal document content"
            />
          </div>
        </>
      );
    }

    case 'image': {
      const data = block.data;
      return (
        <>
          <ImagePicker label="Image" value={data} onChange={(v) => v && onChange(v)} />
          <TextField
            label="Aspect ratio (optional, e.g. 16 / 9)"
            value={data.ratio ?? ''}
            onChange={(v) => onChange({ ...data, ratio: v || undefined })}
          />
        </>
      );
    }

    case 'ctaBand': {
      const data = block.data;
      return (
        <>
          <TextField
            label="Title"
            value={data.title}
            onChange={(v) => onChange({ ...data, title: v })}
          />
          <TextField
            label="Body"
            value={data.body}
            onChange={(v) => onChange({ ...data, body: v })}
            multiline
          />
          <CtaField
            label="Primary button"
            value={data.primary}
            onChange={(v) => onChange({ ...data, primary: v })}
          />
          <div className={styles.checkboxField}>
            <input
              type="checkbox"
              id={secondaryToggleId}
              checked={Boolean(data.secondary)}
              onChange={(e) =>
                onChange({
                  ...data,
                  secondary: e.target.checked ? { label: '', href: '/contact' } : undefined,
                })
              }
            />
            <label htmlFor={secondaryToggleId}>Show a secondary button</label>
          </div>
          {data.secondary ? (
            <CtaField
              label="Secondary button"
              value={data.secondary}
              onChange={(v) => onChange({ ...data, secondary: v })}
            />
          ) : null}
          <ImagePicker
            label="Photo (optional)"
            value={data.image}
            onChange={(v) => onChange({ ...data, image: v })}
          />
        </>
      );
    }

    default: {
      const never: never = block;
      throw new Error(`Unhandled block type: ${JSON.stringify(never)}`);
    }
  }
}
