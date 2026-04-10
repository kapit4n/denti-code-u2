'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import {
  useGetAppointmentQuery,
  useAddPerformedActionMutation,
  useRemovePerformedActionMutation,
  useUpdateAppointmentMutation,
} from '@/features/appointments/appointmentsApiSlice';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import { useGetProcedureTypesQuery } from '@/features/procedures/proceduresApiSlice';
import { useGetPatientsQuery } from '@/features/patients/patientsApiSlice';
import { APPOINTMENT_STATUSES } from '@/lib/appointments/appointmentStatus';
import { appointmentStatusT } from '@/lib/appointments/appointmentStatusI18n';
import { useTranslation } from '@/i18n/I18nContext';
import type { AppointmentStatus, PatientProfile, PerformedAction } from '@/types';

export default function DoctorAppointmentDetailPage() {
  const { t, intlLocale } = useTranslation();
  const money = useMemo(
    () =>
      new Intl.NumberFormat(intlLocale, {
        style: 'currency',
        currency: 'USD',
      }),
    [intlLocale],
  );
  const params = useParams();
  const rawId = params?.appointmentId;
  const appointmentId =
    typeof rawId === 'string' ? Number.parseInt(rawId, 10) : Number.NaN;
  const validId = Number.isFinite(appointmentId) && appointmentId > 0;

  const user = useAppSelector(selectCurrentUser);
  const { data: doctors = [] } = useGetDoctorsQuery();
  const { data: procedures = [] } = useGetProcedureTypesQuery();
  const { data: patientsRaw = [] } = useGetPatientsQuery();

  const clinicDoctor = useMemo(() => {
    if (!user?.email) return undefined;
    return doctors.find((d) => d.Email.toLowerCase() === user.email.toLowerCase());
  }, [doctors, user?.email]);

  const {
    data: appointment,
    isLoading,
    isError,
    error,
  } = useGetAppointmentQuery(appointmentId, { skip: !validId });

  const [addAction, { isLoading: adding }] = useAddPerformedActionMutation();
  const [removeAction, { isLoading: isRemoving }] = useRemovePerformedActionMutation();
  const [updateAppointment, { isLoading: savingStatus }] = useUpdateAppointmentMutation();

  const [procedureTypeId, setProcedureTypeId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [tooth, setTooth] = useState('');
  const [formError, setFormError] = useState('');
  const [statusDraft, setStatusDraft] = useState<AppointmentStatus>('Scheduled');
  const [statusError, setStatusError] = useState('');

  const patients = useMemo((): PatientProfile[] => {
    return (patientsRaw as PatientProfile[]).filter(
      (p) => p && typeof p.PatientID === 'number',
    );
  }, [patientsRaw]);

  const patient = appointment
    ? patients.find((p) => p.PatientID === appointment.PatientID)
    : undefined;

  const procedureById = useMemo(() => {
    const m = new Map<number, (typeof procedures)[0]>();
    for (const p of procedures) {
      m.set(p.ProcedureTypeID, p);
    }
    return m;
  }, [procedures]);

  useEffect(() => {
    if (appointment) setStatusDraft(appointment.Status);
  }, [appointment?.AppointmentID, appointment?.Status]);

  const actions: PerformedAction[] = appointment?.performedActions ?? [];
  const totalCost = useMemo(
    () => actions.reduce((sum, a) => sum + a.TotalPrice, 0),
    [actions],
  );

  const onProcedureChange = (value: string) => {
    setProcedureTypeId(value);
    const id = Number.parseInt(value, 10);
    const proc = procedureById.get(id);
    if (proc?.StandardPrice != null) {
      setUnitPrice(String(proc.StandardPrice));
    } else if (value === '') {
      setUnitPrice('');
    }
  };

  const handleAddTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!clinicDoctor || !appointment) return;

    const procId = Number.parseInt(procedureTypeId, 10);
    if (!Number.isFinite(procId)) {
      setFormError(t('doctor.detail.errProcedure'));
      return;
    }
    const qty = Math.max(1, Number.parseInt(quantity, 10) || 1);
    const price = Number.parseFloat(unitPrice);
    if (!Number.isFinite(price) || price < 0) {
      setFormError(t('doctor.detail.errPrice'));
      return;
    }

    try {
      await addAction({
        appointmentId: appointment.AppointmentID,
        body: {
          ProcedureTypeID: procId,
          PerformingDoctorID: clinicDoctor.DoctorID,
          Quantity: qty,
          UnitPrice: price,
          ...(notes.trim() ? { Description_Notes: notes.trim() } : {}),
          ...(tooth.trim() ? { ToothInvolved: tooth.trim() } : {}),
        },
      }).unwrap();
      setProcedureTypeId('');
      setQuantity('1');
      setUnitPrice('');
      setNotes('');
      setTooth('');
    } catch {
      setFormError(t('doctor.detail.errSaveTreatment'));
    }
  };

  const handleSaveStatus = async () => {
    if (!appointment) return;
    setStatusError('');
    if (statusDraft === appointment.Status) return;
    try {
      await updateAppointment({
        id: appointment.AppointmentID,
        body: { Status: statusDraft },
      }).unwrap();
    } catch {
      setStatusError(t('doctor.detail.statusErr'));
    }
  };

  const handleRemove = async (action: PerformedAction) => {
    if (!appointment) return;
    if (!window.confirm(t('doctor.detail.confirmRemove'))) return;
    try {
      await removeAction({
        actionId: action.PerformedActionID,
        appointmentId: appointment.AppointmentID,
      }).unwrap();
    } catch {
      /* ignore */
    }
  };

  if (!validId) {
    return (
      <div className="space-y-4">
        <Link href="/doctor/appointments" className="text-blue-600 hover:underline text-sm">
          {t('doctor.nav.backVisits')}
        </Link>
        <p className="text-red-600">{t('doctor.detail.invalidAppt')}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <Link href="/doctor/appointments" className="text-blue-600 hover:underline text-sm">
          {t('doctor.nav.backVisits')}
        </Link>
        <p className="mt-4 text-gray-500">{t('doctor.detail.loadingAppt')}</p>
      </div>
    );
  }

  if (isError || !appointment) {
    return (
      <div>
        <Link href="/doctor/appointments" className="text-blue-600 hover:underline text-sm">
          {t('doctor.nav.backVisits')}
        </Link>
        <p className="mt-4 text-red-600">
          {t('doctor.detail.loadApptError')}
          {error && 'data' in error && (error.data as { message?: string })?.message
            ? ` ${(error.data as { message?: string }).message}`
            : ''}
        </p>
      </div>
    );
  }

  if (!clinicDoctor) {
    return (
      <div>
        <Link href="/doctor/appointments" className="text-blue-600 hover:underline text-sm">
          {t('doctor.nav.backVisits')}
        </Link>
        <p className="mt-4 text-amber-800">{t('doctor.detail.noClinicDoctor')}</p>
      </div>
    );
  }

  if (appointment.PrimaryDoctorID !== clinicDoctor.DoctorID) {
    return (
      <div>
        <Link href="/doctor/appointments" className="text-blue-600 hover:underline text-sm">
          {t('doctor.nav.backVisits')}
        </Link>
        <p className="mt-4 text-amber-800">{t('doctor.detail.wrongPrimary')}</p>
      </div>
    );
  }

  const when = new Date(appointment.ScheduledDateTime);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/doctor/appointments" className="text-blue-600 hover:underline text-sm">
          {t('doctor.nav.backVisits')}
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">{t('doctor.detail.visitTitle')}</h2>
        <p className="text-gray-500 text-xs mt-1">
          {t('doctor.detail.ref', { id: appointment.AppointmentID })}
        </p>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">{t('doctor.detail.summary')}</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">{t('doctor.detail.patient')}</dt>
            <dd className="font-medium text-gray-900 mt-0.5">
              {patient ? (
                <Link
                  href={`/doctor/patients/${appointment.PatientID}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {patient.FirstName} {patient.LastName}
                </Link>
              ) : (
                t('doctor.detail.patientId', { id: appointment.PatientID })
              )}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">{t('doctor.detail.scheduled')}</dt>
            <dd className="font-medium text-gray-900">
              {when.toLocaleString(intlLocale, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-gray-500 mb-2">{t('doctor.detail.status')}</dt>
            <dd className="flex flex-wrap items-center gap-3">
              <select
                className="border rounded-lg px-3 py-2 text-sm text-gray-900 min-w-[200px]"
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value as AppointmentStatus)}
                aria-label={t('doctor.detail.statusAria')}
              >
                {APPOINTMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {appointmentStatusT(t, s)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={savingStatus || statusDraft === appointment.Status}
                className="text-sm font-medium py-2 px-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40"
              >
                {savingStatus ? t('doctor.detail.saving') : t('doctor.detail.saveStatus')}
              </button>
            </dd>
            {statusError ? <p className="text-sm text-red-600 mt-2">{statusError}</p> : null}
            <p className="text-xs text-gray-500 mt-2">{t('doctor.detail.statusFlowHint')}</p>
          </div>
          <div>
            <dt className="text-gray-500">{t('doctor.detail.purpose')}</dt>
            <dd className="font-medium text-gray-900">
              {appointment.AppointmentPurpose || '—'}
            </dd>
          </div>
          {appointment.Notes ? (
            <div className="sm:col-span-2">
              <dt className="text-gray-500">{t('doctor.detail.apptNotes')}</dt>
              <dd className="text-gray-800">{appointment.Notes}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
          <h3 className="text-base font-semibold text-gray-900">
            {t('doctor.detail.treatmentsTitle')}
          </h3>
          <p className="text-lg font-bold text-gray-900">
            {t('doctor.detail.total', { amount: money.format(totalCost) })}
          </p>
        </div>
        {actions.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">{t('doctor.detail.noTreatments')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium">{t('doctor.detail.thProcedure')}</th>
                  <th className="px-4 py-3 font-medium">{t('doctor.detail.thNotes')}</th>
                  <th className="px-4 py-3 font-medium text-right">{t('doctor.detail.thQty')}</th>
                  <th className="px-4 py-3 font-medium text-right">{t('doctor.detail.thUnit')}</th>
                  <th className="px-4 py-3 font-medium text-right">{t('doctor.detail.thLineTotal')}</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {actions.map((a) => {
                  const proc = procedureById.get(a.ProcedureTypeID);
                  return (
                    <tr key={a.PerformedActionID} className="border-b border-gray-100">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {proc?.ProcedureName ??
                            t('doctor.detail.procedureNum', { id: a.ProcedureTypeID })}
                        </div>
                        {a.ToothInvolved ? (
                          <div className="text-xs text-gray-500">
                            {t('doctor.detail.toothLabel', { tooth: a.ToothInvolved })}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                        {a.Description_Notes || '—'}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{a.Quantity}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {money.format(a.UnitPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {money.format(a.TotalPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleRemove(a)}
                          disabled={isRemoving}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          {t('doctor.detail.remove')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          {t('doctor.detail.addTreatmentTitle')}
        </h3>
        <form onSubmit={handleAddTreatment} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="proc">
              {t('doctor.detail.procedure')}
            </label>
            <select
              id="proc"
              className="w-full border rounded-lg px-3 py-2 text-gray-900"
              value={procedureTypeId}
              onChange={(e) => onProcedureChange(e.target.value)}
              required
            >
              <option value="">{t('doctor.detail.selectProcedure')}</option>
              {procedures
                .filter((p) => p.IsActive !== false)
                .map((p) => (
                  <option key={p.ProcedureTypeID} value={p.ProcedureTypeID}>
                    {p.ProcedureName}
                    {p.StandardPrice != null ? ` — ${money.format(p.StandardPrice)}` : ''}
                  </option>
                ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="qty">
                {t('doctor.detail.quantity')}
              </label>
              <input
                id="qty"
                type="number"
                min={1}
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price">
                {t('doctor.detail.unitPrice')}
              </label>
              <input
                id="price"
                type="number"
                min={0}
                step="0.01"
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tooth">
              {t('doctor.detail.toothOptional')}
            </label>
            <input
              id="tooth"
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-gray-900"
              value={tooth}
              onChange={(e) => setTooth(e.target.value)}
              placeholder={t('doctor.detail.toothPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tnotes">
              {t('doctor.detail.clinicalNotes')}
            </label>
            <textarea
              id="tnotes"
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-gray-900"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <button
            type="submit"
            disabled={adding || procedures.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {adding ? t('doctor.detail.saving') : t('doctor.detail.addTreatment')}
          </button>
        </form>
      </section>
    </div>
  );
}
