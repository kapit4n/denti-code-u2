'use client';

import { useState } from 'react';
import { useCreateAppointmentMutation } from '@/features/appointments/appointmentsApiSlice';
import type { PatientProfile } from '@/types';

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
  const [patientId, setPatientId] = useState('');
  const [scheduledLocal, setScheduledLocal] = useState('');
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const pid = Number(patientId);
    if (!Number.isFinite(pid) || pid < 1) {
      setError('Select a patient.');
      return;
    }
    if (!scheduledLocal) {
      setError('Choose date and time.');
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
        Status: 'Scheduled',
        ...(notes.trim() ? { Notes: notes.trim() } : {}),
      }).unwrap();
      onClose();
      setPatientId('');
      setScheduledLocal('');
      setPurpose('');
      setDuration('30');
      setNotes('');
    } catch {
      setError('Could not create appointment. Check inputs and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">New appointment</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {patients.length === 0 && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
              No patients loaded. Ensure the patients service is running and you have access to the
              patient list.
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="patient">
              Patient
            </label>
            <select
              id="patient"
              required
              className="w-full border rounded-lg px-3 py-2 text-gray-800"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            >
              <option value="">Select patient…</option>
              {patients.map((p) => (
                <option key={p.PatientID} value={p.PatientID}>
                  {p.FirstName} {p.LastName} (ID {p.PatientID})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="when">
              Date & time
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
              Duration (minutes)
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
              Purpose (optional)
            </label>
            <input
              id="purpose"
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-gray-800"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Cleaning, follow-up"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
              Notes (optional)
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || patients.length === 0}
              className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating…' : 'Create appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
