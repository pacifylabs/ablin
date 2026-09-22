'use client';

/**
 * Last-resort fallback for an error above (or outside) every route group's own boundary — e.g. one thrown by
 * the root layout itself. `(site)/error.tsx` (identical content, wrapped by the public chrome) is what actually
 * catches an error thrown by a page today; this file exists only so that rarer case doesn't fall through to
 * Next's unstyled default. Deliberately minimal — no SiteChrome import — so this boundary can't itself fail.
 */
export default function GlobalErrorFallback({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="section">
      <div
        className="container container-narrow"
        style={{ display: 'grid', gap: 'var(--space-6)' }}
      >
        <h1>Something went wrong</h1>
        <p className="lead">
          The page could not be loaded. Try again, or contact us if the problem continues.
        </p>
        <div>
          <button type="button" className="btn btn-primary" onClick={reset}>
            Try again
          </button>
        </div>
      </div>
    </section>
  );
}
