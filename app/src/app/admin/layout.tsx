import type { Metadata } from 'next';

// The whole /admin section is kept out of search indexes; it also carries no useful description for one.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Every admin page shows live, session-specific data (or, for login/reset, must always re-check whether a
// session already exists) — never statically cached, and the build must not depend on Redis being reachable.
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
