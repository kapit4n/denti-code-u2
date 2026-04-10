'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useGetAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import { useGetPatientsQuery } from '@/features/patients/patientsApiSlice';
import { appointmentStatusBadgeClass } from '@/lib/appointments/appointmentStatus';
import { appointmentStatusT } from '@/lib/appointments/appointmentStatusI18n';
import { useTranslation } from '@/i18n/I18nContext';

export default function AdminAppointmentsPage() {
  const { t, intlLocale } = useTranslation();
  const { data: appointments = [], isLoading: apLoading, isError: apError } = useGetAppointmentsQuery();
  const { data: patients = [], isLoading: pLoading, isError: pError } = useGetPatientsQuery();
  const { data: doctors = [], isLoading: dLoading, isError: dError } = useGetDoctorsQuery();

  const patientById = useMemo(() => new Map(patients.map((p) => [p.PatientID, p])), [patients]);
  const doctorById = useMemo(() => new Map(doctors.map((d) => [d.DoctorID, d])), [doctors]);

  const rows = useMemo(
    () =>
      [...appointments].sort(
        (a, b) =>
          new Date(b.ScheduledDateTime).getTime() - new Date(a.ScheduledDateTime).getTime(),
      ),
    [appointments],
  );

  const loading = apLoading || pLoading || dLoading;
  const hasError = apError || pError || dError;

  const formatWhen = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(intlLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl">
        <h2 className="text-2xl font-bold text-gray-900">{t('adminAppointments.title')}</h2>
        <p className="text-gray-500 text-sm mt-4">{t('common.loading')}</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="max-w-6xl space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('adminAppointments.title')}</h2>
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {t('admin.loadError')}
        </p>
        <Link href="/admin/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
          {t('admin.backDashboard')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('adminAppointments.title')}</h2>
        <p className="text-gray-600 text-sm mt-1">{t('adminAppointments.intro')}</p>
        <Link href="/admin/dashboard" className="inline-block mt-2 text-sm font-medium text-blue-600 hover:underline">
          {t('admin.backDashboard')}
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
          {t('adminAppointments.empty')}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium tabular-nums">{t('adminAppointments.colId')}</th>
                <th className="px-4 py-3 font-medium">{t('adminAppointments.colWhen')}</th>
                <th className="px-4 py-3 font-medium">{t('adminAppointments.colPatient')}</th>
                <th className="px-4 py-3 font-medium">{t('adminAppointments.colDoctor')}</th>
                <th className="px-4 py-3 font-medium">{t('adminAppointments.colPurpose')}</th>
                <th className="px-4 py-3 font-medium">{t('adminAppointments.colStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const patient = patientById.get(a.PatientID);
                const doctor = doctorById.get(a.PrimaryDoctorID);
                const patientLabel = patient
                  ? `${patient.FirstName} ${patient.LastName}`
                  : t('adminAppointments.patientById', { id: a.PatientID });
                const doctorLabel = doctor
                  ? `${doctor.FirstName} ${doctor.LastName}`
                  : t('adminAppointments.doctorById', { id: a.PrimaryDoctorID });

                return (
                  <tr key={a.AppointmentID} className="border-b border-gray-100 hover:bg-gray-50/80">
                    <td className="px-4 py-3 tabular-nums text-gray-600">{a.AppointmentID}</td>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                      {formatWhen(a.ScheduledDateTime)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{patientLabel}</td>
                    <td className="px-4 py-3 text-gray-700">{doctorLabel}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                      {a.AppointmentPurpose || t('common.emptyValue')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={appointmentStatusBadgeClass(a.Status)}>
                        {appointmentStatusT(t, a.Status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
