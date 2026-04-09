'use client';

import Link from 'next/link';
import {
  appointmentStatusBadgeClass,
  appointmentStatusCalendarSurfaceClass,
  appointmentStatusLabel,
} from '@/lib/appointments/appointmentStatus';
import { isSameCalendarDay } from '@/lib/doctor/calendarUtils';
import type { Appointment, PatientProfile } from '@/types';

type Props = {
  day: Date;
  appointments: Appointment[];
  patientById: Map<number, PatientProfile>;
};

export default function DoctorDayDiary({ day, appointments, patientById }: Props) {
  const dayAppts = appointments
    .filter((a) => isSameCalendarDay(new Date(a.ScheduledDateTime), day))
    .sort(
      (a, b) =>
        new Date(a.ScheduledDateTime).getTime() - new Date(b.ScheduledDateTime).getTime(),
    );

  const label = day.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {dayAppts.length} visit{dayAppts.length === 1 ? '' : 's'} scheduled
        </p>
      </div>
      {dayAppts.length === 0 ? (
        <p className="p-6 text-sm text-gray-500 text-center">Nothing on this day.</p>
      ) : (
        <ul className="p-2 space-y-2">
          {dayAppts.map((a) => {
            const when = new Date(a.ScheduledDateTime);
            const time = when.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            });
            const p = patientById.get(a.PatientID);
            const name = p ? `${p.FirstName} ${p.LastName}` : `Patient #${a.PatientID}`;

            return (
              <li key={a.AppointmentID}>
                <Link
                  href={`/doctor/appointments/${a.AppointmentID}`}
                  className={`flex flex-wrap items-start gap-4 px-4 py-3 rounded-lg border shadow-sm ${appointmentStatusCalendarSurfaceClass(a.Status)}`}
                >
                  <div className="w-16 shrink-0 text-sm font-semibold text-gray-900 tabular-nums">
                    {time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{name}</p>
                    <p className="text-sm text-gray-600">{a.AppointmentPurpose || 'Visit'}</p>
                    <span className={`inline-block mt-1 ${appointmentStatusBadgeClass(a.Status)}`}>
                      {appointmentStatusLabel(a.Status)}
                    </span>
                  </div>
                  <span className="text-xs text-blue-600 font-medium shrink-0">Open →</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
