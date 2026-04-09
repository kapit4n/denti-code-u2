'use client';

import { useMemo } from 'react';
import AuthChecker from '@/components/AuthChecker';
import PortalSidebarLayout from '@/components/portal/PortalSidebarLayout';
import PatientPortalHeader from '@/app/patient/_components/PatientPortalHeader';
import { useTranslation } from '@/i18n/I18nContext';

export default function PatientPortalShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const navItems = useMemo(
    () => [
      { href: '/patient/dashboard', label: t('nav.home') },
      { href: '/patient/appointments', label: t('nav.visits') },
      { href: '/patient/profile', label: t('nav.yourDetails') },
    ],
    [t],
  );

  return (
    <AuthChecker>
      <PortalSidebarLayout
        storageKey="denti-sidebar-patient"
        navItems={navItems}
        header={<PatientPortalHeader />}
      >
        {children}
      </PortalSidebarLayout>
    </AuthChecker>
  );
}
