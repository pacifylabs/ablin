'use client';

import { useState } from 'react';
import type { GlobalName, GlobalValue } from '@/cms/globals';
import { SaveBar, useSave } from '../save';
import {
  ContactForm,
  CookiesForm,
  ErrorsForm,
  FooterForm,
  NavigationForm,
  SeoForm,
  SiteForm,
} from './forms';
import styles from '../admin.module.css';

type FormFor<N extends GlobalName> = (props: {
  value: GlobalValue<N>;
  onChange: (v: GlobalValue<N>) => void;
}) => React.ReactNode;

const FORMS = {
  site: SiteForm,
  navigation: NavigationForm,
  footer: FooterForm,
  seo: SeoForm,
  contact: ContactForm,
  cookies: CookiesForm,
  errors: ErrorsForm,
} satisfies { [N in GlobalName]: FormFor<N> };

/** Edits one `settings:*` global and saves it whole (PUT /api/admin/settings/{name}). */
export function GlobalEditor({
  name,
  initial,
  invalid,
}: {
  name: GlobalName;
  initial: unknown;
  invalid?: string;
}) {
  const [value, setValue] = useState(initial);
  const { status, error, send } = useSave();
  const Form = FORMS[name] as (props: {
    value: unknown;
    onChange: (v: unknown) => void;
  }) => React.ReactNode;
  return (
    <div>
      {invalid ? (
        <p className={styles.formNote} data-tone="warning">
          The stored value no longer matched the expected shape, so the defaults are shown. Saving
          replaces it.
        </p>
      ) : null}
      <Form value={value} onChange={setValue} />
      <SaveBar
        status={status}
        error={error}
        onSave={() => void send(`/api/admin/settings/${name}`, 'PUT', value)}
      />
    </div>
  );
}
