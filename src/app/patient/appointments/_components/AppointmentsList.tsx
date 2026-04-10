'use client';

import { useMemo } from 'react';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import type { Appointment } from '@/types';
import { useTranslation } from '@/i18n/I18nContext';
import AppointmentCard from './AppointmentCard';

interface AppointmentsListProps {
  appointments: Appointment[];
}

export default function AppointmentsList({ appointments }: AppointmentsListProps) {
  const { t } = useTranslation();
  const { data: doctors = [] } = useGetDoctorsQuery();

  const doctorById = useMemo(() => {
    const m = new Map<number, string>();
    for (const d of doctors) {
      const name = `${d.FirstName} ${d.LastName}`.trim();
      m.set(d.DoctorID, t('portal.dr', { name }));
    }
    return m;
  }, [doctors, t]);

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
    t('patientPortal.primaryDentistFallback', { id: appt.PrimaryDoctorID });

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-1 border-b border-gray-200 pb-2">
          {t('patientPortal.list.upcoming')}
        </h3>
        <p className="text-sm text-gray-500 mb-4">{t('patientPortal.list.upcomingHelp')}</p>
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
          <p className="text-gray-500 text-sm">{t('patientPortal.list.noUpcoming')}</p>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-1 border-b border-gray-200 pb-2">
          {t('patientPortal.list.past')}
        </h3>
        <p className="text-sm text-gray-500 mb-4">{t('patientPortal.list.pastHelp')}</p>
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
          <p className="text-gray-500 text-sm">{t('patientPortal.list.noPast')}</p>
        )}
      </div>
    </div>
  );
}
