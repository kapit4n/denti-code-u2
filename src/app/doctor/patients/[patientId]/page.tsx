'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import { useGetPatientByIdQuery } from '@/features/patients/patientsApiSlice';
import { useCreatePaymentMutation, useGetPatientPaymentsQuery } from '@/features/payments/paymentsApiSlice';
import { appointmentStatusBadgeClass } from '@/lib/appointments/appointmentStatus';
import { appointmentStatusT } from '@/lib/appointments/appointmentStatusI18n';
import { sumCompletedConsultationCharges, sumRecordedTreatmentTotal } from '@/lib/patient/appointmentCost';
import { useTranslation } from '@/i18n/I18nContext';
import EditPatientForm from '@/components/patients/EditPatientForm';
import type { CreatePaymentInput, PaymentMethod } from '@/types';

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

  const [editing, setEditing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [paymentFlash, setPaymentFlash] = useState<string | null>(null);

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

  const {
    data: payments = [],
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useGetPatientPaymentsQuery(patientId, { skip: !hasAccess });
  const [createPayment, { isLoading: creatingPayment }] = useCreatePaymentMutation();

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash !== '#patient-edit') return;
    setEditing(true);
    const node = document.getElementById('patient-edit');
    node?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [patient?.PatientID]);

  const profileUnavailable = hasAccess && (patientError || !patient);

  const paymentsSorted = useMemo(() => {
    return [...payments].sort(
      (a, b) => new Date(b.PaidAt).getTime() - new Date(a.PaidAt).getTime(),
    );
  }, [payments]);

  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + (Number.isFinite(p.Amount) ? p.Amount : 0), 0);
  }, [payments]);

  const billedCompletedVisits = useMemo(
    () => sumCompletedConsultationCharges(patientAppointments),
    [patientAppointments],
  );

  /** Positive = patient still owes; negative = overpaid / credit. */
  const balanceAfterPayments = useMemo(() => {
    return billedCompletedVisits - totalPaid;
  }, [billedCompletedVisits, totalPaid]);

  async function handleRegisterPayment(e: FormEvent) {
    e.preventDefault();
    setPaymentFlash(null);

    const amount = Number.parseFloat(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentFlash(t('doctor.patientDetail.paymentInvalidAmount'));
      return;
    }

    const payload: CreatePaymentInput = {
      PatientID: patientId,
      Amount: amount,
      Method: paymentMethod,
      Note: paymentNote.trim() ? paymentNote.trim() : undefined,
      PaidAt: paymentDate ? new Date(`${paymentDate}T12:00:00`).toISOString() : undefined,
    };

    try {
      await createPayment(payload).unwrap();
      setPaymentAmount('');
      setPaymentNote('');
      setPaymentFlash(t('doctor.patientDetail.paymentSaved'));
    } catch {
      setPaymentFlash(t('doctor.patientDetail.paymentSaveFailed'));
    }
  }

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

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="space-y-2">
        <Link href="/doctor/patients" className="text-blue-600 hover:underline text-sm">
          {t('doctor.nav.backPatients')}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
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
          {patient ? (
            <div className="shrink-0 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  const node = document.getElementById('patient-edit');
                  node?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                {t('doctor.patients.edit')}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {profileUnavailable ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm">
          {t('doctor.patientDetail.demographicsMissing')}
        </div>
      ) : null}

      {patient ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">
                  {t('doctor.patientDetail.infoTitle')}
                </h3>
              </div>
              <div className="p-5">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">{t('doctor.patientDetail.dob')}</dt>
                    <dd className="text-gray-900">
                      {new Date(patient.DateOfBirth).toLocaleDateString(intlLocale, {
                        dateStyle: 'medium',
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">{t('doctor.patientDetail.gender')}</dt>
                    <dd className="text-gray-900">{patient.Gender || '—'}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500">{t('doctor.patientDetail.address')}</dt>
                    <dd className="text-gray-900">{patient.Address || '—'}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500">{t('doctor.patientDetail.history')}</dt>
                    <dd className="text-gray-900 whitespace-pre-wrap">
                      {patient.MedicalHistorySummary || '—'}
                    </dd>
                  </div>
                </dl>

                {editing ? (
                  <div id="patient-edit" className="mt-5 pt-5 border-t border-gray-100">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {t('doctor.patientDetail.editTitle')}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="text-sm font-medium text-gray-600 hover:text-gray-800"
                      >
                        {t('common.close')}
                      </button>
                    </div>
                    <EditPatientForm patient={patient} variant="doctor" />
                  </div>
                ) : null}
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-gray-900">
                  {t('doctor.patientDetail.paymentsTitle', { count: payments.length })}
                </h3>
                <div className="text-sm text-gray-600 tabular-nums">
                  {t('doctor.patientDetail.paymentsTotal')}: <span className="text-gray-900 font-medium">{money.format(totalPaid)}</span>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t('doctor.patientDetail.financialSummaryTitle')}
                  </p>
                  <div className="flex justify-between gap-4 tabular-nums">
                    <span className="text-gray-600">{t('doctor.patientDetail.billedCompletedVisits')}</span>
                    <span className="font-medium text-gray-900">{money.format(billedCompletedVisits)}</span>
                  </div>
                  <div className="flex justify-between gap-4 tabular-nums">
                    <span className="text-gray-600">{t('doctor.patientDetail.paymentsReceived')}</span>
                    <span className="font-medium text-gray-900">{money.format(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between gap-4 pt-2 border-t border-gray-200 tabular-nums items-baseline">
                    <span className="font-medium text-gray-900">{t('doctor.patientDetail.balanceLabel')}</span>
                    {balanceAfterPayments > 0 ? (
                      <span className="font-semibold text-amber-800">
                        {t('doctor.patientDetail.balanceOwes', { amount: money.format(balanceAfterPayments) })}
                      </span>
                    ) : balanceAfterPayments < 0 ? (
                      <span className="font-semibold text-emerald-700">
                        {t('doctor.patientDetail.balanceCredit', { amount: money.format(-balanceAfterPayments) })}
                      </span>
                    ) : (
                      <span className="font-semibold text-gray-700">{t('doctor.patientDetail.balanceSettled')}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">
                    {t('doctor.patientDetail.financialSummaryHint')}
                  </p>
                </div>

                <form onSubmit={handleRegisterPayment} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="block text-xs font-medium text-gray-600 mb-1">
                        {t('doctor.patientDetail.paymentAmount')}
                      </span>
                      <input
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        inputMode="decimal"
                        placeholder="0.00"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-medium text-gray-600 mb-1">
                        {t('doctor.patientDetail.paymentMethod')}
                      </span>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {(['Cash', 'Card', 'Transfer', 'Insurance', 'Other'] as const).map((m) => (
                          <option key={m} value={m}>
                            {t(`doctor.patientDetail.paymentMethod_${m}`)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="block text-xs font-medium text-gray-600 mb-1">
                        {t('doctor.patientDetail.paymentDate')}
                      </span>
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    <label className="block sm:col-span-1">
                      <span className="block text-xs font-medium text-gray-600 mb-1">
                        {t('doctor.patientDetail.paymentNote')}
                      </span>
                      <input
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        placeholder={t('doctor.patientDetail.paymentNotePlaceholder')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  {paymentFlash ? (
                    <p className="text-sm text-gray-700">{paymentFlash}</p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={creatingPayment}
                    className="w-full sm:w-auto px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {creatingPayment ? t('common.saving') : t('doctor.patientDetail.paymentRegister')}
                  </button>
                </form>

                <div className="border-t border-gray-100 pt-4">
                  {paymentsLoading ? (
                    <p className="text-sm text-gray-500">{t('common.loading')}</p>
                  ) : paymentsError ? (
                    <p className="text-sm text-amber-800">{t('doctor.patientDetail.paymentsLoadFailed')}</p>
                  ) : paymentsSorted.length === 0 ? (
                    <p className="text-sm text-gray-500">{t('doctor.patientDetail.noPayments')}</p>
                  ) : (
                    <ul className="space-y-2">
                      {paymentsSorted.map((p) => {
                        const when = new Date(p.PaidAt);
                        return (
                          <li
                            key={p.PaymentID}
                            className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">{money.format(p.Amount)}</span>{' '}
                                <span className="text-gray-600">
                                  · {p.Method ? t(`doctor.patientDetail.paymentMethod_${p.Method}`) : t('doctor.patientDetail.paymentMethodUnknown')}
                                </span>
                              </p>
                              <p className="text-xs text-gray-500">
                                {when.toLocaleString(intlLocale, { dateStyle: 'medium', timeStyle: 'short' })}
                                {p.Note ? ` · ${p.Note}` : ''}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-8">
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
                        <th className="px-4 py-3 font-medium text-right">
                          {t('doctor.patientDetail.recorded')}
                        </th>
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
                            <td className="px-4 py-3 text-gray-700">{a.AppointmentPurpose || '—'}</td>
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
        </div>
      ) : null}
    </div>
  );
}
