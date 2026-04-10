'use client';

import Link from 'next/link';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { formatAuthRolesLabel } from '@/lib/admin/authRoleLabels';
import { useTranslation } from '@/i18n/I18nContext';

export default function AdminProfilePage() {
  const { t } = useTranslation();
  const user = useAppSelector(selectCurrentUser);
  const displayName =
    user?.firstName || user?.lastName
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      : '';

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
          {t('admin.backDashboard')}
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">{t('adminProfile.title')}</h2>
        <p className="text-sm text-gray-600 mt-1">{t('adminProfile.intro')}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-gray-500">{t('adminProfile.displayName')}</dt>
            <dd className="font-semibold text-gray-900 text-lg mt-0.5">
              {displayName || t('common.emptyValue')}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">{t('adminProfile.email')}</dt>
            <dd className="text-gray-900 mt-0.5 break-all">{user?.email ?? t('common.emptyValue')}</dd>
          </div>
          <div>
            <dt className="text-gray-500">{t('adminProfile.userId')}</dt>
            <dd className="font-mono text-gray-900 mt-0.5 break-all">
              {user?.id ?? t('common.emptyValue')}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">{t('adminProfile.roles')}</dt>
            <dd className="text-gray-900 mt-0.5">
              {formatAuthRolesLabel(t, user?.roles) || t('common.emptyValue')}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
