import type { Appointment } from '@/types';

export function sumRecordedTreatmentTotal(appointment: Appointment): number {
  return appointment.performedActions?.reduce((s, a) => s + a.TotalPrice, 0) ?? 0;
}
