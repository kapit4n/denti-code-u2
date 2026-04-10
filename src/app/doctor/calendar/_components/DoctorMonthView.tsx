'use client';

import Link from 'next/link';
import { appointmentStatusCalendarSurfaceClass } from '@/lib/appointments/appointmentStatus';
import {
  isSameCalendarDay,
  monthCalendarGrid,
  startOfMonth,
} from '@/lib/doctor/calendarUtils';
import { useTranslation } from '@/i18n/I18nContext';
import type { Appointment, PatientProfile } from '@/types';

const WEEKDAY_KEYS = [
  'weekMon',
  'weekTue',
  'weekWed',
  'weekThu',
  'weekFri',
  'weekSat',
  'weekSun',
] as const;
const MAX_VISIBLE = 4;

type Props = {
  /** Any date inside the month to display */
  monthAnchor: Date;
  appointments: Appointment[];
  patientById: Map<number, PatientProfile>;
};

function appointmentsForDay(appointments: Appointment[], day: Date): Appointment[] {
  return appointments
    .filter((a) => isSameCalendarDay(new Date(a.ScheduledDateTime), day))
    .sort(
      (a, b) =>
        new Date(a.ScheduledDateTime).getTime() - new Date(b.ScheduledDateTime).getTime(),
    );
}

export default function DoctorMonthView({
  monthAnchor,
  appointments,
  patientById,
}: Props) {
  const { t, intlLocale } = useTranslation();
  const monthStart = startOfMonth(monthAnchor);
  const monthIndex = monthStart.getMonth();
  const gridDays = monthCalendarGrid(monthAnchor);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {WEEKDAY_KEYS.map((k) => (
          <div
            key={k}
            className="py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide"
          >
            {t(`doctor.calendar.${k}`)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-fr">
        {gridDays.map((day) => {
          const inMonth = day.getMonth() === monthIndex;
          const dayAppts = appointmentsForDay(appointments, day);
          const isToday = isSameCalendarDay(day, today);
          const visible = dayAppts.slice(0, MAX_VISIBLE);
          const more = dayAppts.length - visible.length;

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] sm:min-h-[120px] border-b border-r border-gray-100 p-1 sm:p-1.5 flex flex-col ${
                !inMonth ? 'bg-gray-50/80' : 'bg-white'
              } ${isToday && inMonth ? 'ring-1 ring-inset ring-blue-300 bg-blue-50/30' : ''}`}
            >
              <div
                className={`text-xs font-semibold tabular-nums mb-1 shrink-0 ${
                  inMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday && inMonth ? 'text-blue-800' : ''}`}
              >
                {day.getDate()}
              </div>
              <div className="flex-1 space-y-0.5 overflow-y-auto min-h-0 max-h-[140px] sm:max-h-[180px]">
                {visible.map((a) => {
                  const when = new Date(a.ScheduledDateTime);
                  const time = when.toLocaleTimeString(intlLocale, {
                    hour: 'numeric',
                    minute: '2-digit',
                  });
                  const p = patientById.get(a.PatientID);
                  const short = p
                    ? `${p.FirstName?.charAt(0) || '?'}. ${p.LastName || ''}`.trim()
                    : `#${a.PatientID}`;

                  return (
                    <Link
                      key={a.AppointmentID}
                      href={`/doctor/appointments/${a.AppointmentID}`}
                      title={`${time} — ${p ? `${p.FirstName} ${p.LastName}` : short}`}
                      className={`block truncate rounded px-1 py-0.5 text-[10px] sm:text-xs leading-tight border shadow-sm ${appointmentStatusCalendarSurfaceClass(a.Status)}`}
                    >
                      <span className="font-semibold tabular-nums">{time}</span>{' '}
                      <span className="text-gray-800">{short}</span>
                    </Link>
                  );
                })}
                {more > 0 && inMonth && (
                  <p className="text-[10px] text-gray-500 pl-0.5">
                    {t('doctor.calendar.moreCount', { count: more })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
