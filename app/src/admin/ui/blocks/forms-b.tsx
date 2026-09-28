'use client';

import { ICON_NAMES } from '@/cms/collections/icons';
import { IMAGE_RATIOS } from '@/cms/blocks';
import { MediaField } from '../MediaField';
import { RichTextEditor } from '../RichTextEditor';
import {
  CheckboxField,
  LinkField,
  ListEditor,
  NumberField,
  OptionalLinkField,
  RefPicker,
} from '../fields/more';
import { SelectField, TextField } from '../fields/shared';
import type { FormProps } from './types';

type Step = { title: string; text: string };

function StepsEditor({ steps, onChange }: { steps: Step[]; onChange: (s: Step[]) => void }) {
  return (
    <ListEditor
      label="Steps (numbered 01, 02… in order)"
      itemLabel="Step"
      items={steps}
      min={1}
      max={8}
      onChange={onChange}
      create={() => ({ title: '', text: '' })}
      render={(step, update) => (
        <>
          <TextField
            label="Title"
            value={step.title}
            onChange={(title) => update({ ...step, title })}
          />
          <TextField
            label="Text"
            value={step.text}
            multiline
            onChange={(text) => update({ ...step, text })}
          />
        </>
      )}
    />
  );
}

type IconItem = { icon: (typeof ICON_NAMES)[number]; title: string; text: string };

function IconItemsEditor({
  items,
  onChange,
  max,
}: {
  items: IconItem[];
  onChange: (i: IconItem[]) => void;
  max: number;
}) {
  return (
    <ListEditor
      label="Items"
      itemLabel="Item"
      items={items}
      min={1}
      max={max}
      onChange={onChange}
      create={() => ({ icon: 'shield' as const, title: '', text: '' })}
      render={(item, update) => (
        <>
          <SelectField
            label="Icon"
            value={item.icon}
            options={ICON_NAMES}
            onChange={(icon) => update({ ...item, icon })}
          />
          <TextField
            label="Title"
            value={item.title}
            onChange={(title) => update({ ...item, title })}
          />
          <TextField
            label="Text"
            value={item.text}
            multiline
            onChange={(text) => update({ ...item, text })}
          />
        </>
      )}
    />
  );
}

export function ApproachSplitForm({ data, onChange }: FormProps<'approachSplit'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <TextField
        label="Eyebrow (optional)"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <TextField label="Heading" value={data.title} onChange={(title) => set({ title })} />
      <TextField
        label="Lead (optional)"
        value={data.lead}
        multiline
        onChange={(lead) => set({ lead })}
      />
      <MediaField
        label="Photo (shown 4:5)"
        value={data.image}
        onChange={(image) => set({ image })}
      />
      <OptionalLinkField
        label="Round badge"
        value={data.badge}
        onChange={(badge) => set({ badge })}
      />
      <StepsEditor steps={data.steps} onChange={(steps) => set({ steps })} />
    </>
  );
}

export function ApproachStepsForm({ data, onChange }: FormProps<'approachSteps'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <TextField
        label="Eyebrow (optional)"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <TextField label="Heading" value={data.title} onChange={(title) => set({ title })} />
      <TextField
        label="Lead (optional)"
        value={data.lead}
        multiline
        onChange={(lead) => set({ lead })}
      />
      <CheckboxField
        label="Compact (two columns on wide screens)"
        checked={data.compact}
        onChange={(compact) => set({ compact })}
      />
      <StepsEditor steps={data.steps} onChange={(steps) => set({ steps })} />
    </>
  );
}

