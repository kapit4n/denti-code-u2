'use client';

import { useMemo } from 'react';
import AuthChecker from '@/components/AuthChecker';
import PortalSidebarLayout from '@/components/portal/PortalSidebarLayout';
import DoctorPortalHeader from '@/app/doctor/_components/DoctorPortalHeader';
import { useTranslation } from '@/i18n/I18nContext';

export default function DoctorPortalShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const navItems = useMemo(
    () => [
      { href: '/doctor/dashboard', label: t('nav.home') },
      { href: '/doctor/appointments', label: t('nav.visits') },
      { href: '/doctor/calendar', label: t('nav.calendar') },
      { href: '/doctor/patients', label: t('nav.patients') },
      { href: '/doctor/profile', label: t('nav.account') },
    ],
    [t],
  );

  return (
    <AuthChecker>
      <PortalSidebarLayout
        storageKey="denti-sidebar-doctor"
        navItems={navItems}
        header={<DoctorPortalHeader />}
      >
        {children}
      </PortalSidebarLayout>
    </AuthChecker>
  );
}
