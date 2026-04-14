'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { appointmentStatusBadgeClass } from '@/lib/appointments/appointmentStatus';
import { appointmentStatusT } from '@/lib/appointments/appointmentStatusI18n';
import { sumRecordedTreatmentTotal } from '@/lib/patient/appointmentCost';
import { useTranslation } from '@/i18n/I18nContext';
import type { Appointment, PatientProfile } from '@/types';
import AvatarThumb from '@/components/AvatarThumb';

type Props = {
  appointments: Appointment[];
  patientById: Map<number, PatientProfile>;
};

export default function DoctorAppointmentsList({ appointments, patientById }: Props) {
  const { t, intlLocale } = useTranslation();
  const money = useMemo(
    () => new Intl.NumberFormat(intlLocale, { style: 'currency', currency: 'USD' }),
    [intlLocale],
  );

  const formatWhen = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString(intlLocale, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: d.toLocaleTimeString(intlLocale, { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const now = new Date();
  const upcoming = appointments
    .filter((a) => new Date(a.ScheduledDateTime) >= now)
    .sort(
      (a, b) =>
        new Date(a.ScheduledDateTime).getTime() - new Date(b.ScheduledDateTime).getTime(),
    );
  const past = appointments
    .filter((a) => new Date(a.ScheduledDateTime) < now)
    .sort(
      (a, b) =>
        new Date(b.ScheduledDateTime).getTime() - new Date(a.ScheduledDateTime).getTime(),
    );

  const Row = ({ appt }: { appt: Appointment }) => {
    const { date, time } = formatWhen(appt.ScheduledDateTime);
    const patient = patientById.get(appt.PatientID);
    const patientLabel = patient
      ? `${patient.FirstName} ${patient.LastName}`
      : t('doctor.patientNum', { id: appt.PatientID });

    const lineTotal = sumRecordedTreatmentTotal(appt);

    return (
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 justify-between items-start">
        <div className="flex-1 min-w-[200px] flex gap-3 items-start">
          <AvatarThumb src={patient?.AvatarUrl} name={patientLabel} size="sm" className="mt-0.5" />
          <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">{patientLabel}</p>
          <p className="text-sm text-gray-600 mt-0.5">
            {appt.AppointmentPurpose || t('doctor.visitDefault')}
          </p>
          <p className="text-xs mt-2">
            <span className={appointmentStatusBadgeClass(appt.Status)}>
              {appointmentStatusT(t, appt.Status)}
            </span>
          </p>
          {lineTotal > 0 ? (
            <p className="text-xs text-gray-600 mt-2 tabular-nums">
              {t('doctor.appointments.recorded', { amount: money.format(lineTotal) })}
            </p>
          ) : null}
          <Link
            href={`/doctor/appointments/${appt.AppointmentID}`}
            className="inline-block mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {t('doctor.appointments.openVisit')}
          </Link>
          </div>
        </div>
        <div className="text-right text-sm shrink-0">
          <p className="font-medium text-gray-800">{date}</p>
          <p className="text-gray-600">{time}</p>
        </div>
      </div>
    );
  };

  const Section = ({
    title,
    items,
    empty,
  }: {
    title: string;
    items: Appointment[];
    empty: string;
  }) => (
    <section>
      <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">{empty}</p>
      ) : (
        <div className="space-y-3">{items.map((appt) => <Row key={appt.AppointmentID} appt={appt} />)}</div>
      )}
    </section>
  );

  return (
    <div className="space-y-10">
      <Section
        title={t('doctor.appointments.sectionUpcoming')}
        items={upcoming}
        empty={t('doctor.appointments.emptyUpcoming')}
      />
      <Section
        title={t('doctor.appointments.sectionPast')}
        items={past}
        empty={t('doctor.appointments.emptyPast')}
      />
    </div>
  );
}
