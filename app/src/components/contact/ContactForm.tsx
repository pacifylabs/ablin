'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { ContactFormCopy } from '@/cms/globals/schemas';
// Types only: the validation library (zod) is loaded on first submit, so it never weighs on the page's first load.
import type { ContactField, FieldErrors } from '@/lib/contact';
import styles from './ContactForm.module.css';

interface Values {
  fullName: string;
  email: string;
  organisation: string;
  enquiryType: string;
  message: string;
  consent: boolean;
  website: string;
}

const empty: Values = {
  fullName: '',
  email: '',
  organisation: '',
  enquiryType: '',
  message: '',
  consent: false,
  website: '',
};

type Status = 'idle' | 'sending' | 'sent' | 'failed' | 'limited';

// Field order drives which invalid field receives focus first.
const order: ContactField[] = [
  'fullName',
  'email',
  'organisation',
  'enquiryType',
  'message',
  'consent',
];

export function ContactForm({ copy }: { copy: ContactFormCopy }) {
  const { enquiryTypes, fields } = copy;
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const sentHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === 'sent') sentHeading.current?.focus();
  }, [status]);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;

    const payload = { ...values, startedAt: startedAt.current || Date.now() };
    const { buildContactSchema, toFieldErrors } = await import('@/lib/contact');
    const parsed = buildContactSchema(
      enquiryTypes.map((t) => t.value),
      copy.errors,
    ).safeParse(payload);
    if (!parsed.success) {
      const found = toFieldErrors(parsed.error);
      setErrors(found);
      const first = order.find((field) => found[field]);
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setErrors({});
    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setStatus('sent');
        return;
      }
      if (response.status === 422) {
        const body = (await response.json()) as { fieldErrors?: FieldErrors };
        setErrors(body.fieldErrors ?? {});
        setStatus('idle');
        return;
      }
      setStatus(response.status === 429 ? 'limited' : 'failed');
    } catch {
      setStatus('failed');
    }
  }

  if (status === 'sent') {
    return (
      <div className={styles.sent} role="status">
        <h2 ref={sentHeading} tabIndex={-1}>
          {copy.successTitle}
        </h2>
        <p className="lead">{copy.successMessage.replaceAll('{email}', values.email.trim())}</p>
        <button
          type="button"
          className="btn btn-ghost-white"
          onClick={() => {
            setValues(empty);
            startedAt.current = Date.now();
            setStatus('idle');
          }}
        >
          Send another message
        </button>
      </div>
    );
  }

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className={styles.form}
      aria-describedby="form-summary"
    >
      <div
        id="form-summary"
        role="alert"
        className={styles.summary}
        hidden={!hasErrors && status !== 'failed' && status !== 'limited'}
      >
        {hasErrors ? copy.errors.summary : null}
        {status === 'failed' ? copy.errors.generic : null}
        {status === 'limited' ? copy.errors.rateLimited : null}
      </div>

      <div className={styles.row}>
        <Field
          id="fullName"
          label={fields.fullName.label}
          marks={copy}
          required
          error={errors.fullName}
        >
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder={fields.fullName.placeholder}
            value={values.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            aria-required="true"
          />
        </Field>
        <Field id="email" label={fields.email.label} marks={copy} required error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={fields.email.placeholder}
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-required="true"
          />
        </Field>
      </div>

      <div className={styles.row}>
        <Field
          id="organisation"
          label={fields.organisation.label}
          marks={copy}
          error={errors.organisation}
        >
          <input
            id="organisation"
            name="organisation"
            type="text"
            autoComplete="organization"
            placeholder={fields.organisation.placeholder}
            value={values.organisation}
            onChange={(e) => update('organisation', e.target.value)}
            aria-invalid={Boolean(errors.organisation)}
            aria-describedby={errors.organisation ? 'organisation-error' : undefined}
          />
        </Field>
        <Field
          id="enquiryType"
          label={fields.enquiryType.label}
          marks={copy}
          required
          error={errors.enquiryType}
        >
          <select
            id="enquiryType"
            name="enquiryType"
            value={values.enquiryType}
            onChange={(e) => update('enquiryType', e.target.value)}
            aria-invalid={Boolean(errors.enquiryType)}
            aria-describedby={errors.enquiryType ? 'enquiryType-error' : undefined}
            aria-required="true"
          >
            <option value="">{fields.enquiryType.placeholder}</option>
            {enquiryTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        id="message"
        label={fields.message.label}
        marks={copy}
        required
        full
        error={errors.message}
      >
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder={fields.message.placeholder}
          value={values.message}
          onChange={(e) => update('message', e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'message-error' : undefined}
          aria-required="true"
        />
      </Field>

      {/* Honeypot: invisible and unreachable for people; bots fill it in. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="website">{copy.honeypotLabel}</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => update('website', e.target.value)}
        />
      </div>

      <div className={styles.consent}>
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            name="consent"
            checked={values.consent}
            onChange={(e) => update('consent', e.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            aria-required="true"
          />
          <span>
            {copy.consentText}
            {copy.consentLinkLabel && copy.consentLinkHref ? (
              <>
                {' '}
                <Link href={copy.consentLinkHref}>{copy.consentLinkLabel}</Link>
              </>
            ) : null}
          </span>
        </label>
        {errors.consent ? (
          <p id="consent-error" className={styles.error}>
            {errors.consent}
          </p>
        ) : null}
      </div>

      <div className={styles.actions}>
        <button type="submit" className="btn btn-white" disabled={status === 'sending'}>
          {status === 'sending' ? copy.sendingLabel : copy.submitLabel}
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  marks: { requiredMark: string; optionalMark: string };
  required?: boolean;
  /** Span both columns (the message field). */
  full?: boolean;
  error?: string | undefined;
  children: React.ReactNode;
}

function Field({ id, label, marks, required, full, error, children }: FieldProps) {
  return (
    <div className={`${styles.field}${full ? ` ${styles.full}` : ''}`}>
      <label htmlFor={id}>
        {label}
        {required ? (
          <span className={styles.required}> {marks.requiredMark}</span>
        ) : (
          <span className={styles.optional}> {marks.optionalMark}</span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
