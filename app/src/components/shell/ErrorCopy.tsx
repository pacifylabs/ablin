'use client';

import Link from 'next/link';
import { createContext, useContext } from 'react';
import type { ErrorSettings } from '@/cms/globals/schemas';
import styles from './errors.module.css';

type ServerErrorCopy = ErrorSettings['serverError'];

/**
 * Error boundaries are client components and cannot fetch, so the root layout reads `settings:errors.serverError`
 * and provides it here. The context is only null if the root layout itself failed, and then the boundary renders
 * the retry control alone, never invented copy.
 */
const ErrorCopyContext = createContext<ServerErrorCopy | null>(null);

export function ErrorCopyProvider({
  copy,
  children,
}: {
  copy: ServerErrorCopy;
  children: React.ReactNode;
}) {
  return <ErrorCopyContext.Provider value={copy}>{children}</ErrorCopyContext.Provider>;
}

export function ServerErrorContent({ reset }: { reset: () => void }) {
  const copy = useContext(ErrorCopyContext);
  return (
    <section className="section">
      <div className={`wrap container-narrow ${styles.stack}`}>
        {copy ? <h1>{copy.title}</h1> : null}
        {copy ? <p className="lead">{copy.text}</p> : null}
        <div className={styles.actions}>
          <button type="button" className="btn btn-primary" onClick={reset}>
            {copy?.retryLabel ?? '↻'}
          </button>
          {copy ? (
            <Link href={copy.cta.href} className="btn btn-line">
              {copy.cta.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
