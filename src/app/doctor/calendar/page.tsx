'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import { useGetPatientsQuery } from '@/features/patients/patientsApiSlice';
import {
  addDays,
  addMonths,
  formatMonthYearLabel,
  formatWeekRangeLabel,
  startOfMonth,
  startOfWeekMonday,
} from '@/lib/doctor/calendarUtils';
import type { PatientProfile } from '@/types';
import DoctorWeekView from './_components/DoctorWeekView';
import DoctorDayDiary from './_components/DoctorDayDiary';
import DoctorMonthView from './_components/DoctorMonthView';
import { useTranslation } from '@/i18n/I18nContext';

type ViewMode = 'week' | 'month' | 'day';

export default function DoctorCalendarPage() {
  const { t, intlLocale } = useTranslation();
  const user = useAppSelector(selectCurrentUser);
  const [mode, setMode] = useState<ViewMode>('week');
  const [cursor, setCursor] = useState(() => new Date());

  const { data: doctors = [], isLoading: docLoading } = useGetDoctorsQuery();
  const { data: appointments = [], isLoading: apptLoading } = useGetAppointmentsQuery();
  const { data: patientsRaw = [] } = useGetPatientsQuery();

  const patients = useMemo((): PatientProfile[] => {
    return (patientsRaw as PatientProfile[]).filter(
      (p) => p && typeof p.PatientID === 'number',
    );
  }, [patientsRaw]);

  const clinicDoctor = useMemo(() => {
    if (!user?.email) return undefined;
    return doctors.find((d) => d.Email.toLowerCase() === user.email.toLowerCase());
  }, [doctors, user?.email]);

  const myAppointments = useMemo(() => {
    if (!clinicDoctor) return [];
    return appointments.filter((a) => a.PrimaryDoctorID === clinicDoctor.DoctorID);
  }, [appointments, clinicDoctor]);

  const patientById = useMemo(() => {
    const m = new Map<number, PatientProfile>();
    for (const p of patients) {
      m.set(p.PatientID, p);
    }
    return m;
  }, [patients]);

  const weekStart = useMemo(() => startOfWeekMonday(cursor), [cursor]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const monthStart = useMemo(() => startOfMonth(cursor), [cursor]);
  const monthEndExclusive = useMemo(() => {
    const x = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    x.setHours(0, 0, 0, 0);
    return x;
  }, [cursor]);

  const goPrev = () => {
    setCursor((c) => {
      if (mode === 'week') return addDays(c, -7);
      if (mode === 'month') return addMonths(c, -1);
      return addDays(c, -1);
    });
  };

  const goNext = () => {
    setCursor((c) => {
      if (mode === 'week') return addDays(c, 7);
      if (mode === 'month') return addMonths(c, 1);
      return addDays(c, 1);
    });
  };

  const goToday = () => setCursor(new Date());

  const loading = docLoading || apptLoading;

  const weekCount = useMemo(() => {
    const ws = weekStart.getTime();
    const nextMon = addDays(weekStart, 7);
    nextMon.setHours(0, 0, 0, 0);
    const end = nextMon.getTime();
    let n = 0;
    for (const a of myAppointments) {
      const t = new Date(a.ScheduledDateTime).getTime();
      if (t >= ws && t < end) n += 1;
    }
    return n;
  }, [myAppointments, weekStart]);

  const monthCount = useMemo(() => {
    const start = monthStart.getTime();
    const end = monthEndExclusive.getTime();
    let n = 0;
    for (const a of myAppointments) {
      const t = new Date(a.ScheduledDateTime).getTime();
      if (t >= start && t < end) n += 1;
    }
    return n;
  }, [myAppointments, monthStart, monthEndExclusive]);

  const dayCount = useMemo(() => {
    const d = new Date(cursor);
    d.setHours(0, 0, 0, 0);
    return myAppointments.filter((a) => {
      const x = new Date(a.ScheduledDateTime);
      x.setHours(0, 0, 0, 0);
      return x.getTime() === d.getTime();
    }).length;
  }, [myAppointments, cursor]);

  const periodLabel =
    mode === 'week'
      ? formatWeekRangeLabel(weekStart, weekEnd, intlLocale)
      : mode === 'month'
        ? formatMonthYearLabel(cursor, intlLocale)
        : cursor.toLocaleDateString(intlLocale, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });

  const countLabel =
    mode === 'week'
      ? t(
          weekCount === 1
            ? 'doctor.calendar.visitsWeek_one'
            : 'doctor.calendar.visitsWeek_other',
          { count: weekCount },
        )
      : mode === 'month'
        ? t(
            monthCount === 1
              ? 'doctor.calendar.visitsMonth_one'
              : 'doctor.calendar.visitsMonth_other',
            { count: monthCount },
          )
        : t(
            dayCount === 1 ? 'doctor.calendar.visitsDay_one' : 'doctor.calendar.visitsDay_other',
            { count: dayCount },
          );

  const prevAria =
    mode === 'week'
      ? t('doctor.calendar.prevWeek')
      : mode === 'month'
        ? t('doctor.calendar.prevMonth')
        : t('doctor.calendar.prevDay');
  const nextAria =
    mode === 'week'
      ? t('doctor.calendar.nextWeek')
      : mode === 'month'
        ? t('doctor.calendar.nextMonth')
        : t('doctor.calendar.nextDay');

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('doctor.calendar.title')}</h2>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">{t('doctor.calendar.intro')}</p>
          <Link
            href="/doctor/dashboard"
            className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {t('doctor.nav.backHome')}
          </Link>
        </div>

        <div className="flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm flex-wrap">
          <button
            type="button"
            onClick={() => setMode('month')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              mode === 'month' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t('doctor.calendar.month')}
          </button>
          <button
            type="button"
            onClick={() => setMode('week')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              mode === 'week' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t('doctor.calendar.week')}
          </button>
          <button
            type="button"
            onClick={() => setMode('day')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              mode === 'day' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t('doctor.calendar.day')}
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">{t('common.loading')}</p>}

      {!loading && !clinicDoctor && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-900 text-sm">
          {t('doctor.calendar.noDoctor')}
        </div>
      )}

      {!loading && clinicDoctor && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                aria-label={prevAria}
              >
                ←
              </button>
              <button
                type="button"
                onClick={goNext}
                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                aria-label={nextAria}
              >
                →
              </button>
              <button
                type="button"
                onClick={goToday}
                className="ml-1 px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800"
              >
                {t('doctor.calendar.today')}
              </button>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{periodLabel}</p>
              <p className="text-xs text-gray-500 mt-0.5">{countLabel}</p>
            </div>
          </div>

          {mode === 'week' && (
            <DoctorWeekView
              weekStartMonday={weekStart}
              appointments={myAppointments}
              patientById={patientById}
            />
          )}
          {mode === 'month' && (
            <DoctorMonthView
              monthAnchor={cursor}
              appointments={myAppointments}
              patientById={patientById}
            />
          )}
          {mode === 'day' && (
            <DoctorDayDiary
              day={cursor}
              appointments={myAppointments}
              patientById={patientById}
            />
          )}

          {mode === 'day' && (
            <p className="text-xs text-gray-500">{t('doctor.calendar.dayTip')}</p>
          )}
        </>
      )}
    </div>
  );
}
