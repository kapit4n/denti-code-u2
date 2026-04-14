'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useGetPatientsQuery } from '@/features/patients/patientsApiSlice';
import { useTranslation } from '@/i18n/I18nContext';
import RegisterPatientForm from '@/components/patients/RegisterPatientForm';

export default function AdminPatientsPage() {
  const { t, intlLocale } = useTranslation();
  const { data: patients = [], isLoading, isError } = useGetPatientsQuery();

  const rows = useMemo(
    () =>
      [...patients].sort((a, b) => {
        const na = `${a.LastName} ${a.FirstName}`;
        const nb = `${b.LastName} ${b.FirstName}`;
        return na.localeCompare(nb, undefined, { sensitivity: 'base' });
      }),
    [patients],
  );

  if (isLoading) {
    return (
      <div className="max-w-5xl">
        <h2 className="text-2xl font-bold text-gray-900">{t('adminPatients.title')}</h2>
        <p className="text-gray-500 text-sm mt-4">{t('common.loading')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-5xl space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('adminPatients.title')}</h2>
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
        <h2 className="text-2xl font-bold text-gray-900">{t('adminPatients.title')}</h2>
        <p className="text-gray-600 text-sm mt-1">{t('adminPatients.intro')}</p>
        <Link href="/admin/dashboard" className="inline-block mt-2 text-sm font-medium text-blue-600 hover:underline">
          {t('admin.backDashboard')}
        </Link>
      </div>

      <RegisterPatientForm variant="admin" />

      {rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
          {t('adminPatients.empty')}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium tabular-nums">{t('adminPatients.colId')}</th>
                <th className="px-4 py-3 font-medium">{t('adminPatients.colName')}</th>
                <th className="px-4 py-3 font-medium">{t('adminPatients.colDob')}</th>
                <th className="px-4 py-3 font-medium">{t('adminPatients.colPhone')}</th>
                <th className="px-4 py-3 font-medium">{t('adminPatients.colEmail')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.PatientID} className="border-b border-gray-100 hover:bg-gray-50/80">
                  <td className="px-4 py-3 tabular-nums text-gray-600">{p.PatientID}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.FirstName} {p.LastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.DateOfBirth
                      ? new Date(p.DateOfBirth).toLocaleDateString(intlLocale, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : t('common.emptyValue')}
                  </td>
                  <td className="px-4 py-3 text-gray-600 tabular-nums">
                    {p.ContactPhone || t('common.emptyValue')}
                  </td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-[220px]">
                    {p.Email || t('common.emptyValue')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
