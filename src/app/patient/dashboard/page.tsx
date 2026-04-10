'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useGetMyAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import { useGetMyProfileQuery } from '@/features/patients/patientsApiSlice';
import AppointmentCard from '@/app/patient/appointments/_components/AppointmentCard';
import PatientInfoSummary from '@/app/patient/_components/PatientInfoSummary';
import { sumRecordedTreatmentTotal } from '@/lib/patient/appointmentCost';
import { useTranslation } from '@/i18n/I18nContext';

const UPCOMING_PREVIEW = 4;

export default function PatientDashboardPage() {
  const { t } = useTranslation();
  const { data: profile, isLoading: profileLoading, isError: profileError } = useGetMyProfileQuery();
  const { data: appointments = [], isLoading: apptLoading, isError: apptError } =
    useGetMyAppointmentsQuery();
  const { data: doctors = [] } = useGetDoctorsQuery();

  const doctorById = useMemo(() => {
    const m = new Map<number, string>();
    for (const d of doctors) {
      const name = `${d.FirstName} ${d.LastName}`.trim();
      m.set(d.DoctorID, t('portal.dr', { name }));
    }
    return m;
  }, [doctors, t]);

  const upcoming = useMemo(() => {
    const n = new Date();
    return appointments
      .filter((a) => new Date(a.ScheduledDateTime) >= n)
      .sort(
        (a, b) =>
          new Date(a.ScheduledDateTime).getTime() - new Date(b.ScheduledDateTime).getTime(),
      );
  }, [appointments]);

  const upcomingPreview = upcoming.slice(0, UPCOMING_PREVIEW);

  const recordedTotalsUpcoming = useMemo(
    () => upcomingPreview.reduce((s, a) => s + sumRecordedTreatmentTotal(a), 0),
    [upcomingPreview],
  );

  const loading = profileLoading || apptLoading;

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('patientPortal.dashboard.title')}</h2>
        <p className="text-gray-600 text-sm mt-1">{t('patientPortal.dashboard.intro')}</p>
      </div>

      {loading && (
        <p className="text-gray-500 text-sm">{t('patientPortal.dashboard.loading')}</p>
      )}

      {!loading && profileError && (
        <p className="text-red-600 text-sm">{t('patientPortal.dashboard.profileError')}</p>
      )}

      {!loading && !profileError && profile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <PatientInfoSummary profile={profile} />

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('patientPortal.dashboard.upcomingTitle')}
              </h2>
              <Link
                href="/patient/appointments"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {t('patientPortal.dashboard.allVisits')}
              </Link>
            </div>

            {apptError && (
              <p className="text-sm text-red-600">{t('patientPortal.dashboard.apptLoadError')}</p>
            )}

            {!apptError && upcomingPreview.length === 0 && (
              <p className="text-sm text-gray-500">{t('patientPortal.dashboard.noUpcoming')}</p>
            )}

            {!apptError && upcomingPreview.length > 0 && (
              <ul className="space-y-3">
                {upcomingPreview.map((appt) => (
                  <li key={appt.AppointmentID}>
                    <AppointmentCard
                      appointment={appt}
                      patientActions
                      compact
                      doctorLabel={
                        doctorById.get(appt.PrimaryDoctorID) ??
                        t('patientPortal.primaryDentistFallback', { id: appt.PrimaryDoctorID })
                      }
                      showCost
                    />
                  </li>
                ))}
              </ul>
            )}

            {!apptError && recordedTotalsUpcoming > 0 && (
              <p className="text-xs text-gray-500 mt-3 border-t border-gray-100 pt-3">
                {t('patientPortal.dashboard.subtotalNote')}
              </p>
            )}
          </div>
        </div>
      )}

      <section className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          {t('patientPortal.dashboard.quickLinks')}
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/patient/appointments"
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            {t('patientPortal.dashboard.linkFullList')}
          </Link>
          <Link
            href="/patient/profile"
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            {t('patientPortal.dashboard.linkProfile')}
          </Link>
        </div>
      </section>
    </div>
  );
}
