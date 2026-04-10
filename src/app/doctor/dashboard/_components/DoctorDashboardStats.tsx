'use client';

import { useMemo, useState } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import type { DashboardPeriod } from '@/lib/doctor/doctorDashboardStats';
import {
  aggregateDoctorDashboard,
  getPeriodRange,
  shiftAnchor,
} from '@/lib/doctor/doctorDashboardStats';
import { useTranslation } from '@/i18n/I18nContext';

function StatCard({
  title,
  value,
  subtitle,
  accent,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  accent: 'blue' | 'emerald' | 'amber' | 'violet' | 'slate';
}) {
  const accentMap = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    violet: 'text-violet-600',
    slate: 'text-slate-700',
  };
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
      <p className={`text-3xl font-bold mt-2 tabular-nums ${accentMap[accent]}`}>{value}</p>
      {subtitle ? <p className="text-xs text-gray-400 mt-2">{subtitle}</p> : null}
    </div>
  );
}

export default function DoctorDashboardStats() {
  const { t, intlLocale } = useTranslation();
  const user = useAppSelector(selectCurrentUser);
  const [period, setPeriod] = useState<DashboardPeriod>('month');
  const [anchor, setAnchor] = useState(() => new Date());

  const money = useMemo(
    () =>
      new Intl.NumberFormat(intlLocale, {
        style: 'currency',
        currency: 'USD',
      }),
    [intlLocale],
  );

  const periodTabs: { id: DashboardPeriod; label: string }[] = useMemo(
    () => [
      { id: 'day', label: t('doctor.stats.periodDaily') },
      { id: 'month', label: t('doctor.stats.periodMonthly') },
      { id: 'year', label: t('doctor.stats.periodYearly') },
    ],
    [t],
  );

  const { data: doctors = [], isLoading: doctorsLoading } = useGetDoctorsQuery();
  const { data: appointments = [], isLoading: apptsLoading, isError } =
    useGetAppointmentsQuery();

  const clinicDoctor = useMemo(() => {
    if (!user?.email) return undefined;
    return doctors.find((d) => d.Email.toLowerCase() === user.email.toLowerCase());
  }, [doctors, user?.email]);

  const myAppointments = useMemo(() => {
    if (!clinicDoctor) return [];
    return appointments.filter((a) => a.PrimaryDoctorID === clinicDoctor.DoctorID);
  }, [appointments, clinicDoctor]);

  const range = useMemo(
    () => getPeriodRange(period, anchor, intlLocale),
    [period, anchor, intlLocale],
  );

  const stats = useMemo(
    () => aggregateDoctorDashboard(myAppointments, range),
    [myAppointments, range],
  );

  const loading = doctorsLoading || apptsLoading;

  const goPrev = () => setAnchor((a) => shiftAnchor(period, a, -1));
  const goNext = () => setAnchor((a) => shiftAnchor(period, a, 1));
  const goToday = () => setAnchor(new Date());

  if (loading) {
    return <p className="text-gray-500">{t('doctor.stats.loadingDashboard')}</p>;
  }

  if (isError) {
    return <p className="text-red-600">{t('doctor.stats.loadApptError')}</p>;
  }

  if (!clinicDoctor) {
    return (
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        {t('doctor.stats.metricsNoDoctor')}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm w-fit">
          {periodTabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setPeriod(id);
                setAnchor(new Date());
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                period === id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={goPrev}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
            aria-label={t('doctor.stats.prevPeriod')}
          >
            ←
          </button>
          <span className="text-sm font-semibold text-gray-800 min-w-[12rem] text-center">
            {range.label}
          </span>
          <button
            type="button"
            onClick={goNext}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
            aria-label={t('doctor.stats.nextPeriod')}
          >
            →
          </button>
          <button
            type="button"
            onClick={goToday}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-xs font-medium"
          >
            {period === 'day'
              ? t('doctor.stats.thisDay')
              : period === 'month'
                ? t('doctor.stats.thisMonth')
                : t('doctor.stats.thisYear')}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        <strong>{t('doctor.stats.boldCompleted')}</strong> {t('doctor.stats.legendPart1')}{' '}
        <strong>{t('doctor.stats.boldPending')}</strong> {t('doctor.stats.legendPart2')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title={t('doctor.stats.statCompleted')}
          value={stats.completedCount}
          subtitle={t('doctor.stats.statCompletedSub')}
          accent="blue"
        />
        <StatCard
          title={t('doctor.stats.statPending')}
          value={stats.pendingCount}
          subtitle={t('doctor.stats.statPendingSub')}
          accent="amber"
        />
        <StatCard
          title={t('doctor.stats.statPatients')}
          value={stats.patientsAttended}
          subtitle={t('doctor.stats.statPatientsSub')}
          accent="emerald"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title={t('doctor.stats.statRevenue')}
          value={money.format(stats.totalRevenue)}
          subtitle={t('doctor.stats.statRevenueSub')}
          accent="violet"
        />
        <StatCard
          title={t('doctor.stats.statInPeriod')}
          value={stats.appointmentsInRange}
          subtitle={t('doctor.stats.statInPeriodSub')}
          accent="slate"
        />
      </div>
    </div>
  );
}
