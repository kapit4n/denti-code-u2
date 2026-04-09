import AuthChecker from '@/components/AuthChecker';
import PortalSidebarLayout from '@/components/portal/PortalSidebarLayout';
import PatientPortalHeader from '@/app/patient/_components/PatientPortalHeader';

const NAV_ITEMS = [
  { href: '/patient/dashboard', label: 'Home' },
  { href: '/patient/appointments', label: 'Visits' },
  { href: '/patient/profile', label: 'Your details' },
] as const;

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthChecker>
      <PortalSidebarLayout
        storageKey="denti-sidebar-patient"
        navItems={[...NAV_ITEMS]}
        header={<PatientPortalHeader />}
      >
        {children}
      </PortalSidebarLayout>
    </AuthChecker>
  );
}
