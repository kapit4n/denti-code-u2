'use client';

import Link from 'next/link';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useTranslation } from '@/i18n/I18nContext';

export default function AdminProfilePage() {
  const { t } = useTranslation();
  const user = useAppSelector(selectCurrentUser);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
          {t('adminProfile.backDashboard')}
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">{t('adminProfile.title')}</h2>
        <p className="text-sm text-gray-600 mt-1">{t('adminProfile.intro')}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="mb-6">
          <p className="font-semibold text-gray-900 text-lg">
            {user?.firstName || user?.lastName
              ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
              : '—'}
          </p>
          <p className="text-sm text-gray-500 mt-1">{user?.email ?? '—'}</p>
        </div>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-gray-500">{t('adminProfile.userId')}</dt>
            <dd className="font-mono text-gray-900 mt-0.5 break-all">{user?.id ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">{t('adminProfile.roles')}</dt>
            <dd className="text-gray-900 mt-0.5">
              {user?.roles?.length ? user.roles.join(', ') : '—'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
