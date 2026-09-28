'use client';

import { ServerErrorContent } from '@/components/shell/ErrorCopy';

/** Copy comes from `settings:errors.serverError` via the root layout's ErrorCopyProvider. */
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <ServerErrorContent reset={reset} />;
}
