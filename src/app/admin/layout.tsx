import AuthChecker from '@/components/AuthChecker';
import PortalSidebarLayout from '@/components/portal/PortalSidebarLayout';
import AdminPortalHeader from '@/app/admin/_components/AdminPortalHeader';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/patients', label: 'Patients' },
  { href: '/admin/appointments', label: 'Appointments' },
  { href: '/admin/profile', label: 'Account' },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthChecker>
      <PortalSidebarLayout
        storageKey="denti-sidebar-admin"
        navItems={[...NAV_ITEMS]}
        header={<AdminPortalHeader />}
      >
        {children}
      </PortalSidebarLayout>
    </AuthChecker>
  );
}
