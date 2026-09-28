export interface AdminNavItem {
  readonly label: string;
  readonly href: string;
}

export const adminNav: readonly AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Pages', href: '/admin/pages' },
  { label: 'Services', href: '/admin/services' },
  { label: 'Insights', href: '/admin/insights' },
  { label: 'Media', href: '/admin/media' },
  { label: 'Frameworks', href: '/admin/frameworks' },
  { label: 'Topics', href: '/admin/topics' },
  { label: 'Submissions', href: '/admin/submissions' },
  { label: 'Settings', href: '/admin/settings' },
];
