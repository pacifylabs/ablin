import type { Metadata } from 'next';
import { SEED_SERVICES, listServicesRaw } from '@/cms/collections/services';
import { ServicesList } from '@/admin/ui/ServicesAdmin';
import styles from '@/admin/ui/admin.module.css';

export const metadata: Metadata = { title: 'Services' };

export default async function ServicesAdminPage() {
  const stored = await listServicesRaw();
  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1>Services</h1>
          <p className={styles.pageLead}>
            The service cards (carousel, footer, related services) and each service page. Drag to
            change the order.
          </p>
        </div>
      </header>
      {stored.length === 0 ? (
        <p className={styles.formNote} data-tone="warning">
          The services have not been saved to the database yet (run the seed). The site is showing
          the bundled services below.
        </p>
      ) : null}
      <ServicesList initial={stored.length ? stored : [...SEED_SERVICES]} />
    </div>
  );
}
