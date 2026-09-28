'use client';

import { ICON_NAMES } from '@/cms/collections/icons';
import { MediaField } from '../MediaField';
import { CheckboxField, LinkField, ListEditor, OptionalLinkField, RefPicker } from '../fields/more';
import { SelectField, TextField } from '../fields/shared';
import type { FormProps } from './types';

export function PageHeaderForm({ data, onChange }: FormProps<'pageHeader'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <TextField
        label="Eyebrow (optional)"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <TextField label="Heading (H1)" value={data.title} onChange={(title) => set({ title })} />
      <TextField
        label="Lead (optional)"
        value={data.lead}
        multiline
        onChange={(lead) => set({ lead })}
      />
      <MediaField
        label="Banner photo (optional — none gives a plain header)"
        value={data.image}
        onChange={(image) => set({ image })}
      />
      <CheckboxField
        label="Show breadcrumb"
        checked={data.breadcrumb}
        onChange={(breadcrumb) => set({ breadcrumb })}
      />
      <OptionalLinkField label="Button" value={data.cta} onChange={(cta) => set({ cta })} />
    </>
  );
}

export function HeroFramedForm({ data, onChange }: FormProps<'heroFramed'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => set({ eyebrow })} />
      <TextField
        label="Heading (H1)"
        value={data.title}
        hint="Keep it under about 15 words per line."
        onChange={(title) => set({ title })}
      />
      <TextField label="Lead" value={data.lead} multiline onChange={(lead) => set({ lead })} />
      <MediaField
        label="Background photo"
        value={data.image}
        onChange={(image) => set({ image })}
      />
      <TextField
        label="Location tag (optional)"
        value={data.locationTag}
        placeholder="e.g. UNITED KINGDOM"
        onChange={(locationTag) => set({ locationTag })}
      />
      <LinkField
        label="Primary button (white, with arrow)"
        value={data.primaryCta}
        onChange={(primaryCta) => set({ primaryCta })}
      />
      <OptionalLinkField
        label="Secondary button"
        value={data.secondaryCta}
        onChange={(secondaryCta) => set({ secondaryCta })}
      />
      <CheckboxField
        label="Show the animated lattice"
        checked={data.lattice}
        onChange={(lattice) => set({ lattice })}
      />
    </>
  );
}

export function CapabilityPanelsForm({ data, onChange }: FormProps<'capabilityPanels'>) {
  return (
    <ListEditor
      label="Panels"
      itemLabel="Panel"
      items={data.panels}
      min={1}
      max={3}
      onChange={(panels) => onChange({ ...data, panels })}
      create={() => ({
        icon: 'square-check' as const,
        title: '',
        text: '',
        link: { label: '', href: '/services' },
      })}
      render={(panel, update) => (
        <>
          <SelectField
            label="Icon"
            value={panel.icon}
            options={ICON_NAMES}
            onChange={(icon) => update({ ...panel, icon })}
          />
          <TextField
            label="Title"
            value={panel.title}
            onChange={(title) => update({ ...panel, title })}
          />
          <TextField
            label="Text"
            value={panel.text}
            multiline
            onChange={(text) => update({ ...panel, text })}
          />
          <LinkField
            label="Link"
            labelPlaceholder="e.g. View service"
            value={panel.link}
            onChange={(link) => update({ ...panel, link })}
          />
        </>
      )}
    />
  );
}

export function AboutIntroForm({ data, onChange }: FormProps<'aboutIntro'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <TextField
        label="Eyebrow (optional)"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <TextField label="Heading" value={data.title} onChange={(title) => set({ title })} />
      <ListEditor
        label="Paragraphs"
        itemLabel="Paragraph"
        items={data.paragraphs}
        min={1}
        max={3}
        onChange={(paragraphs) => set({ paragraphs })}
        create={() => ''}
        render={(p, update) => <TextField label="Text" value={p} multiline onChange={update} />}
      />
      <MediaField
        label="Photo beside the text (optional — hidden when a fact strip follows)"
        value={data.image}
        onChange={(image) => set({ image })}
      />
    </>
  );
}

export function FactStripForm({ data, onChange }: FormProps<'factStrip'>) {
  return (
    <>
      <CheckboxField
        label="Approved by the client"
        hint="facts stay hidden on the site until this is ticked"
        checked={data.approvedByClient}
        onChange={(approvedByClient) => onChange({ ...data, approvedByClient })}
      />
      <ListEditor
        label="Facts"
        itemLabel="Fact"
        items={data.facts}
        min={1}
        max={4}
        onChange={(facts) => onChange({ ...data, facts })}
        create={() => ({ value: '', label: '' })}
        render={(fact, update) => (
          <>
            <TextField
              label="Number"
              value={fact.value}
              placeholder="e.g. 8"
              onChange={(value) => update({ ...fact, value })}
            />
            <TextField
              label="Label"
              value={fact.label}
              placeholder="e.g. Advisory and readiness services"
              onChange={(label) => update({ ...fact, label })}
            />
          </>
        )}
      />
    </>
  );
}

export function FrameworkStripForm({ data, onChange, refs }: FormProps<'frameworkStrip'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <SelectField
        label="Layout"
        value={data.variant}
        options={['strip', 'index'] as const}
        onChange={(variant) => set({ variant })}
      />
      <TextField
        label="Eyebrow (optional)"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <TextField
        label="Heading (optional for the strip)"
        value={data.title}
        onChange={(title) => set({ title })}
      />
      <RefPicker
        label="Frameworks"
        allLabel="All frameworks, in collection order"
        options={refs.frameworks}
        selected={data.frameworkIds}
        onChange={(frameworkIds) => set({ frameworkIds })}
      />
      <TextField
        label="Caption (optional)"
        value={data.caption}
        multiline
        placeholder="e.g. Advisory and readiness support only…"
        onChange={(caption) => set({ caption })}
      />
      {data.variant === 'index' ? (
        <TextField
          label="Screen-reader note for source links"
          value={data.newTabLabel}
          placeholder="e.g. (opens in a new tab)"
          onChange={(newTabLabel) => set({ newTabLabel })}
        />
      ) : null}
    </>
  );
}

export function ServiceCarouselForm({ data, onChange, refs }: FormProps<'serviceCarousel'>) {
  const set = (patch: Partial<typeof data>) => onChange({ ...data, ...patch });
  return (
    <>
      <SelectField
        label="Layout"
        value={data.variant}
        options={['carousel', 'grid'] as const}
        onChange={(variant) => set({ variant })}
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
      <RefPicker
        label="Services"
        allLabel="All services, in collection order"
        options={refs.services}
        selected={data.serviceSlugs}
        onChange={(serviceSlugs) => set({ serviceSlugs })}
      />
      <TextField
        label="Card link text"
        value={data.cardLinkLabel}
        placeholder="e.g. View service"
        onChange={(cardLinkLabel) => set({ cardLinkLabel })}
      />
      <TextField
        label="Previous button (screen readers)"
        value={data.prevLabel}
        placeholder="e.g. Previous services"
        onChange={(prevLabel) => set({ prevLabel })}
      />
      <TextField
        label="Next button (screen readers)"
        value={data.nextLabel}
        placeholder="e.g. Next services"
        onChange={(nextLabel) => set({ nextLabel })}
      />
      <TextField
        label="List name (screen readers)"
        value={data.trackLabel}
        placeholder="e.g. Services"
        onChange={(trackLabel) => set({ trackLabel })}
      />
    </>
  );
}

export { ICON_NAMES };
