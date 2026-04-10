'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import { useTranslation } from '@/i18n/I18nContext';

export default function AdminDoctorsPage() {
  const { t } = useTranslation();
  const { data: doctors = [], isLoading, isError } = useGetDoctorsQuery();

  const rows = useMemo(
    () =>
      [...doctors].sort((a, b) => {
        const na = `${a.LastName} ${a.FirstName}`;
        const nb = `${b.LastName} ${b.FirstName}`;
        return na.localeCompare(nb, undefined, { sensitivity: 'base' });
      }),
    [doctors],
  );

  if (isLoading) {
    return (
      <div className="max-w-5xl">
        <h2 className="text-2xl font-bold text-gray-900">{t('adminDoctors.title')}</h2>
        <p className="text-gray-500 text-sm mt-4">{t('common.loading')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-5xl space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('adminDoctors.title')}</h2>
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {t('admin.loadError')}
        </p>
        <Link href="/admin/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
          {t('admin.backDashboard')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('adminDoctors.title')}</h2>
        <p className="text-gray-600 text-sm mt-1">{t('adminDoctors.intro')}</p>
        <Link href="/admin/dashboard" className="inline-block mt-2 text-sm font-medium text-blue-600 hover:underline">
          {t('admin.backDashboard')}
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
          {t('adminDoctors.empty')}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[720px]">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium tabular-nums">{t('adminDoctors.colId')}</th>
                <th className="px-4 py-3 font-medium">{t('adminDoctors.colName')}</th>
                <th className="px-4 py-3 font-medium">{t('adminDoctors.colEmail')}</th>
                <th className="px-4 py-3 font-medium">{t('adminDoctors.colPhone')}</th>
                <th className="px-4 py-3 font-medium">{t('adminDoctors.colLicense')}</th>
                <th className="px-4 py-3 font-medium">{t('adminDoctors.colRoom')}</th>
                <th className="px-4 py-3 font-medium">{t('adminDoctors.colStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const active = d.IsActive !== false;
                return (
                  <tr key={d.DoctorID} className="border-b border-gray-100 hover:bg-gray-50/80">
                    <td className="px-4 py-3 tabular-nums text-gray-600">{d.DoctorID}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {d.FirstName} {d.LastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">{d.Email}</td>
                    <td className="px-4 py-3 text-gray-600 tabular-nums">
                      {d.ContactPhone || t('common.emptyValue')}
                    </td>
                    <td className="px-4 py-3 text-gray-600 tabular-nums">
                      {d.LicenseNumber || t('common.emptyValue')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {d.OfficeRoomNumber ?? t('common.emptyValue')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          active
                            ? 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800'
                            : 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600'
                        }
                      >
                        {active ? t('adminDoctors.active') : t('adminDoctors.inactive')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
