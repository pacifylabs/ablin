export interface AdminNavItem {
  readonly label: string;
  readonly href: string;
}

export const adminNav: readonly AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Pages', href: '/admin/pages' },
  { label: 'Insights', href: '/admin/insights' },
  { label: 'Frameworks', href: '/admin/frameworks' },
  { label: 'Submissions', href: '/admin/submissions' },
  { label: 'Settings', href: '/admin/settings' },
];
