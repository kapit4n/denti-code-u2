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
  formatWeekRangeLabel,
  startOfWeekMonday,
} from '@/lib/doctor/calendarUtils';
import type { PatientProfile } from '@/types';
import DoctorWeekView from './_components/DoctorWeekView';
import DoctorDayDiary from './_components/DoctorDayDiary';

type ViewMode = 'week' | 'day';

export default function DoctorCalendarPage() {
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

  const goPrev = () => {
    setCursor((c) => addDays(c, mode === 'week' ? -7 : -1));
  };

  const goNext = () => {
    setCursor((c) => addDays(c, mode === 'week' ? 7 : 1));
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

  const dayCount = useMemo(() => {
    const d = new Date(cursor);
    d.setHours(0, 0, 0, 0);
    return myAppointments.filter((a) => {
      const x = new Date(a.ScheduledDateTime);
      x.setHours(0, 0, 0, 0);
      return x.getTime() === d.getTime();
    }).length;
  }, [myAppointments, cursor]);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Your primary visits only. Each block is tinted by status (e.g. amber for in progress,
            emerald for completed, red for cancelled). Week view shows the full diary; day view lists
            one day in order.
          </p>
          <Link
            href="/doctor/dashboard"
            className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Home
          </Link>
        </div>

        <div className="flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMode('week')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              mode === 'week' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setMode('day')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              mode === 'day' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Day
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading…</p>}

      {!loading && !clinicDoctor && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-900 text-sm">
          Link your login to a clinic doctor record to see your schedule.
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
                aria-label={mode === 'week' ? 'Previous week' : 'Previous day'}
              >
                ←
              </button>
              <button
                type="button"
                onClick={goNext}
                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                aria-label={mode === 'week' ? 'Next week' : 'Next day'}
              >
                →
              </button>
              <button
                type="button"
                onClick={goToday}
                className="ml-1 px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800"
              >
                Today
              </button>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {mode === 'week'
                  ? formatWeekRangeLabel(weekStart, weekEnd)
                  : cursor.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {mode === 'week'
                  ? `${weekCount} visit${weekCount === 1 ? '' : 's'} this week`
                  : `${dayCount} visit${dayCount === 1 ? '' : 's'} this day`}
              </p>
            </div>
          </div>

          {mode === 'week' ? (
            <DoctorWeekView
              weekStartMonday={weekStart}
              appointments={myAppointments}
              patientById={patientById}
            />
          ) : (
            <DoctorDayDiary
              day={cursor}
              appointments={myAppointments}
              patientById={patientById}
            />
          )}

          {mode === 'day' && (
            <p className="text-xs text-gray-500">
              Tip: use Week to compare load across the whole diary; use Day for a simple ordered
              list.
            </p>
          )}
        </>
      )}
    </div>
  );
}
