'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useGetAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import { useGetPatientsQuery } from '@/features/patients/patientsApiSlice';
import { APPOINTMENT_STATUSES } from '@/lib/appointments/appointmentStatus';
import { appointmentStatusT } from '@/lib/appointments/appointmentStatusI18n';
import { useTranslation } from '@/i18n/I18nContext';
import type { AppointmentStatus } from '@/types';

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const {
    data: patients = [],
    isLoading: patientsLoading,
    isError: patientsError,
  } = useGetPatientsQuery();
  const {
    data: doctors = [],
    isLoading: doctorsLoading,
    isError: doctorsError,
  } = useGetDoctorsQuery();
  const {
    data: appointments = [],
    isLoading: appointmentsLoading,
    isError: appointmentsError,
  } = useGetAppointmentsQuery();

  const loading = patientsLoading || doctorsLoading || appointmentsLoading;
  const hasError = patientsError || doctorsError || appointmentsError;

  const todayAppointmentCount = useMemo(() => {
    const today = new Date();
    return appointments.filter((a) => isSameLocalDay(new Date(a.ScheduledDateTime), today)).length;
  }, [appointments]);

  const byStatus = useMemo(() => {
    const m = new Map<AppointmentStatus, number>();
    for (const s of APPOINTMENT_STATUSES) m.set(s, 0);
    for (const a of appointments) {
      m.set(a.Status, (m.get(a.Status) ?? 0) + 1);
    }
    return m;
  }, [appointments]);

  const statCard = (
    href: string,
    label: string,
    value: number | string,
    accent: string,
  ) => (
    <Link
      href={href}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-blue-200 hover:shadow transition group"
    >
      <h3 className="text-sm font-medium text-gray-600">{label}</h3>
      <p className={`text-3xl font-bold tabular-nums mt-2 ${accent}`}>{value}</p>
      <p className="text-xs font-medium text-blue-600 mt-3 group-hover:underline">{t('admin.manageLink')}</p>
    </Link>
  );

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('adminDashboard.title')}</h2>
        <p className="text-gray-500 text-sm mt-4">{t('common.loading')}</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('adminDashboard.title')}</h2>
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mt-4">
          {t('admin.loadError')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('adminDashboard.title')}</h2>
        <p className="text-gray-600 text-sm mt-1">{t('adminDashboard.subtitle')}</p>
      </div>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('adminDashboard.overviewTitle')}</h3>
        <p className="text-sm text-gray-600 mb-6 max-w-2xl">{t('adminDashboard.overviewIntro')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCard('/admin/patients', t('adminDashboard.totalPatients'), patients.length, 'text-emerald-600')}
          {statCard('/admin/doctors', t('adminDashboard.totalDoctors'), doctors.length, 'text-violet-600')}
          {statCard(
            '/admin/appointments',
            t('adminDashboard.totalAppointments'),
            appointments.length,
            'text-blue-600',
          )}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">{t('adminDashboard.todayAppointments')}</h3>
            <p className="text-3xl font-bold tabular-nums mt-2 text-amber-600">{todayAppointmentCount}</p>
            <Link
              href="/admin/appointments"
              className="inline-block text-xs font-medium text-blue-600 mt-3 hover:underline"
            >
              {t('admin.manageLink')}
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('adminDashboard.byStatusTitle')}</h3>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {APPOINTMENT_STATUSES.map((status) => (
              <li key={status} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-gray-700">{appointmentStatusT(t, status)}</span>
                <span className="font-semibold tabular-nums text-gray-900">{byStatus.get(status) ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
