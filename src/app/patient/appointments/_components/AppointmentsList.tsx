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
    const m = new Map<
      number,
      { label: string; plainName: string; avatarUrl: string | null | undefined }
    >();
    for (const d of doctors) {
      const plainName = `${d.FirstName} ${d.LastName}`.trim();
      m.set(d.DoctorID, {
        label: t('portal.dr', { name: plainName }),
        plainName,
        avatarUrl: d.AvatarUrl,
      });
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

  const doctorMeta = (appt: Appointment) =>
    doctorById.get(appt.PrimaryDoctorID) ?? {
      label: t('patientPortal.primaryDentistFallback', { id: appt.PrimaryDoctorID }),
      plainName: t('patientPortal.primaryDentistFallback', { id: appt.PrimaryDoctorID }),
      avatarUrl: undefined as string | null | undefined,
    };

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-1 border-b border-gray-200 pb-2">
          {t('patientPortal.list.upcoming')}
        </h3>
        <p className="text-sm text-gray-500 mb-4">{t('patientPortal.list.upcomingHelp')}</p>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map((appt) => {
              const d = doctorMeta(appt);
              return (
                <AppointmentCard
                  key={appt.AppointmentID}
                  appointment={appt}
                  patientActions
                  doctorLabel={d.label}
                  doctorPlainName={d.plainName}
                  doctorAvatarUrl={d.avatarUrl}
                  showCost
                />
              );
            })}
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
            {pastAppointments.map((appt) => {
              const d = doctorMeta(appt);
              return (
                <AppointmentCard
                  key={appt.AppointmentID}
                  appointment={appt}
                  isPast
                  patientActions
                  doctorLabel={d.label}
                  doctorPlainName={d.plainName}
                  doctorAvatarUrl={d.avatarUrl}
                  showCost
                />
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">{t('patientPortal.list.noPast')}</p>
        )}
      </div>
    </div>
  );
}
