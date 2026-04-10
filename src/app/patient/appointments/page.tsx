'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useGetMyAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import { useTranslation } from '@/i18n/I18nContext';
import AppointmentsList from './_components/AppointmentsList';
import AppointmentsSkeleton from './_components/AppointmentsSkeleton';

export default function AppointmentsPage() {
  const { t } = useTranslation();
  const {
    data: appointments,
    isLoading,
    isError,
  } = useGetMyAppointmentsQuery();

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (!hash.startsWith('#patient-appt-')) return;
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [appointments]);

  const renderContent = () => {
    if (isLoading) {
      return <AppointmentsSkeleton />;
    }

    if (isError) {
      return (
        <div className="text-center text-red-600 text-sm">
          {t('patientPortal.appointmentsPage.loadError')}
        </div>
      );
    }

    if (!appointments || appointments.length === 0) {
      return (
        <div className="text-center text-gray-500 text-sm space-y-3">
          <p>{t('patientPortal.appointmentsPage.empty')}</p>
          <Link href="/patient/dashboard" className="inline-block text-blue-600 font-medium hover:underline">
            {t('patientPortal.appointmentsPage.backHome')}
          </Link>
        </div>
      );
    }

    return <AppointmentsList appointments={appointments} />;
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('patientPortal.appointmentsPage.title')}</h2>
        <p className="text-gray-600 text-sm mt-1">{t('patientPortal.appointmentsPage.intro')}</p>
        <Link
          href="/patient/dashboard"
          className="inline-block mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {t('patientPortal.nav.backHome')}
        </Link>
      </div>
      {renderContent()}
    </div>
  );
}
