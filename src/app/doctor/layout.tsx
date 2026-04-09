import AuthChecker from '@/components/AuthChecker';
import PortalSidebarLayout from '@/components/portal/PortalSidebarLayout';
import DoctorPortalHeader from '@/app/doctor/_components/DoctorPortalHeader';

const NAV_ITEMS = [
  { href: '/doctor/dashboard', label: 'Home' },
  { href: '/doctor/appointments', label: 'Visits' },
  { href: '/doctor/calendar', label: 'Calendar' },
  { href: '/doctor/patients', label: 'Patients' },
  { href: '/doctor/profile', label: 'Account' },
] as const;

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthChecker>
      <PortalSidebarLayout
        storageKey="denti-sidebar-doctor"
        navItems={[...NAV_ITEMS]}
        header={<DoctorPortalHeader />}
      >
        {children}
      </PortalSidebarLayout>
    </AuthChecker>
  );
}
