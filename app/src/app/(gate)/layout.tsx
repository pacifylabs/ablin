// The gate page reads settings:availability itself (see status/page.tsx) and must see a change the moment an
// admin makes it, not after the next deploy.
export const dynamic = 'force-dynamic';

export default function GateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
