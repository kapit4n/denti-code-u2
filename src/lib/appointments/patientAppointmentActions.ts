import type { AppointmentStatus } from '@/types';

export function patientCanAccept(status: AppointmentStatus, isUpcoming: boolean): boolean {
  return isUpcoming && (status === 'Scheduled' || status === 'Rescheduled');
}

export function patientCanReschedule(
  status: AppointmentStatus,
  isUpcoming: boolean,
): boolean {
  return isUpcoming && ['Scheduled', 'Confirmed', 'Rescheduled'].includes(status);
}

export function patientCanCancel(status: AppointmentStatus): boolean {
  return !['Completed', 'Cancelled', 'NoShow'].includes(status);
}
