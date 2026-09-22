'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { EnquiryType } from '@/content/schema';
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

export function ContactForm({ enquiryTypes }: { enquiryTypes: readonly EnquiryType[] }) {
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
    const parsed = buildContactSchema(enquiryTypes.map((t) => t.value)).safeParse(payload);
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
          Message sent
        </h2>
        <p className="lead">
          Thank you. A consultant will read your message and reply to {values.email.trim()}.
        </p>
        <button
          type="button"
          className="btn btn-ghost"
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
        {hasErrors ? 'Check the fields marked below and try again.' : null}
        {status === 'failed' ? 'We could not send your message. Try again in a few minutes.' : null}
        {status === 'limited'
          ? 'Too many messages were sent from your connection. Wait a few minutes and try again.'
          : null}
      </div>

      <div className={styles.row}>
        <Field id="fullName" label="Full name" required error={errors.fullName}>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="e.g. Jane Doe"
            value={values.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            aria-required="true"
          />
        </Field>
        <Field id="email" label="Work email" required error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-required="true"
          />
        </Field>
      </div>

      <div className={styles.row}>
        <Field id="organisation" label="Organisation" error={errors.organisation}>
          <input
            id="organisation"
            name="organisation"
            type="text"
            autoComplete="organization"
            placeholder="e.g. Acme Ltd"
            value={values.organisation}
            onChange={(e) => update('organisation', e.target.value)}
            aria-invalid={Boolean(errors.organisation)}
            aria-describedby={errors.organisation ? 'organisation-error' : undefined}
          />
        </Field>
        <Field id="enquiryType" label="Enquiry type" required error={errors.enquiryType}>
          <select
            id="enquiryType"
            name="enquiryType"
            value={values.enquiryType}
            onChange={(e) => update('enquiryType', e.target.value)}
            aria-invalid={Boolean(errors.enquiryType)}
            aria-describedby={errors.enquiryType ? 'enquiryType-error' : undefined}
            aria-required="true"
          >
            <option value="">Select an enquiry type</option>
            {enquiryTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="message" label="Message" required error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Tell us about your organisation and what you need."
          value={values.message}
          onChange={(e) => update('message', e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'message-error' : undefined}
          aria-required="true"
        />
      </Field>

      {/* Honeypot: invisible and unreachable for people; bots fill it in. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
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
            I agree to Ablin Limited processing this enquiry in line with the{' '}
            <Link href="/privacy-policy">Privacy Policy</Link>.
          </span>
        </label>
        {errors.consent ? (
          <p id="consent-error" className={styles.error}>
            {errors.consent}
          </p>
        ) : null}
      </div>

      <div>
        <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending message' : 'Send message'}
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string | undefined;
  children: React.ReactNode;
}

function Field({ id, label, required, error, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {label}
        {required ? (
          <span className={styles.required}> (required)</span>
        ) : (
          <span className={styles.optional}> (optional)</span>
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
