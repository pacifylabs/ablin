'use client';

import type {
  ContactSettings,
  CookieSettings,
  ErrorSettings,
  FooterSettings,
  NavigationSettings,
  SeoSettings,
  SiteSettings,
} from '@/cms/globals/schemas';
import { DEFAULT_THEMES } from '@/lib/theme';
import { CheckboxField, LinkField, ListEditor, type LinkValue } from '../fields/more';
import { SelectField, TextField } from '../fields/shared';
import styles from '../admin.module.css';

type Props<T> = { value: T; onChange: (v: T) => void };

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.panel}>
      <p className={styles.panelTitle}>{title}</p>
      {children}
    </div>
  );
}

function LinksEditor({
  label,
  links,
  onChange,
}: {
  label: string;
  links: LinkValue[];
  onChange: (l: LinkValue[]) => void;
}) {
  return (
    <ListEditor
      label={label}
      itemLabel="Link"
      items={links}
      onChange={onChange}
      create={() => ({ label: '', href: '/' })}
      render={(link, update) => <LinkField label="Link" value={link} onChange={update} />}
    />
  );
}

export function SiteForm({ value: v, onChange }: Props<SiteSettings>) {
  const set = (p: Partial<SiteSettings>) => onChange({ ...v, ...p });
  return (
    <>
      <Group title="Identity">
        <TextField
          label="Site name"
          value={v.siteName}
          onChange={(siteName) => set({ siteName })}
        />
        <TextField label="Tagline" value={v.tagline} onChange={(tagline) => set({ tagline })} />
      </Group>
      <Group title="Logo and icon">
        <TextField
          label="Logo for light backgrounds"
          value={v.logoLight}
          placeholder="/image/logo-wordmark-light.png"
          hint="A /image/… path or a Cloudinary URL from the Media library."
          onChange={(logoLight) => set({ logoLight })}
        />
        <TextField
          label="Logo for dark backgrounds"
          value={v.logoDark}
          placeholder="/image/logo-wordmark-dark.png"
          onChange={(logoDark) => set({ logoDark })}
        />
        <TextField
          label="Logo alt text"
          value={v.logoAlt}
          onChange={(logoAlt) => set({ logoAlt })}
        />
        <TextField
          label="Favicon"
          value={v.favicon}
          placeholder="/icon.png"
          onChange={(favicon) => set({ favicon })}
        />
      </Group>
      <Group title="Behaviour">
        <SelectField
          label="Default theme"
          value={v.defaultTheme}
          options={DEFAULT_THEMES}
          onChange={(defaultTheme) => set({ defaultTheme })}
        />
        <TextField
          label="Public site address"
          value={v.siteUrl}
          placeholder="https://ablinlimited.com"
          hint="Used for canonical links, sharing previews and the sitemap. Leave empty to use the hosting domain."
          onChange={(siteUrl) => set({ siteUrl })}
        />
        <TextField
          label="Locale"
          value={v.locale}
          placeholder="en-GB"
          onChange={(locale) => set({ locale })}
        />
      </Group>
    </>
  );
}

export function NavigationForm({ value: v, onChange }: Props<NavigationSettings>) {
  const set = (p: Partial<NavigationSettings>) => onChange({ ...v, ...p });
  const label = (key: keyof NavigationSettings['labels'], text: string) => (
    <TextField
      label={text}
      value={v.labels[key]}
      onChange={(t) => set({ labels: { ...v.labels, [key]: t } })}
    />
  );
  return (
    <>
      <Group title="Header links (the mobile menu mirrors these)">
        <LinksEditor label="Links" links={v.items} onChange={(items) => set({ items })} />
      </Group>
      <Group title="Header button">
        <LinkField label="Button" value={v.cta} onChange={(cta) => set({ cta })} />
      </Group>
      <Group title="Screen-reader labels">
        {label('skipLink', 'Skip link')}
        {label('primaryNav', 'Main navigation name')}
        {label('mobileNav', 'Mobile navigation name')}
        {label('breadcrumb', 'Breadcrumb name')}
        {label('home', 'Logo link (home)')}
        {label('openMenu', 'Open menu button')}
        {label('closeMenu', 'Close menu button')}
        {label('themeToggle', 'Theme button (before load)')}
        {label('themeToLight', 'Theme button (switch to light)')}
        {label('themeToDark', 'Theme button (switch to dark)')}
      </Group>
    </>
  );
}

