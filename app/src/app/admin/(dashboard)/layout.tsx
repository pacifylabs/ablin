import { AdminShell } from '@/admin/ui/AdminShell';

/**
 * Wraps every authenticated admin page (dashboard, pages, insights, submissions, settings) in the sidebar shell.
 * /admin/login and /admin/reset sit outside this group, so they render standalone. Middleware already redirects
 * an unauthenticated request away from every route in this group except those two (see src/middleware.ts) — this
 * layout does not re-check the session; it only supplies the chrome.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
