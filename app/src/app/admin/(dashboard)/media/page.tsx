import type { Metadata } from 'next';
import { listMedia } from '@/cms/collections/media';
import { MediaLibrary } from '@/admin/ui/MediaLibrary';
import styles from '@/admin/ui/admin.module.css';

export const metadata: Metadata = { title: 'Media' };

export default async function MediaPage() {
  const media = await listMedia();
  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1>Media</h1>
          <p className={styles.pageLead}>
            Every image used on the site. Architectural photography only (see the design system);
            record where each photo came from in its credit.
          </p>
        </div>
      </header>
      <MediaLibrary initial={media} />
    </div>
  );
}