export function FooterForm({ value: v, onChange }: Props<FooterSettings>) {
  const set = (p: Partial<FooterSettings>) => onChange({ ...v, ...p });
  return (
    <>
      <Group title="Brand column">
        <TextField
          label="Description"
          value={v.description}
          multiline
          onChange={(description) => set({ description })}
        />
      </Group>
      <Group title="Link columns">
        <ListEditor
          label="Columns"
          itemLabel="Column"
          items={v.columns}
          min={1}
          max={3}
          onChange={(columns) => set({ columns })}
          create={() => ({ title: '', source: 'manual' as const, links: [] })}
          render={(col, update) => (
            <>
              <TextField
                label="Heading"
                value={col.title}
                onChange={(title) => update({ ...col, title })}
              />
              <SelectField
                label="Links from"
                value={col.source}
                options={['manual', 'services'] as const}
                onChange={(source) => update({ ...col, source })}
              />
              {col.source === 'manual' ? (
                <LinksEditor
                  label="Links"
                  links={col.links}
                  onChange={(links) => update({ ...col, links })}
                />
              ) : (
                <p className={styles.hint}>
                  Lists every service from the Services collection, in order.
                </p>
              )}
            </>
          )}
        />
      </Group>
      <Group title="Legal column">
        <TextField
          label="Heading"
          value={v.legalTitle}
          onChange={(legalTitle) => set({ legalTitle })}
        />
        <LinksEditor
          label="Links"
          links={v.legalLinks}
          onChange={(legalLinks) => set({ legalLinks })}
        />
      </Group>
      <Group title="Frameworks strip">
        <CheckboxField
          label="Show the frameworks strip"
          checked={v.showFrameworks}
          onChange={(showFrameworks) => set({ showFrameworks })}
        />
        <TextField
          label="Heading"
          value={v.frameworksLabel}
          onChange={(frameworksLabel) => set({ frameworksLabel })}
        />
        <TextField
          label="Note (optional)"
          value={v.frameworksNote}
          onChange={(frameworksNote) => set({ frameworksNote })}
        />
        <TextField
          label="Screen-reader name"
          value={v.frameworksAriaLabel}
          onChange={(frameworksAriaLabel) => set({ frameworksAriaLabel })}
        />
      </Group>
      <Group title="Bottom row">
        <TextField
          label="Copyright"
          value={v.copyright}
          hint="{year} becomes the current year."
          onChange={(copyright) => set({ copyright })}
        />
        <TextField label="Region" value={v.region} onChange={(region) => set({ region })} />
      </Group>
    </>
  );
}

export function SeoForm({ value: v, onChange }: Props<SeoSettings>) {
  const set = (p: Partial<SeoSettings>) => onChange({ ...v, ...p });
  const org = v.organization;
  const setOrg = (p: Partial<SeoSettings['organization']>) =>
    set({ organization: { ...org, ...p } });
  return (
    <>
      <Group title="Defaults">
        <TextField
          label="Title template"
          value={v.titleTemplate}
          hint="%s is replaced with each page's title."
          onChange={(titleTemplate) => set({ titleTemplate })}
        />
        <TextField
          label="Default title"
          value={v.defaultTitle}
          onChange={(defaultTitle) => set({ defaultTitle })}
        />
        <TextField
          label="Default description"
          value={v.defaultDescription}
          multiline
          onChange={(defaultDescription) => set({ defaultDescription })}
        />
        <TextField
          label="Default share image"
          value={v.ogImage}
          placeholder="/image/og-default.png"
          onChange={(ogImage) => set({ ogImage })}
        />
        <TextField
          label="Share image alt text"
          value={v.ogImageAlt}
          onChange={(ogImageAlt) => set({ ogImageAlt })}
        />
        <TextField
          label="Google Search Console verification (optional)"
          value={v.searchConsoleVerification}
          onChange={(searchConsoleVerification) => set({ searchConsoleVerification })}
        />
      </Group>
      <Group title="Organisation (structured data)">
        <TextField label="Name" value={org.name} onChange={(name) => setOrg({ name })} />
        <TextField
          label="Legal name (optional)"
          value={org.legalName}
          onChange={(legalName) => setOrg({ legalName })}
        />
        <TextField
          label="Description (optional)"
          value={org.description}
          multiline
          onChange={(description) => setOrg({ description })}
        />
        <TextField label="Logo (optional)" value={org.logo} onChange={(logo) => setOrg({ logo })} />
        <TextField
          label="Email (optional)"
          value={org.email}
          onChange={(email) => setOrg({ email })}
        />
        <TextField
          label="Area served (optional)"
          value={org.areaServed}
          placeholder="GB"
          onChange={(areaServed) => setOrg({ areaServed })}
        />
        <ListEditor
          label="Profiles (sameAs)"
          itemLabel="Profile URL"
          items={org.sameAs}
          onChange={(sameAs) => setOrg({ sameAs })}
          create={() => 'https://'}
          render={(url, update) => (
            <TextField
              label="URL"
              value={url}
              placeholder="https://www.linkedin.com/company/…"
              onChange={update}
            />
          )}
        />
      </Group>
    </>
  );
}

