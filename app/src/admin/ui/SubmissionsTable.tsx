'use client';

import { Fragment, useState } from 'react';
import type { Submission, SubmissionStatus } from '@/cms/schema';
import styles from './admin.module.css';

export function SubmissionsTable({ initial }: { initial: readonly Submission[] }) {
  const [submissions, setSubmissions] = useState<Submission[]>([...initial]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  async function setStatus(id: string, status: SubmissionStatus) {
    setPending(id);
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        const updated = (await response.json()) as Submission;
        setSubmissions((current) => current.map((s) => (s.id === id ? updated : s)));
      }
    } finally {
      setPending(null);
    }
  }

  if (submissions.length === 0) return <p className="muted">No enquiries yet.</p>;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>From</th>
          <th>Enquiry</th>
          <th>Received</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map((s) => (
          <Fragment key={s.id}>
            <tr>
              <td>
                <button
                  type="button"
                  className={styles.iconBtn}
                  style={{ width: 'auto', padding: '0 0.5rem' }}
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                  aria-expanded={expanded === s.id}
                >
                  {s.fullName} — {s.email}
                </button>
              </td>
              <td>{s.enquiryType}</td>
              <td>{new Date(s.createdAt).toLocaleString('en-GB')}</td>
              <td>
                <span className={styles.badge} data-tone={s.status}>
                  {s.status}
                </span>
              </td>
              <td>
                <div className={styles.formActions}>
                  {s.status !== 'read' ? (
                    <button
                      type="button"
                      className={styles.iconBtn}
                      style={{ width: 'auto', padding: '0 0.5rem' }}
                      disabled={pending === s.id}
                      onClick={() => setStatus(s.id, 'read')}
                    >
                      Mark read
                    </button>
                  ) : null}
                  {s.status !== 'archived' ? (
                    <button
                      type="button"
                      className={styles.iconBtn}
                      style={{ width: 'auto', padding: '0 0.5rem' }}
                      disabled={pending === s.id}
                      onClick={() => setStatus(s.id, 'archived')}
                    >
                      Archive
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.iconBtn}
                      style={{ width: 'auto', padding: '0 0.5rem' }}
                      disabled={pending === s.id}
                      onClick={() => setStatus(s.id, 'read')}
                    >
                      Unarchive
                    </button>
                  )}
                </div>
              </td>
            </tr>
            {expanded === s.id ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.panel} style={{ margin: 0 }}>
                    <p>
                      <strong>Organisation:</strong> {s.organisation || 'Not given'}
                    </p>
                    <p>
                      <strong>Source page:</strong> {s.sourcePath}
                    </p>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{s.message}</p>
                  </div>
                </td>
              </tr>
            ) : null}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}
