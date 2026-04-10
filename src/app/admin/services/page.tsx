'use client';

import Link from 'next/link';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  useGetSystemServicesStatusQuery,
  type ServiceStatusRow,
} from '@/features/systemStatus/systemStatusApiSlice';
import { useTranslation } from '@/i18n/I18nContext';

function serviceLabel(t: (k: string) => string, row: ServiceStatusRow): string {
  const key = `adminServices.services.${row.id}`;
  const out = t(key);
  return out === key ? row.displayName : out;
}

function detailLabel(t: (k: string) => string, detail: string | undefined): string {
  if (!detail) return t('common.emptyValue');
  if (detail === 'this_process') return t('adminServices.detailThisProcess');
  if (detail === 'not_configured') return t('adminServices.status.not_configured');
  return detail;
}

function statusBadgeClass(status: ServiceStatusRow['status']): string {
  switch (status) {
    case 'up':
      return 'bg-emerald-50 text-emerald-800 ring-emerald-200';
    case 'down':
      return 'bg-red-50 text-red-800 ring-red-200';
    default:
      return 'bg-gray-100 text-gray-600 ring-gray-200';
  }
}

export default function AdminServicesStatusPage() {
  const { t, intlLocale } = useTranslation();
  const { data, isLoading, isError, error, refetch, isFetching } = useGetSystemServicesStatusQuery();

  const forbidden =
    isError &&
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as FetchBaseQueryError).status === 403;

  const checkedDisplay = data?.checkedAt
    ? new Date(data.checkedAt).toLocaleString(intlLocale, {
        dateStyle: 'medium',
        timeStyle: 'medium',
      })
    : null;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
            {t('admin.backDashboard')}
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">{t('adminServices.title')}</h2>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">{t('adminServices.intro')}</p>
          {checkedDisplay ? (
            <p className="text-xs text-gray-500 mt-2">
              {t('adminServices.lastChecked', { time: checkedDisplay })}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="shrink-0 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
        >
          {isFetching ? t('common.loading') : t('adminServices.refresh')}
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-sm">{t('common.loading')}</p>
      ) : forbidden ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          {t('adminServices.forbidden')}
        </p>
      ) : isError ? (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {t('admin.loadError')}
        </p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[560px]">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">{t('adminServices.colService')}</th>
                <th className="px-4 py-3 font-medium">{t('adminServices.colStatus')}</th>
                <th className="px-4 py-3 font-medium">{t('adminServices.colAddress')}</th>
                <th className="px-4 py-3 font-medium">{t('adminServices.colDetail')}</th>
              </tr>
            </thead>
            <tbody>
              {(data?.services ?? []).map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-medium text-gray-900">{serviceLabel(t, row)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${statusBadgeClass(row.status)}`}
                    >
                      {t(`adminServices.status.${row.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs break-all max-w-[240px]">
                    {row.baseUrl ?? t('common.emptyValue')}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    <span
                      className={
                        row.detail === 'this_process' || row.detail === 'not_configured'
                          ? ''
                          : 'font-mono'
                      }
                    >
                      {detailLabel(t, row.detail)}
                    </span>
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
