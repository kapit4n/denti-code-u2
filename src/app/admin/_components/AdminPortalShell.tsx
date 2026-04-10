'use client';

import { useMemo } from 'react';
import AuthChecker from '@/components/AuthChecker';
import AdminRoleChecker from '@/components/AdminRoleChecker';
import PortalSidebarLayout from '@/components/portal/PortalSidebarLayout';
import AdminPortalHeader from '@/app/admin/_components/AdminPortalHeader';
import { useTranslation } from '@/i18n/I18nContext';

export default function AdminPortalShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const navItems = useMemo(
    () => [
      { href: '/admin/dashboard', label: t('nav.dashboard') },
      { href: '/admin/patients', label: t('nav.patients') },
      { href: '/admin/doctors', label: t('nav.doctors') },
      { href: '/admin/appointments', label: t('nav.appointments') },
      { href: '/admin/settings', label: t('nav.settings') },
      { href: '/admin/profile', label: t('nav.account') },
    ],
    [t],
  );

  return (
    <AuthChecker>
      <AdminRoleChecker>
      <PortalSidebarLayout
        storageKey="denti-sidebar-admin"
        navItems={navItems}
        header={<AdminPortalHeader />}
      >
        {children}
      </PortalSidebarLayout>
      </AdminRoleChecker>
    </AuthChecker>
  );
}
