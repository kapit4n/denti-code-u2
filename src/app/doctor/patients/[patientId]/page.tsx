'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import { useGetPatientByIdQuery } from '@/features/patients/patientsApiSlice';
import { appointmentStatusBadgeClass } from '@/lib/appointments/appointmentStatus';
import { appointmentStatusT } from '@/lib/appointments/appointmentStatusI18n';
import { formatDobDisplay } from '@/lib/doctor/clinicalFormat';
import { sumRecordedTreatmentTotal } from '@/lib/patient/appointmentCost';
import { useTranslation } from '@/i18n/I18nContext';

export default function DoctorPatientDetailPage() {
  const { t, intlLocale } = useTranslation();
  const money = useMemo(
    () => new Intl.NumberFormat(intlLocale, { style: 'currency', currency: 'USD' }),
    [intlLocale],
  );
  const params = useParams();
  const rawId = params?.patientId;
  const patientId =
    typeof rawId === 'string' ? Number.parseInt(rawId, 10) : Number.NaN;
  const validId = Number.isFinite(patientId) && patientId > 0;

  const user = useAppSelector(selectCurrentUser);
  const { data: doctors = [], isLoading: doctorsLoading } = useGetDoctorsQuery();
  const { data: appointments = [], isLoading: apptsLoading } = useGetAppointmentsQuery();

  const clinicDoctor = useMemo(() => {
    if (!user?.email) return undefined;
    return doctors.find((d) => d.Email.toLowerCase() === user.email.toLowerCase());
  }, [doctors, user?.email]);

  const myAppointments = useMemo(() => {
    if (!clinicDoctor) return [];
    return appointments.filter((a) => a.PrimaryDoctorID === clinicDoctor.DoctorID);
  }, [appointments, clinicDoctor]);

  const treatedPatientIds = useMemo(() => {
    return new Set(myAppointments.map((a) => a.PatientID));
  }, [myAppointments]);

  const hasAccess = validId && treatedPatientIds.has(patientId);

  const {
    data: patient,
    isLoading: patientLoading,
    isError: patientError,
  } = useGetPatientByIdQuery(patientId, { skip: !hasAccess });

  const patientAppointments = useMemo(() => {
    if (!validId || !clinicDoctor) return [];
    return myAppointments
      .filter((a) => a.PatientID === patientId)
      .sort(
        (a, b) =>
          new Date(b.ScheduledDateTime).getTime() -
          new Date(a.ScheduledDateTime).getTime(),
      );
  }, [myAppointments, patientId, validId, clinicDoctor]);

  const loading = doctorsLoading || apptsLoading || (hasAccess && patientLoading);

  if (!validId) {
    return (
      <div className="space-y-4">
        <Link href="/doctor/patients" className="text-blue-600 hover:underline text-sm">
          {t('doctor.nav.backPatients')}
        </Link>
        <p className="text-red-600">{t('doctor.patientDetail.invalid')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <Link href="/doctor/patients" className="text-blue-600 hover:underline text-sm">
          {t('doctor.nav.backPatients')}
        </Link>
        <p className="mt-4 text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  if (!clinicDoctor) {
    return (
      <div>
        <Link href="/doctor/patients" className="text-blue-600 hover:underline text-sm">
          {t('doctor.nav.backPatients')}
        </Link>
        <p className="mt-4 text-amber-800">{t('doctor.detail.noClinicDoctor')}</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div>
        <Link href="/doctor/patients" className="text-blue-600 hover:underline text-sm">
          {t('doctor.nav.backPatients')}
        </Link>
        <p className="mt-4 text-amber-800">{t('doctor.patientDetail.noAccess')}</p>
      </div>
    );
  }

  const profileUnavailable = hasAccess && (patientError || !patient);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <Link href="/doctor/patients" className="text-blue-600 hover:underline text-sm">
          {t('doctor.nav.backPatients')}
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">
          {patient
            ? `${patient.FirstName} ${patient.LastName}`
            : t('doctor.patientNum', { id: patientId })}
        </h2>
        {patient ? (
          <p className="text-sm text-gray-600 mt-1">
            {[patient.ContactPhone, patient.Email].filter(Boolean).join(' · ') ||
              t('doctor.patientDetail.noContact')}
          </p>
        ) : null}
      </div>

      {profileUnavailable ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm">
          {t('doctor.patientDetail.demographicsMissing')}
        </div>
      ) : patient ? (
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            {t('doctor.patientDetail.chartTitle')}
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-gray-500">{t('doctor.patientDetail.dob')}</dt>
              <dd className="font-medium text-gray-900 mt-0.5">
                {formatDobDisplay(patient.DateOfBirth, intlLocale)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">{t('doctor.patientDetail.phone')}</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{patient.ContactPhone || '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-gray-500">{t('doctor.patientDetail.email')}</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{patient.Email || '—'}</dd>
            </div>
            {patient.Address ? (
              <div className="sm:col-span-2">
                <dt className="text-gray-500">{t('doctor.patientDetail.address')}</dt>
                <dd className="text-gray-900 mt-0.5">{patient.Address}</dd>
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <dt className="text-gray-500">{t('doctor.patientDetail.healthNotes')}</dt>
              <dd className="text-gray-800 mt-0.5 whitespace-pre-wrap">
                {patient.MedicalHistorySummary?.trim() || '—'}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            {t('doctor.patientDetail.visitsTitle', { count: patientAppointments.length })}
          </h3>
        </div>
        {patientAppointments.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">{t('doctor.patientDetail.noAppts')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium">{t('doctor.patientDetail.when')}</th>
                  <th className="px-4 py-3 font-medium">{t('doctor.patientDetail.purpose')}</th>
                  <th className="px-4 py-3 font-medium">{t('doctor.patientDetail.status')}</th>
                  <th className="px-4 py-3 font-medium text-right">{t('doctor.patientDetail.recorded')}</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {patientAppointments.map((a) => {
                  const when = new Date(a.ScheduledDateTime);
                  const rec = sumRecordedTreatmentTotal(a);
                  return (
                    <tr key={a.AppointmentID} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-gray-800">
                        {when.toLocaleString(intlLocale, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {a.AppointmentPurpose || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={appointmentStatusBadgeClass(a.Status)}>
                          {appointmentStatusT(t, a.Status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-800">
                        {rec > 0 ? money.format(rec) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/doctor/appointments/${a.AppointmentID}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          {t('doctor.patientDetail.open')}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
