import { Logo } from '@/components/ui/Logo';
import { getAdminUser } from '@/cms/store';
import styles from './admin.module.css';
import { AdminNav } from './AdminNav';
import { LogoutButton } from './LogoutButton';

/** The nav + sidebar every authenticated /admin page (other than /admin/login and /admin/reset) renders inside. */
export async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Logo className={styles.brandLogo} />
          <span className={styles.brandLabel}>Admin</span>
        </div>
        <AdminNav />
        <div className={styles.sidebarFoot}>
          {user ? <p className={styles.sidebarUser}>{user.email}</p> : null}
          <LogoutButton />
        </div>
      </aside>
      <div className={styles.main}>{children}</div>
    </div>
  );
}
