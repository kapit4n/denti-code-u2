'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectAuthHydrated, selectCurrentUser } from '@/features/auth/authSlice';
import { useTranslation } from '@/i18n/I18nContext';

export default function AdminRoleChecker({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const hydrated = useAppSelector(selectAuthHydrated);
  const user = useAppSelector(selectCurrentUser);
  const router = useRouter();
  const isAdmin = user?.roles?.includes('ADMIN') ?? false;

  useEffect(() => {
    if (!hydrated || !user) return;
    if (!isAdmin) {
      router.replace('/');
    }
  }, [hydrated, user, isAdmin, router]);

  if (!hydrated || !user || !isAdmin) {
    return <div className="p-6 text-gray-600">{t('common.loading')}</div>;
  }

  return <>{children}</>;
}
