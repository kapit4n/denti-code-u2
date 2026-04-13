'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  useGetSystemServicesStatusQuery,
  type ServiceApiEndpoint,
} from '@/features/systemStatus/systemStatusApiSlice';
import { useTranslation } from '@/i18n/I18nContext';

const KNOWN_SERVICE_IDS = new Set([
  'gateway',
  'auth',
  'patients',
  'clinic_provider',
  'appointments',
  'ui',
]);

function serviceLabel(t: (k: string) => string, id: string, displayName: string): string {
  const key = `adminServices.services.${id}`;
  const out = t(key);
  return out === key ? displayName : out;
}

export default function AdminServiceEndpointsPage() {
  const params = useParams();
  const serviceId = typeof params.serviceId === 'string' ? params.serviceId : '';
  const { t, intlLocale } = useTranslation();
  const { data, isLoading, isError, error } = useGetSystemServicesStatusQuery();

  const forbidden =
    isError &&
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as FetchBaseQueryError).status === 403;

  const row = data?.services.find((s) => s.id === serviceId);
  const endpoints: ServiceApiEndpoint[] = row?.endpoints ?? [];

  const titleName =
    row != null ? serviceLabel(t, row.id, row.displayName) : serviceId || t('adminServiceEndpoints.unknownService');

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <Link href="/admin/services" className="text-sm font-medium text-blue-600 hover:underline">
          {t('adminServiceEndpoints.backToServices')}
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">
          {t('adminServiceEndpoints.title', { name: titleName })}
        </h2>
        <p className="text-sm text-gray-600 mt-1 max-w-3xl">{t('adminServiceEndpoints.intro')}</p>
        {row?.baseUrl ? (
          <p className="text-xs text-gray-500 mt-2 font-mono break-all">
            {t('adminServiceEndpoints.baseUrl')}: {row.baseUrl}
          </p>
        ) : null}
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
      ) : !KNOWN_SERVICE_IDS.has(serviceId) || !row ? (
        <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          {t('adminServiceEndpoints.notFound')}
        </p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[720px]">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap w-24">
                  {t('adminServiceEndpoints.colMethod')}
                </th>
                <th className="px-4 py-3 font-medium">{t('adminServiceEndpoints.colPath')}</th>
                <th className="px-4 py-3 font-medium">{t('adminServiceEndpoints.colGateway')}</th>
                <th className="px-4 py-3 font-medium">{t('adminServiceEndpoints.colSummary')}</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((ep, idx) => (
                <tr key={`${ep.method}-${ep.path}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-800 whitespace-nowrap">
                    {ep.method}
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-mono text-xs break-all">{ep.path}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs break-all">
                    {ep.gatewayPath ?? t('common.emptyValue')}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{ep.summary ?? t('common.emptyValue')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 px-4 py-3 border-t border-gray-100">
            {t('adminServiceEndpoints.footer', {
              time: data?.checkedAt
                ? new Date(data.checkedAt).toLocaleString(intlLocale, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : '—',
            })}
          </p>
        </div>
      )}
    </div>
  );
}
