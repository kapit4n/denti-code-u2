import type { AppointmentStatus } from '@/types';

const KEYS: Record<AppointmentStatus, string> = {
  Scheduled: 'appointmentStatus.scheduled',
  Confirmed: 'appointmentStatus.confirmed',
  InProgress: 'appointmentStatus.inProgress',
  Completed: 'appointmentStatus.completed',
  Cancelled: 'appointmentStatus.cancelled',
  NoShow: 'appointmentStatus.noShow',
  Rescheduled: 'appointmentStatus.rescheduled',
};

export function appointmentStatusT(
  t: (key: string, vars?: Record<string, string | number>) => string,
  status: AppointmentStatus,
): string {
  return t(KEYS[status]);
}
