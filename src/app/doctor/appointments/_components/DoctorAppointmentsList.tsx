'use client';

import type { Appointment } from '@/types';
import type { PatientProfile } from '@/types';

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

    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-4 justify-between items-start">
        <div>
          <p className="font-semibold text-gray-900">{patientLabel}</p>
          <p className="text-sm text-gray-600">
            {appt.AppointmentPurpose || 'No purpose listed'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Status: {appt.Status}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-medium text-gray-800">{date}</p>
          <p className="text-gray-600">{time}</p>
          <p className="text-xs text-gray-400 mt-1">Appt #{appt.AppointmentID}</p>
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
      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">{title}</h3>
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">{empty}</p>
      ) : (
        <div className="space-y-3">{items.map((appt) => <Row key={appt.AppointmentID} appt={appt} />)}</div>
      )}
    </section>
  );

  return (
    <div className="space-y-10">
      <Section title="Upcoming" items={upcoming} empty="No upcoming appointments." />
      <Section title="Past" items={past} empty="No past appointments." />
    </div>
  );
}
