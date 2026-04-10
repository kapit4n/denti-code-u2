'use client';

import { useState } from 'react';
import { useCreateAppointmentMutation } from '@/features/appointments/appointmentsApiSlice';
import { NEW_APPOINTMENT_STATUSES } from '@/lib/appointments/appointmentStatus';
import { appointmentStatusT } from '@/lib/appointments/appointmentStatusI18n';
import { useTranslation } from '@/i18n/I18nContext';
import type { AppointmentStatus, PatientProfile } from '@/types';

type Props = {
  open: boolean;
  onClose: () => void;
  doctorId: number;
  patients: PatientProfile[];
};

export default function CreateAppointmentModal({
  open,
  onClose,
  doctorId,
  patients,
}: Props) {
  const { t } = useTranslation();
  const [patientId, setPatientId] = useState('');
  const [scheduledLocal, setScheduledLocal] = useState('');
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<AppointmentStatus>('Scheduled');
  const [error, setError] = useState('');
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const pid = Number(patientId);
    if (!Number.isFinite(pid) || pid < 1) {
      setError(t('doctor.modal.errSelectPatient'));
      return;
    }
    if (!scheduledLocal) {
      setError(t('doctor.modal.errDateTime'));
      return;
    }
    const scheduledDateTime = new Date(scheduledLocal).toISOString();
    const durationMins = Math.max(1, parseInt(duration, 10) || 30);

    try {
      await createAppointment({
        PatientID: pid,
        PrimaryDoctorID: doctorId,
        ScheduledDateTime: scheduledDateTime,
        EstimatedDurationMinutes: durationMins,
        ...(purpose.trim() ? { AppointmentPurpose: purpose.trim() } : {}),
        Status: status,
        ...(notes.trim() ? { Notes: notes.trim() } : {}),
      }).unwrap();
      onClose();
      setPatientId('');
      setScheduledLocal('');
      setPurpose('');
      setDuration('30');
      setNotes('');
      setStatus('Scheduled');
    } catch {
      setError(t('doctor.modal.errCreate'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">{t('doctor.modal.bookTitle')}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
            aria-label={t('doctor.modal.close')}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {patients.length === 0 && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
              {t('doctor.modal.noPatients')}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="patient">
              {t('doctor.modal.patient')}
            </label>
            <select
              id="patient"
              required
              className="w-full border rounded-lg px-3 py-2 text-gray-800"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            >
              <option value="">{t('doctor.modal.selectPatient')}</option>
              {patients.map((p) => (
                <option key={p.PatientID} value={p.PatientID}>
                  {p.FirstName} {p.LastName} (ID {p.PatientID})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="appt-status">
              {t('doctor.modal.initialStatus')}
            </label>
            <select
              id="appt-status"
              className="w-full border rounded-lg px-3 py-2 text-gray-800"
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
            >
              {NEW_APPOINTMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {appointmentStatusT(t, s)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{t('doctor.modal.statusHint')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="when">
              {t('doctor.modal.dateTime')}
            </label>
            <input
              id="when"
              type="datetime-local"
              required
              className="w-full border rounded-lg px-3 py-2 text-gray-800"
              value={scheduledLocal}
              onChange={(e) => setScheduledLocal(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="duration">
              {t('doctor.modal.duration')}
            </label>
            <input
              id="duration"
              type="number"
              min={1}
              className="w-full border rounded-lg px-3 py-2 text-gray-800"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="purpose">
              {t('doctor.modal.purposeOptional')}
            </label>
            <input
              id="purpose"
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-gray-800"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder={t('doctor.modal.purposePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
              {t('doctor.modal.notesOptional')}
            </label>
            <textarea
              id="notes"
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-gray-800"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {t('doctor.modal.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || patients.length === 0}
              className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? t('common.saving') : t('doctor.modal.saveBook')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
