'use client';

import { useMemo } from 'react';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import type { Appointment } from '@/types';
import AppointmentCard from './AppointmentCard';

interface AppointmentsListProps {
  appointments: Appointment[];
}

export default function AppointmentsList({ appointments }: AppointmentsListProps) {
  const { data: doctors = [] } = useGetDoctorsQuery();

  const doctorById = useMemo(() => {
    const m = new Map<number, string>();
    for (const d of doctors) {
      m.set(d.DoctorID, `Dr. ${d.FirstName} ${d.LastName}`);
    }
    return m;
  }, [doctors]);

  const now = new Date();

  const upcomingAppointments = appointments
    .filter((appt) => new Date(appt.ScheduledDateTime) >= now)
    .sort(
      (a, b) =>
        new Date(a.ScheduledDateTime).getTime() - new Date(b.ScheduledDateTime).getTime(),
    );

  const pastAppointments = appointments
    .filter((appt) => new Date(appt.ScheduledDateTime) < now)
    .sort(
      (a, b) =>
        new Date(b.ScheduledDateTime).getTime() - new Date(a.ScheduledDateTime).getTime(),
    );

  const doctorLabel = (appt: Appointment) =>
    doctorById.get(appt.PrimaryDoctorID) ??
    `Primary dentist (clinic ID ${appt.PrimaryDoctorID})`;

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-1 border-b border-gray-200 pb-2">
          Upcoming
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Your dentist, visit status, and any treatment totals already posted for that appointment.
        </p>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map((appt) => (
              <AppointmentCard
                key={appt.AppointmentID}
                appointment={appt}
                patientActions
                doctorLabel={doctorLabel(appt)}
                showCost
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No upcoming appointments.</p>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-1 border-b border-gray-200 pb-2">
          Past visits
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Completed or past-dated visits and recorded treatment amounts when available.
        </p>
        {pastAppointments.length > 0 ? (
          <div className="space-y-4">
            {pastAppointments.map((appt) => (
              <AppointmentCard
                key={appt.AppointmentID}
                appointment={appt}
                isPast
                patientActions
                doctorLabel={doctorLabel(appt)}
                showCost
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No past visits yet.</p>
        )}
      </div>
    </div>
  );
}