export function AudienceListForm({ data, onChange }: FormProps<'audienceList'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <TextField
        label="Eyebrow (optional)"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <TextField label="Heading" value={data.title} onChange={(title) => set({ title })} />
      <TextField
        label="Lead (optional)"
        value={data.lead}
        multiline
        onChange={(lead) => set({ lead })}
      />
      <ListEditor
        label="Audiences"
        itemLabel="Audience"
        items={data.items}
        min={1}
        onChange={(items) => set({ items })}
        create={() => ({ title: '', text: '', anchorId: '' })}
        render={(item, update) => (
          <>
            <TextField
              label="Title"
              value={item.title}
              onChange={(title) => update({ ...item, title })}
            />
            <TextField
              label="Text"
              value={item.text}
              multiline
              onChange={(text) => update({ ...item, text })}
            />
            <TextField
              label="Anchor (optional)"
              value={item.anchorId}
              placeholder="e.g. smes"
              onChange={(anchorId) => update({ ...item, anchorId })}
            />
          </>
        )}
      />
      <MediaField
        label="Tall photo (optional)"
        value={data.image}
        onChange={(image) => set({ image })}
      />
      <CheckboxField
        label="Show the question panel on the photo"
        checked={data.note !== null}
        onChange={(on) =>
          set({ note: on ? { title: '', text: '', cta: { label: '', href: '/contact' } } : null })
        }
      />
      {data.note ? (
        <>
          <TextField
            label="Panel question"
            value={data.note.title}
            onChange={(title) => set({ note: { ...data.note!, title } })}
          />
          <TextField
            label="Panel line (optional)"
            value={data.note.text}
            onChange={(text) => set({ note: { ...data.note!, text } })}
          />
          <LinkField
            label="Panel button"
            value={data.note.cta}
            onChange={(cta) => set({ note: { ...data.note!, cta } })}
          />
        </>
      ) : null}
    </>
  );
}

export function SplitImageForm({ data, onChange }: FormProps<'splitImage'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <TextField
        label="Eyebrow (optional)"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <TextField label="Heading" value={data.title} onChange={(title) => set({ title })} />
      <div>
        <p>Text</p>
        <RichTextEditor value={data.body} ariaLabel="Text" onChange={(body) => set({ body })} />
      </div>
      <MediaField label="Photo" value={data.image} onChange={(image) => set({ image })} />
      <SelectField
        label="Photo side"
        value={data.imageSide}
        options={['left', 'right'] as const}
        onChange={(imageSide) => set({ imageSide })}
      />
      <OptionalLinkField label="Button" value={data.cta} onChange={(cta) => set({ cta })} />
    </>
  );
}

export function WhyGridForm({ data, onChange }: FormProps<'whyGrid'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <TextField
        label="Eyebrow (optional)"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <TextField label="Heading" value={data.title} onChange={(title) => set({ title })} />
      <TextField
        label="Intro line (optional)"
        value={data.intro}
        onChange={(intro) => set({ intro })}
      />
      <IconItemsEditor items={data.items} max={8} onChange={(items) => set({ items })} />
    </>
  );
}

export function ValuesGridForm({ data, onChange }: FormProps<'valuesGrid'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <TextField
        label="Eyebrow (optional)"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <TextField label="Heading" value={data.title} onChange={(title) => set({ title })} />
      <TextField
        label="Lead (optional)"
        value={data.lead}
        multiline
        onChange={(lead) => set({ lead })}
      />
      <IconItemsEditor items={data.items} max={9} onChange={(items) => set({ items })} />
    </>
  );
}

export function MissionVisionForm({ data, onChange }: FormProps<'missionVision'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <TextField
        label="Eyebrow (optional)"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <TextField
        label="Mission heading"
        value={data.mission.title}
        onChange={(title) => set({ mission: { ...data.mission, title } })}
      />
      <TextField
        label="Mission text"
        value={data.mission.text}
        multiline
        onChange={(text) => set({ mission: { ...data.mission, text } })}
      />
      <TextField
        label="Vision heading"
        value={data.vision.title}
        onChange={(title) => set({ vision: { ...data.vision, title } })}
      />
      <TextField
        label="Vision text"
        value={data.vision.text}
        multiline
        onChange={(text) => set({ vision: { ...data.vision, text } })}
      />
    </>
  );
}

export function TopicListForm({ data, onChange, refs }: FormProps<'topicList'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <TextField
        label="Eyebrow (optional)"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <TextField label="Heading" value={data.title} onChange={(title) => set({ title })} />
      <TextField
        label="Lead (optional)"
        value={data.lead}
        multiline
        onChange={(lead) => set({ lead })}
      />
      <RefPicker
        label="Topics"
        allLabel="All topics"
        options={refs.topics}
        selected={data.topicSlugs}
        onChange={(topicSlugs) => set({ topicSlugs })}
      />
    </>
  );
}

