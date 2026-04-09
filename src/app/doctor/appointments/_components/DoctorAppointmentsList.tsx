'use client';

import Link from 'next/link';
import {
  appointmentStatusBadgeClass,
  appointmentStatusLabel,
} from '@/lib/appointments/appointmentStatus';
import { sumRecordedTreatmentTotal } from '@/lib/patient/appointmentCost';
import type { Appointment, PatientProfile } from '@/types';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function formatWhen(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}

type Props = {
  appointments: Appointment[];
  patientById: Map<number, PatientProfile>;
};

export default function DoctorAppointmentsList({ appointments, patientById }: Props) {
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
      : `Patient #${appt.PatientID}`;

    const lineTotal = sumRecordedTreatmentTotal(appt);

    return (
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 justify-between items-start">
        <div className="flex-1 min-w-[200px]">
          <p className="font-semibold text-gray-900">{patientLabel}</p>
          <p className="text-sm text-gray-600 mt-0.5">
            {appt.AppointmentPurpose || 'Visit'}
          </p>
          <p className="text-xs mt-2">
            <span className={appointmentStatusBadgeClass(appt.Status)}>
              {appointmentStatusLabel(appt.Status)}
            </span>
          </p>
          {lineTotal > 0 ? (
            <p className="text-xs text-gray-600 mt-2 tabular-nums">
              Recorded: {money.format(lineTotal)}
            </p>
          ) : null}
          <Link
            href={`/doctor/appointments/${appt.AppointmentID}`}
            className="inline-block mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Open visit →
          </Link>
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
      <Section title="Upcoming" items={upcoming} empty="No upcoming visits." />
      <Section title="Past" items={past} empty="No past visits." />
    </div>
  );
}
