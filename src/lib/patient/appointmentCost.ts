import type { Appointment } from '@/types';

export function sumRecordedTreatmentTotal(appointment: Appointment): number {
  return appointment.performedActions?.reduce((s, a) => s + a.TotalPrice, 0) ?? 0;
}

/** Sum of recorded treatment amounts for visits in Completed status (same scope as the visits list). */
export function sumCompletedConsultationCharges(appointments: Appointment[]): number {
  return appointments
    .filter((a) => a.Status === 'Completed')
    .reduce((sum, a) => sum + sumRecordedTreatmentTotal(a), 0);
}
