import { draftMode } from 'next/headers';
import styles from './admin.module.css';

/**
 * Shown on the public site only while an admin has preview (draft mode) on, so unpublished edits are never mistaken
 * for the live page. Admin UI, not site copy — which is why it lives here and not in components/public.
 */
export async function PreviewBanner() {
  if (!(await draftMode()).isEnabled) return null;
  return (
    <div className={styles.previewBanner} role="status">
      You are previewing unpublished changes.{' '}
      <a href="/api/admin/preview?path=/&exit=1">Exit preview</a>
    </div>
  );
}
