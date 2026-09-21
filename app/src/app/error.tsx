'use client';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
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