export function ContactForm({ value: v, onChange }: Props<ContactSettings>) {
  const set = (p: Partial<ContactSettings>) => onChange({ ...v, ...p });
  const field = (key: keyof ContactSettings['fields'], title: string) => (
    <fieldset className={styles.repeatItem}>
      <legend className={styles.hint}>{title}</legend>
      <TextField
        label="Label"
        value={v.fields[key].label}
        onChange={(label) => set({ fields: { ...v.fields, [key]: { ...v.fields[key], label } } })}
      />
      <TextField
        label="Placeholder"
        value={v.fields[key].placeholder}
        onChange={(placeholder) =>
          set({ fields: { ...v.fields, [key]: { ...v.fields[key], placeholder } } })
        }
      />
    </fieldset>
  );
  const err = (key: keyof ContactSettings['errors'], title: string) => (
    <TextField
      label={title}
      value={v.errors[key]}
      onChange={(t) => set({ errors: { ...v.errors, [key]: t } })}
    />
  );
  return (
    <>
      <Group title="Enquiry types">
        <ListEditor
          label="Types"
          itemLabel="Type"
          items={v.enquiryTypes}
          min={1}
          onChange={(enquiryTypes) => set({ enquiryTypes })}
          create={() => ({ value: '', label: '' })}
          render={(t, update) => (
            <>
              <TextField
                label="Label"
                value={t.label}
                onChange={(label) => update({ ...t, label })}
              />
              <TextField
                label="Code"
                value={t.value}
                placeholder="e.g. soc2"
                hint="Lowercase letters, numbers and hyphens. Stored with each enquiry."
                onChange={(value) => update({ ...t, value })}
              />
            </>
          )}
        />
      </Group>
      <Group title="Delivery">
        <ListEditor
          label="Recipients (empty = the CONTACT_TO_EMAIL setting)"
          itemLabel="Email"
          items={v.recipients}
          onChange={(recipients) => set({ recipients })}
          create={() => ''}
          render={(email, update) => (
            <TextField
              label="Email"
              value={email}
              placeholder="enquiries@ablinlimited.com"
              onChange={update}
            />
          )}
        />
        <CheckboxField
          label="Send an automatic acknowledgement to the enquirer"
          checked={v.autoReply.enabled}
          onChange={(enabled) => set({ autoReply: { ...v.autoReply, enabled } })}
        />
        {v.autoReply.enabled ? (
          <>
            <TextField
              label="Acknowledgement subject"
              value={v.autoReply.subject}
              onChange={(subject) => set({ autoReply: { ...v.autoReply, subject } })}
            />
            <TextField
              label="Acknowledgement text"
              value={v.autoReply.body}
              multiline
              onChange={(body) => set({ autoReply: { ...v.autoReply, body } })}
            />
          </>
        ) : null}
      </Group>
      <Group title="Form fields">
        {field('fullName', 'Full name')}
        {field('email', 'Work email')}
        {field('organisation', 'Organisation')}
        {field('enquiryType', 'Enquiry type (placeholder is the empty option)')}
        {field('message', 'Message')}
        <TextField
          label="Required marker"
          value={v.requiredMark}
          onChange={(requiredMark) => set({ requiredMark })}
        />
        <TextField
          label="Optional marker"
          value={v.optionalMark}
          onChange={(optionalMark) => set({ optionalMark })}
        />
        <TextField
          label="Consent text"
          value={v.consentText}
          multiline
          onChange={(consentText) => set({ consentText })}
        />
        <TextField
          label="Consent link text (optional)"
          value={v.consentLinkLabel}
          onChange={(consentLinkLabel) => set({ consentLinkLabel })}
        />
        <TextField
          label="Consent link (optional)"
          value={v.consentLinkHref}
          placeholder="/privacy-policy"
          onChange={(consentLinkHref) => set({ consentLinkHref })}
        />
        <TextField
          label="Hidden anti-spam field label"
          value={v.honeypotLabel}
          onChange={(honeypotLabel) => set({ honeypotLabel })}
        />
      </Group>
      <Group title="Buttons and confirmation">
        <TextField
          label="Submit button"
          value={v.submitLabel}
          onChange={(submitLabel) => set({ submitLabel })}
        />
        <TextField
          label="Submit button while sending"
          value={v.sendingLabel}
          onChange={(sendingLabel) => set({ sendingLabel })}
        />
        <TextField
          label="Confirmation heading"
          value={v.successTitle}
          onChange={(successTitle) => set({ successTitle })}
        />
        <TextField
          label="Confirmation text"
          value={v.successMessage}
          hint="{email} becomes the visitor's address."
          multiline
          onChange={(successMessage) => set({ successMessage })}
        />
        <TextField
          label="Send another button"
          value={v.anotherLabel}
          onChange={(anotherLabel) => set({ anotherLabel })}
        />
      </Group>
      <Group title="Messages">
        {err('fullName', 'Name missing')}
        {err('email', 'Email invalid')}
        {err('enquiryType', 'Enquiry type missing')}
        {err('message', 'Message too short')}
        {err('consent', 'Consent not ticked')}
        {err('tooLong', 'Text too long')}
        {err('summary', 'Summary above the form')}
        {err('rateLimited', 'Too many messages')}
        {err('unavailable', 'Sending not available')}
        {err('generic', 'Sending failed')}
      </Group>
    </>
  );
}

