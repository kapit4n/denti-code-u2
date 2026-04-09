'use client';

import { useState } from 'react';
import { useUpdateAppointmentMutation } from '@/features/appointments/appointmentsApiSlice';
import {
  appointmentStatusBadgeClass,
  appointmentStatusLabel,
} from '@/lib/appointments/appointmentStatus';
import {
  patientCanAccept,
  patientCanCancel,
  patientCanReschedule,
} from '@/lib/appointments/patientAppointmentActions';
import { sumRecordedTreatmentTotal } from '@/lib/patient/appointmentCost';
import type { Appointment } from '@/types';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

interface AppointmentCardProps {
  appointment: Appointment;
  isPast?: boolean;
  /** When true, show confirm / cancel / reschedule wired to the API (patient portal). */
  patientActions?: boolean;
  /** Deep-link anchor for scrolling from another page (e.g. profile). */
  anchorId?: boolean;
  /** Primary dentist name, e.g. from clinic directory */
  doctorLabel?: string;
  /** Tighter layout for dashboard previews */
  compact?: boolean;
  /** Show recorded treatment total when available */
  showCost?: boolean;
}

function formatError(err: unknown): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { message?: string } }).data;
    if (data?.message && typeof data.message === 'string') return data.message;
  }
  return 'Something went wrong. Please try again.';
}

export default function AppointmentCard({
  appointment,
  isPast = false,
  patientActions = false,
  anchorId = true,
  doctorLabel,
  compact = false,
  showCost = false,
}: AppointmentCardProps) {
  const [updateAppointment, { isLoading }] = useUpdateAppointmentMutation();
  const [actionError, setActionError] = useState('');
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleLocal, setRescheduleLocal] = useState('');

  const appointmentDate = new Date(appointment.ScheduledDateTime);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const now = new Date();
  const isUpcoming = appointmentDate >= now;

  const showAccept = patientActions && patientCanAccept(appointment.Status, isUpcoming);
  const showReschedule =
    patientActions && patientCanReschedule(appointment.Status, isUpcoming);
  const showCancel = patientActions && patientCanCancel(appointment.Status);

  const openReschedule = () => {
    setActionError('');
    const d = new Date(appointment.ScheduledDateTime);
    const pad = (n: number) => String(n).padStart(2, '0');
    const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setRescheduleLocal(local);
    setRescheduleOpen(true);
  };

  const handleAccept = async () => {
    setActionError('');
    try {
      await updateAppointment({
        id: appointment.AppointmentID,
        body: { Status: 'Confirmed' },
      }).unwrap();
    } catch (e) {
      setActionError(formatError(e));
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this appointment? The clinic will see it as cancelled.')) {
      return;
    }
    setActionError('');
    try {
      await updateAppointment({
        id: appointment.AppointmentID,
        body: { Status: 'Cancelled' },
      }).unwrap();
    } catch (e) {
      setActionError(formatError(e));
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    if (!rescheduleLocal) {
      setActionError('Choose a new date and time.');
      return;
    }
    const next = new Date(rescheduleLocal);
    if (Number.isNaN(next.getTime()) || next.getTime() <= Date.now()) {
      setActionError('Pick a future date and time.');
      return;
    }
    try {
      await updateAppointment({
        id: appointment.AppointmentID,
        body: {
          ScheduledDateTime: next.toISOString(),
          Status: 'Scheduled',
        },
      }).unwrap();
      setRescheduleOpen(false);
    } catch (err) {
      setActionError(formatError(err));
    }
  };

  const minLocal = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  })();

  const recordedTotal = sumRecordedTreatmentTotal(appointment);
  const padClass = compact ? 'p-4' : 'p-5';
  const titleClass = compact ? 'text-base font-bold text-gray-800' : 'text-lg font-bold text-gray-800';

  return (
    <div
      id={anchorId ? `patient-appt-${appointment.AppointmentID}` : undefined}
      className={`bg-white ${padClass} rounded-lg shadow-md border-l-4 ${
        isPast ? 'border-gray-400 opacity-75' : 'border-blue-500'
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <p className={titleClass}>
            {appointment.AppointmentPurpose || 'Appointment'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            <span className={appointmentStatusBadgeClass(appointment.Status)}>
              {appointmentStatusLabel(appointment.Status)}
            </span>
          </p>
          {doctorLabel ? (
            <p className="text-sm text-gray-700 mt-2">
              <span className="text-gray-500">Dentist: </span>
              {doctorLabel}
            </p>
          ) : null}
          {showCost ? (
            <p className="text-sm text-gray-600 mt-1.5">
              {recordedTotal > 0 ? (
                <>
                  <span className="text-gray-500">Recorded treatments: </span>
                  <span className="font-semibold tabular-nums">{money.format(recordedTotal)}</span>
                </>
              ) : (
                <span className="text-gray-500">
                  {isPast
                    ? 'No treatments recorded for this visit.'
                    : 'Costs appear after your visit when the clinic posts treatments.'}
                </span>
              )}
            </p>
          ) : null}
        </div>
        <div className="text-right shrink-0">
          <p className="text-md font-semibold text-gray-700">{formattedDate}</p>
          <p className="text-md text-gray-600">{formattedTime}</p>
          {!compact && (
            <p className="text-xs text-gray-400 mt-1">#{appointment.AppointmentID}</p>
          )}
        </div>
      </div>

      {patientActions && (showAccept || showReschedule || showCancel) && (
        <div
          className={`border-t border-gray-200 space-y-3 ${compact ? 'mt-3 pt-3' : 'mt-4 pt-4'}`}
        >
          {!compact && (
            <p className="text-xs text-gray-500">
              Accept confirms your attendance. Reschedule picks a new time (may need clinic
              confirmation). Cancel marks the visit as cancelled.
            </p>
          )}
          {compact && (
            <p className="text-xs text-gray-500">Accept, reschedule, or cancel this visit.</p>
          )}
          <div className="flex flex-wrap gap-2">
            {showAccept && (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleAccept}
                className="bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Accept
              </button>
            )}
            {showReschedule && (
              <button
                type="button"
                disabled={isLoading}
                onClick={openReschedule}
                className="bg-gray-100 text-gray-900 text-sm font-semibold py-2 px-3 rounded-lg border border-gray-200 hover:bg-gray-200 disabled:opacity-50"
              >
                Reschedule
              </button>
            )}
            {showCancel && (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleCancel}
                className="bg-white text-red-700 text-sm font-semibold py-2 px-3 rounded-lg border border-red-200 hover:bg-red-50 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
          {actionError && <p className="text-sm text-red-600">{actionError}</p>}
        </div>
      )}

      {rescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h4 className="text-lg font-semibold text-gray-900">Reschedule appointment</h4>
            <p className="text-sm text-gray-600 mt-1">
              Choose a new date and time. Status will return to &quot;Scheduled&quot; until the
              clinic confirms.
            </p>
            <form onSubmit={handleRescheduleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rs">
                  New date &amp; time
                </label>
                <input
                  id="rs"
                  type="datetime-local"
                  required
                  min={minLocal}
                  className="w-full border rounded-lg px-3 py-2 text-gray-900"
                  value={rescheduleLocal}
                  onChange={(e) => setRescheduleLocal(e.target.value)}
                />
              </div>
              {actionError && <p className="text-sm text-red-600">{actionError}</p>}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setRescheduleOpen(false);
                    setActionError('');
                  }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving…' : 'Save new time'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
