'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import {
  useGetAppointmentQuery,
  useRemovePerformedActionMutation,
  useUpdateAppointmentMutation,
} from '@/features/appointments/appointmentsApiSlice';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import {
  useGetProcedureTypesQuery,
  useGetTreatmentFacilitiesQuery,
} from '@/features/procedures/proceduresApiSlice';
import { useGetPatientsQuery } from '@/features/patients/patientsApiSlice';
import { APPOINTMENT_STATUSES } from '@/lib/appointments/appointmentStatus';
import { appointmentStatusT } from '@/lib/appointments/appointmentStatusI18n';
import { buildTreatmentFacilityGroupsFromApi } from '@/lib/doctor/buildTreatmentFacilityGroups';
import { TREATMENT_FACILITY_GROUPS } from '@/lib/doctor/treatmentFacilitiesCatalog';
import { parseFacilityIdsFromApi } from '@/lib/doctor/parseFacilitiesUsed';
import { useGetInventoryLinesQuery } from '@/features/inventory/inventoryApiSlice';
import { useTranslation } from '@/i18n/I18nContext';
import type { AppointmentStatus, PatientProfile, PerformedAction } from '@/types';
import AvatarThumb from '@/components/AvatarThumb';

function facilityItemLabel(
  t: (key: string, vars?: Record<string, string | number>) => string,
  id: string,
  apiDisplayName?: string,
): string {
  const key = `doctor.facilitiesCatalog.items.${id}`;
  const out = t(key);
  if (out !== key) return out;
  return apiDisplayName ?? id;
}

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
  const { data: apiTreatmentFacilities } = useGetTreatmentFacilitiesQuery();
  // Inventory is tracked per consultory. For now, doctor UI uses a single configured consultory (default 1).
  const inventoryConsultoryId = Number.parseInt(
    process.env.NEXT_PUBLIC_INVENTORY_CONSULTORY_ID ?? '1',
    10,
  );
  const { data: inventoryLines = [] } = useGetInventoryLinesQuery(
    Number.isFinite(inventoryConsultoryId) && inventoryConsultoryId > 0
      ? { consultoryId: inventoryConsultoryId }
      : undefined,
  );
  const { data: patientsRaw = [] } = useGetPatientsQuery();

  const facilityDisplayByCode = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of apiTreatmentFacilities ?? []) {
      m.set(f.FacilityCode, f.DisplayName);
    }
    return m;
  }, [apiTreatmentFacilities]);

  const facilityGroups = useMemo(() => {
    const fromApi = buildTreatmentFacilityGroupsFromApi(apiTreatmentFacilities);
    if (fromApi && fromApi.length > 0) return fromApi;
    return TREATMENT_FACILITY_GROUPS;
  }, [apiTreatmentFacilities]);

  const inventoryQtyByCode = useMemo(() => {
    const m = new Map<string, number>();
    for (const line of inventoryLines) {
      const code = line.facility?.FacilityCode;
      if (!code) continue;
      m.set(code, line.Quantity ?? 0);
    }
    return m;
  }, [inventoryLines]);

  const lowStockThreshold = 5;

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

  const [removeAction, { isLoading: isRemoving }] = useRemovePerformedActionMutation();
  const [updateAppointment, { isLoading: savingStatus }] = useUpdateAppointmentMutation();

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

      <section className="bg-white rounded-xl border-l-4 border-l-blue-500 border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="text-base font-semibold text-gray-900">{t('doctor.detail.patient')}</h3>
        </div>
        <div className="flex flex-wrap items-start gap-4 mb-4">
          {patient && (
            <AvatarThumb
              src={patient.AvatarUrl}
              name={`${patient.FirstName} ${patient.LastName}`}
              size="md"
            />
          )}
          <div className="min-w-0 flex-1">
            {patient ? (
              <>
                <Link
                  href={`/doctor/patients/${appointment.PatientID}`}
                  className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {patient.FirstName} {patient.LastName}
                </Link>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                  {patient.ContactPhone ? <span>{patient.ContactPhone}</span> : null}
                  {patient.Email ? <span>{patient.Email}</span> : null}
                  {patient.DateOfBirth ? (
                    <span>
                      {new Date(patient.DateOfBirth).toLocaleDateString(intlLocale, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="text-gray-900 font-medium">
                {t('doctor.detail.patientId', { id: appointment.PatientID })}
              </p>
            )}
          </div>
          {patient && (
            <Link
              href={`/doctor/patients/${appointment.PatientID}#patient-edit`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline shrink-0"
            >
              {t('doctor.patients.edit')}
            </Link>
          )}
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm border-t border-gray-100 pt-4">
          <div>
            <dt className="text-gray-500">{t('doctor.detail.scheduled')}</dt>
            <dd className="font-medium text-gray-900">
              {when.toLocaleString(intlLocale, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </dd>
          </div>
          <div>
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
              {appointment.AppointmentPurpose || t('common.emptyValue')}
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

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gray-100 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {t('doctor.detail.treatmentsTitle')}
          </span>
        </div>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
          <h3 className="text-base font-semibold text-gray-900">
            {t('doctor.detail.treatmentsTitle')}
          </h3>
          <div className="flex items-center gap-3">
            <Link
              href={`/doctor/appointments/${appointmentId}/add-treatment`}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 px-4 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('doctor.detail.addTreatmentTitle')}
            </Link>
            <p className="text-lg font-bold text-gray-900">
              {t('doctor.detail.total', { amount: money.format(totalCost) })}
            </p>
          </div>
        </div>
        {actions.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">{t('doctor.detail.noTreatments')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium">{t('doctor.detail.thProcedure')}</th>
                  <th className="px-4 py-3 font-medium min-w-[220px]">
                    {t('doctor.detail.thDetails')}
                  </th>
                  <th className="px-4 py-3 font-medium text-right">{t('doctor.detail.thQty')}</th>
                  <th className="px-4 py-3 font-medium text-right">{t('doctor.detail.thUnit')}</th>
                  <th className="px-4 py-3 font-medium text-right">{t('doctor.detail.thLineTotal')}</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {actions.map((a) => {
                  const proc = procedureById.get(a.ProcedureTypeID);
                  const facilityIds = parseFacilityIdsFromApi(a.FacilitiesUsed);
                  const hasDetails =
                    Boolean(a.SurfacesInvolved) ||
                    Boolean(a.AnesthesiaUsed) ||
                    facilityIds.length > 0 ||
                    Boolean(a.Description_Notes);
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
                      <td className="px-4 py-3 text-gray-700 max-w-md align-top">
                        {a.SurfacesInvolved ? (
                          <div className="text-xs">
                            <span className="text-gray-500 font-medium">
                              {t('doctor.detail.surfacesShort')}:{' '}
                            </span>
                            {a.SurfacesInvolved}
                          </div>
                        ) : null}
                        {a.AnesthesiaUsed ? (
                          <div className={`text-xs ${a.SurfacesInvolved ? 'mt-1' : ''}`}>
                            <span className="text-gray-500 font-medium">
                              {t('doctor.detail.anesthesiaShort')}:{' '}
                            </span>
                            {a.AnesthesiaUsed}
                          </div>
                        ) : null}
                        {facilityIds.length > 0 ? (
                          <div className="mt-2">
                            <span className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                              {t('doctor.detail.facilitiesShort')}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {facilityIds.map((fid) => (
                                <span
                                  key={fid}
                                  className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200"
                                >
                                  {facilityItemLabel(t, fid, facilityDisplayByCode.get(fid))}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        {a.Description_Notes ? (
                          <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                            {a.Description_Notes}
                          </p>
                        ) : null}
                        {!hasDetails ? (
                          <span className="text-gray-400">{t('common.emptyValue')}</span>
                        ) : null}
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


    </div>
  );
}
