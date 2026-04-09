import type { AppointmentStatus } from '@/types';

export const APPOINTMENT_STATUSES: readonly AppointmentStatus[] = [
  'Scheduled',
  'Confirmed',
  'InProgress',
  'Completed',
  'Cancelled',
  'NoShow',
  'Rescheduled',
] as const;

/** Statuses suitable when booking a new visit */
export const NEW_APPOINTMENT_STATUSES: readonly AppointmentStatus[] = [
  'Scheduled',
  'Confirmed',
] as const;

export function appointmentStatusLabel(status: AppointmentStatus): string {
  const labels: Record<AppointmentStatus, string> = {
    Scheduled: 'Scheduled',
    Confirmed: 'Confirmed',
    InProgress: 'In progress',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
    NoShow: 'No-show',
    Rescheduled: 'Rescheduled',
  };
  return labels[status];
}

/** Tailwind classes for a compact status pill */
export function appointmentStatusBadgeClass(status: AppointmentStatus): string {
  const base = 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium';
  const byStatus: Record<AppointmentStatus, string> = {
    Scheduled: 'bg-slate-100 text-slate-800',
    Confirmed: 'bg-sky-100 text-sky-900',
    InProgress: 'bg-amber-100 text-amber-900',
    Completed: 'bg-emerald-100 text-emerald-900',
    Cancelled: 'bg-red-100 text-red-800',
    NoShow: 'bg-orange-100 text-orange-900',
    Rescheduled: 'bg-violet-100 text-violet-900',
  };
  return `${base} ${byStatus[status]}`;
}

export function isAppointmentPending(status: AppointmentStatus): boolean {
  return (
    status === 'Scheduled' ||
    status === 'Confirmed' ||
    status === 'InProgress' ||
    status === 'Rescheduled'
  );
}
