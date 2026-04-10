'use client';

import Link from 'next/link';
import { appointmentStatusBadgeClass, appointmentStatusCalendarSurfaceClass } from '@/lib/appointments/appointmentStatus';
import { appointmentStatusT } from '@/lib/appointments/appointmentStatusI18n';
import { isSameCalendarDay, weekDaysFrom } from '@/lib/doctor/calendarUtils';
import { useTranslation } from '@/i18n/I18nContext';
import type { Appointment, PatientProfile } from '@/types';

type Props = {
  weekStartMonday: Date;
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

export default function DoctorWeekView({
  weekStartMonday,
  appointments,
  patientById,
}: Props) {
  const { t, intlLocale } = useTranslation();
  const days = weekDaysFrom(weekStartMonday);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
      {days.map((day) => {
        const dayAppts = appointmentsForDay(appointments, day);
        const isToday = isSameCalendarDay(day, today);
        const header = day.toLocaleDateString(intlLocale, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });

        return (
          <div
            key={day.toISOString()}
            className={`rounded-xl border min-h-[140px] flex flex-col ${
              isToday ? 'border-blue-400 bg-blue-50/40 ring-1 ring-blue-200' : 'border-gray-200 bg-white'
            }`}
          >
            <div
              className={`px-2 py-2 border-b text-center text-xs font-semibold ${
                isToday ? 'border-blue-200 text-blue-900' : 'border-gray-100 text-gray-700'
              }`}
            >
              {header}
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[min(420px,50vh)]">
              {dayAppts.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">—</p>
              ) : (
                dayAppts.map((a) => {
                  const when = new Date(a.ScheduledDateTime);
                  const time = when.toLocaleTimeString(intlLocale, {
                    hour: 'numeric',
                    minute: '2-digit',
                  });
                  const p = patientById.get(a.PatientID);
                  const name = p
                    ? `${p.FirstName} ${p.LastName}`
                    : t('doctor.patientNum', { id: a.PatientID });

                  return (
                    <Link
                      key={a.AppointmentID}
                      href={`/doctor/appointments/${a.AppointmentID}`}
                      className={`block rounded-lg border px-2 py-1.5 shadow-sm ${appointmentStatusCalendarSurfaceClass(a.Status)}`}
                    >
                      <p className="text-xs font-semibold text-gray-900 tabular-nums">{time}</p>
                      <p className="text-xs text-gray-800 truncate" title={name}>
                        {name}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        {a.AppointmentPurpose || t('doctor.visitDefault')}
                      </p>
                      <span
                        className={`inline-block mt-1 text-[10px] ${appointmentStatusBadgeClass(a.Status)}`}
                      >
                        {appointmentStatusT(t, a.Status)}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
