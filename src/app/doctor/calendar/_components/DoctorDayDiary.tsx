'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { MouseEvent } from 'react';
import { appointmentStatusBadgeClass, appointmentStatusCalendarSurfaceClass } from '@/lib/appointments/appointmentStatus';
import { appointmentStatusT } from '@/lib/appointments/appointmentStatusI18n';
import { isSameCalendarDay } from '@/lib/doctor/calendarUtils';
import { useTranslation } from '@/i18n/I18nContext';
import type { Appointment, PatientProfile } from '@/types';
import AvatarThumb from '@/components/AvatarThumb';

const DEFAULT_DAY_HOURS = Array.from({ length: 13 }, (_, i) => i + 7);

type Props = {
  day: Date;
  appointments: Appointment[];
  patientById: Map<number, PatientProfile>;
  /** Double-click a free slot (not on a visit link) to book; `hour` is 0–23. */
  onSlotDoubleClick?: (day: Date, hour: number) => void;
};

function apptsForDay(appointments: Appointment[], day: Date): Appointment[] {
  return appointments
    .filter((a) => isSameCalendarDay(new Date(a.ScheduledDateTime), day))
    .sort(
      (a, b) =>
        new Date(a.ScheduledDateTime).getTime() - new Date(b.ScheduledDateTime).getTime(),
    );
}

function apptsStartingInHour(dayAppts: Appointment[], hour: number): Appointment[] {
  return dayAppts.filter((a) => new Date(a.ScheduledDateTime).getHours() === hour);
}

export default function DoctorDayDiary({ day, appointments, patientById, onSlotDoubleClick }: Props) {
  const { t, intlLocale } = useTranslation();
  const dayAppts = apptsForDay(appointments, day);

  const hoursToShow = useMemo(() => {
    const set = new Set<number>(DEFAULT_DAY_HOURS);
    for (const a of dayAppts) {
      set.add(new Date(a.ScheduledDateTime).getHours());
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [dayAppts]);

  const label = day.toLocaleDateString(intlLocale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDbl = (e: MouseEvent, hour: number) => {
    if (!onSlotDoubleClick) return;
    if ((e.target as HTMLElement).closest('a')) return;
    onSlotDoubleClick(day, hour);
  };

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white overflow-hidden select-none"
      title={onSlotDoubleClick ? t('doctor.calendar.dblClickNewVisit') : undefined}
    >
      <div
        className="px-4 py-3 border-b border-gray-100 bg-gray-50 cursor-default"
        onDoubleClick={(e) => handleDbl(e, 9)}
      >
        <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {t(
            dayAppts.length === 1
              ? 'doctor.calendar.dayDiaryVisits_one'
              : 'doctor.calendar.dayDiaryVisits_other',
            { count: dayAppts.length },
          )}
        </p>
      </div>
      <div className="divide-y divide-gray-100">
        {hoursToShow.map((hour) => {
          const slotAppts = apptsStartingInHour(dayAppts, hour);
          const timeLabel = new Date(2000, 0, 1, hour, 0).toLocaleTimeString(intlLocale, {
            hour: 'numeric',
            minute: '2-digit',
          });

          return (
            <div
              key={hour}
              className="flex gap-2 sm:gap-3 min-h-[52px] hover:bg-gray-50/80"
              onDoubleClick={(e) => handleDbl(e, hour)}
            >
              <div className="w-14 sm:w-16 shrink-0 py-2 pl-3 text-xs font-medium text-gray-500 tabular-nums border-r border-gray-100 bg-gray-50/50">
                {timeLabel}
              </div>
              <div className="flex-1 py-1.5 pr-2 space-y-1.5 min-w-0">
                {slotAppts.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">{t('doctor.calendar.hourEmpty')}</p>
                ) : (
                  slotAppts.map((a) => {
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
                        className={`flex flex-wrap items-start gap-3 px-3 py-2 rounded-lg border shadow-sm ${appointmentStatusCalendarSurfaceClass(a.Status)}`}
                      >
                        <div className="w-14 shrink-0 text-xs font-semibold text-gray-900 tabular-nums">{time}</div>
                        <div className="flex-1 min-w-0 flex items-start gap-2">
                          <AvatarThumb src={p?.AvatarUrl} name={name} size="sm" className="mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm">{name}</p>
                            <p className="text-xs text-gray-600">
                              {a.AppointmentPurpose || t('doctor.visitDefault')}
                            </p>
                            <span className={`inline-block mt-1 text-xs ${appointmentStatusBadgeClass(a.Status)}`}>
                              {appointmentStatusT(t, a.Status)}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-blue-600 font-medium shrink-0 ml-auto">
                          {t('doctor.calendar.openArrow')}
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
    </div>
  );
}
