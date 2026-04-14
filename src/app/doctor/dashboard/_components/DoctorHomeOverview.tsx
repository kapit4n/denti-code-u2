'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import { useGetPatientsQuery } from '@/features/patients/patientsApiSlice';
import { appointmentStatusBadgeClass } from '@/lib/appointments/appointmentStatus';
import { appointmentStatusT } from '@/lib/appointments/appointmentStatusI18n';
import { useTranslation } from '@/i18n/I18nContext';
import type { Appointment, PatientProfile } from '@/types';
import AvatarThumb from '@/components/AvatarThumb';

const UPCOMING_PREVIEW = 6;

export default function DoctorHomeOverview() {
  const { t, intlLocale } = useTranslation();
  const user = useAppSelector(selectCurrentUser);
  const { data: doctors = [], isLoading: docLoading } = useGetDoctorsQuery();
  const { data: appointments = [], isLoading: apptLoading } = useGetAppointmentsQuery();
  const { data: patientsRaw = [] } = useGetPatientsQuery();

  const patients = useMemo((): PatientProfile[] => {
    return (patientsRaw as PatientProfile[]).filter(
      (p) => p && typeof p.PatientID === 'number',
    );
  }, [patientsRaw]);

  const clinicDoctor = useMemo(() => {
    if (!user?.email) return undefined;
    return doctors.find((d) => d.Email.toLowerCase() === user.email.toLowerCase());
  }, [doctors, user?.email]);

  const myAppointments = useMemo(() => {
    if (!clinicDoctor) return [];
    return appointments.filter((a) => a.PrimaryDoctorID === clinicDoctor.DoctorID);
  }, [appointments, clinicDoctor]);

  const patientById = useMemo(() => {
    const m = new Map<number, PatientProfile>();
    for (const p of patients) {
      m.set(p.PatientID, p);
    }
    return m;
  }, [patients]);

  const upcoming = useMemo(() => {
    const n = new Date();
    return myAppointments
      .filter((a) => new Date(a.ScheduledDateTime) >= n)
      .sort(
        (a, b) =>
          new Date(a.ScheduledDateTime).getTime() - new Date(b.ScheduledDateTime).getTime(),
      )
      .slice(0, UPCOMING_PREVIEW);
  }, [myAppointments]);

  const loading = docLoading || apptLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('doctor.home.title')}</h2>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">{t('doctor.home.intro')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/doctor/appointments"
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          {t('doctor.home.linkVisits')}
        </Link>
        <Link
          href="/doctor/calendar"
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          {t('doctor.home.linkCalendar')}
        </Link>
        <Link
          href="/doctor/patients"
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          {t('doctor.home.linkPatients')}
        </Link>
      </div>

      {loading && <p className="text-sm text-gray-500">{t('doctor.home.loadingSchedule')}</p>}

      {!loading && !clinicDoctor && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          {t('doctor.home.noDoctorWarning')}
        </p>
      )}

      {!loading && clinicDoctor && (
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">{t('doctor.home.nextCalendar')}</h3>
            <Link
              href="/doctor/appointments"
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              {t('doctor.home.allVisits')}
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">{t('doctor.home.noUpcoming')}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcoming.map((a: Appointment) => {
                const p = patientById.get(a.PatientID);
                const label = p
                  ? `${p.FirstName} ${p.LastName}`
                  : t('doctor.patientNum', { id: a.PatientID });
                const whenStr = new Date(a.ScheduledDateTime).toLocaleString(intlLocale, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });
                return (
                  <li
                    key={a.AppointmentID}
                    className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-gray-50/80"
                  >
                    <div className="min-w-0 flex items-start gap-3 flex-1">
                      <AvatarThumb src={p?.AvatarUrl} name={label} size="sm" className="mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {a.AppointmentPurpose || t('doctor.visitDefault')}
                        </p>
                        <span className={`mt-1 ${appointmentStatusBadgeClass(a.Status)}`}>
                          {appointmentStatusT(t, a.Status)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-gray-800">{whenStr}</p>
                      <Link
                        href={`/doctor/appointments/${a.AppointmentID}`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 mt-1 inline-block"
                      >
                        {t('doctor.home.openVisit')}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