export function ArticleGridForm({ data, onChange }: FormProps<'articleGrid'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <SelectField
        label="Mode"
        value={data.mode}
        options={['latest', 'all'] as const}
        onChange={(mode) => set({ mode })}
      />
      <TextField
        label="Eyebrow (optional)"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <TextField
        label="Heading (optional)"
        value={data.title}
        onChange={(title) => set({ title })}
      />
      <TextField
        label="Lead (optional)"
        value={data.lead}
        multiline
        onChange={(lead) => set({ lead })}
      />
      {data.mode === 'latest' ? (
        <NumberField
          label="How many"
          value={data.count}
          min={1}
          max={12}
          onChange={(count) => set({ count })}
        />
      ) : (
        <>
          <TextField
            label="Empty state heading"
            value={data.emptyTitle}
            onChange={(emptyTitle) => set({ emptyTitle })}
          />
          <TextField
            label="Empty state text"
            value={data.emptyText}
            multiline
            onChange={(emptyText) => set({ emptyText })}
          />
          <TextField
            label="Topic filter line"
            value={data.filterLabel}
            placeholder="e.g. Showing articles about {topic}."
            onChange={(filterLabel) => set({ filterLabel })}
          />
          <TextField
            label="Clear filter link"
            value={data.clearFilterLabel}
            placeholder="e.g. Show all articles"
            onChange={(clearFilterLabel) => set({ clearFilterLabel })}
          />
        </>
      )}
      <TextField
        label="Card link text"
        value={data.readMoreLabel}
        placeholder="e.g. Read article"
        onChange={(readMoreLabel) => set({ readMoreLabel })}
      />
    </>
  );
}

export function RichTextForm({ data, onChange }: FormProps<'richText'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <SelectField
        label="Layout"
        value={data.layout}
        options={['prose', 'checklist'] as const}
        onChange={(layout) => set({ layout })}
      />
      <TextField
        label="Heading (optional)"
        value={data.title}
        onChange={(title) => set({ title })}
      />
      <TextField
        label="Line under the heading (optional)"
        value={data.meta}
        placeholder="e.g. Last updated 1 June 2026"
        onChange={(meta) => set({ meta })}
      />
      <RichTextEditor value={data.doc} ariaLabel="Text" onChange={(doc) => set({ doc })} />
    </>
  );
}

export function ImageForm({ data, onChange }: FormProps<'image'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <MediaField
        label="Image"
        nullable={false}
        value={data.image}
        onChange={(image) => image && set({ image })}
      />
      <SelectField
        label="Shape"
        value={data.ratio}
        options={IMAGE_RATIOS}
        onChange={(ratio) => set({ ratio })}
      />
      <TextField
        label="Caption (optional)"
        value={data.caption}
        onChange={(caption) => set({ caption })}
      />
    </>
  );
}

export function CtaBandForm({ data, onChange }: FormProps<'ctaBand'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <TextField label="Heading" value={data.title} onChange={(title) => set({ title })} />
      <TextField
        label="Text (optional)"
        value={data.text}
        multiline
        onChange={(text) => set({ text })}
      />
      <LinkField
        label="Primary button"
        value={data.primary}
        onChange={(primary) => set({ primary })}
      />
      <OptionalLinkField
        label="Secondary button"
        value={data.secondary}
        onChange={(secondary) => set({ secondary })}
      />
    </>
  );
}

export function ContactBandForm({ data, onChange }: FormProps<'contactBand'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <TextField label="Heading" value={data.title} onChange={(title) => set({ title })} />
      <TextField
        label="Sub line (optional)"
        value={data.sub}
        multiline
        onChange={(sub) => set({ sub })}
      />
      <ListEditor
        label="Checklist (client-approved lines only)"
        itemLabel="Line"
        items={data.checklist}
        max={5}
        onChange={(checklist) => set({ checklist })}
        create={() => ''}
        render={(line, update) => <TextField label="Text" value={line} onChange={update} />}
      />
      <p>Form labels, enquiry types and messages are edited in Settings → Contact.</p>
    </>
  );
}

export { RefPicker };