export function CookiesForm({ value: v, onChange }: Props<CookieSettings>) {
  const set = (p: Partial<CookieSettings>) => onChange({ ...v, ...p });
  const t = (key: keyof CookieSettings, label: string, multiline = false) => (
    <TextField
      label={label}
      value={v[key] as string}
      multiline={multiline}
      onChange={(x) => set({ [key]: x } as Partial<CookieSettings>)}
    />
  );
  return (
    <>
      <Group title="Analytics">
        <TextField
          label="GA4 measurement ID (optional)"
          value={v.ga4Id}
          placeholder="G-XXXXXXX"
          hint="Leave empty to use the NEXT_PUBLIC_GA_MEASUREMENT_ID setting. Analytics load only after a visitor accepts."
          onChange={(ga4Id) => set({ ga4Id })}
        />
      </Group>
      <Group title="Banner">
        {t('title', 'Heading')}
        {t('body', 'Text', true)}
        <LinkField
          label="Policy link"
          value={v.policyLink}
          onChange={(policyLink) => set({ policyLink })}
        />
        {t('acceptLabel', 'Accept button')}
        {t('rejectLabel', 'Reject button')}
        {t('preferencesLabel', 'Preferences button')}
      </Group>
      <Group title="Preferences">
        {t('preferencesTitle', 'Heading')}
        {t('necessaryTitle', 'Essential cookies title')}
        {t('necessaryText', 'Essential cookies text', true)}
        {t('analyticsTitle', 'Analytics title')}
        {t('analyticsText', 'Analytics text', true)}
        {t('saveLabel', 'Save button')}
      </Group>
    </>
  );
}

export function ErrorsForm({ value: v, onChange }: Props<ErrorSettings>) {
  const nf = v.notFound;
  const se = v.serverError;
  return (
    <>
      <Group title="Page not found (404)">
        <TextField
          label="Heading"
          value={nf.title}
          onChange={(title) => onChange({ ...v, notFound: { ...nf, title } })}
        />
        <TextField
          label="Text"
          value={nf.text}
          multiline
          onChange={(text) => onChange({ ...v, notFound: { ...nf, text } })}
        />
        <TextField
          label="Links heading"
          value={nf.linksTitle}
          onChange={(linksTitle) => onChange({ ...v, notFound: { ...nf, linksTitle } })}
        />
        <LinksEditor
          label="Links"
          links={nf.links}
          onChange={(links) => onChange({ ...v, notFound: { ...nf, links } })}
        />
        <LinkField
          label="Button"
          value={nf.cta}
          onChange={(cta) => onChange({ ...v, notFound: { ...nf, cta } })}
        />
      </Group>
      <Group title="Something went wrong (500)">
        <TextField
          label="Heading"
          value={se.title}
          onChange={(title) => onChange({ ...v, serverError: { ...se, title } })}
        />
        <TextField
          label="Text"
          value={se.text}
          multiline
          onChange={(text) => onChange({ ...v, serverError: { ...se, text } })}
        />
        <TextField
          label="Retry button"
          value={se.retryLabel}
          onChange={(retryLabel) => onChange({ ...v, serverError: { ...se, retryLabel } })}
        />
        <LinkField
          label="Button"
          value={se.cta}
          onChange={(cta) => onChange({ ...v, serverError: { ...se, cta } })}
        />
      </Group>
    </>
  );
}
