import { isAppointmentPending } from '@/lib/appointments/appointmentStatus';
import type { Appointment } from '@/types';

export type DashboardPeriod = 'day' | 'month' | 'year';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function getPeriodRange(
  period: DashboardPeriod,
  anchor: Date,
): { start: Date; end: Date; label: string } {
  if (period === 'day') {
    return {
      start: startOfDay(anchor),
      end: endOfDay(anchor),
      label: anchor.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  }
  if (period === 'month') {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999);
    return {
      start,
      end,
      label: anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  }
  const start = new Date(anchor.getFullYear(), 0, 1);
  const end = new Date(anchor.getFullYear(), 11, 31, 23, 59, 59, 999);
  return {
    start,
    end,
    label: String(anchor.getFullYear()),
  };
}

export function shiftAnchor(period: DashboardPeriod, anchor: Date, delta: number): Date {
  const d = new Date(anchor);
  if (period === 'day') {
    d.setDate(d.getDate() + delta);
    return d;
  }
  if (period === 'month') {
    d.setMonth(d.getMonth() + delta);
    return d;
  }
  d.setFullYear(d.getFullYear() + delta);
  return d;
}

export type DoctorDashboardAggregates = {
  appointmentsInRange: number;
  completedCount: number;
  pendingCount: number;
  patientsAttended: number;
  totalRevenue: number;
};

/** Pending = active pipeline (not completed, cancelled, or no-show). */
export function aggregateDoctorDashboard(
  appointments: Appointment[],
  range: { start: Date; end: Date },
): DoctorDashboardAggregates {
  const startMs = range.start.getTime();
  const endMs = range.end.getTime();

  const inRange = appointments.filter((a) => {
    const t = new Date(a.ScheduledDateTime).getTime();
    return t >= startMs && t <= endMs;
  });

  const completed = inRange.filter((a) => a.Status === 'Completed');
  const pending = inRange.filter((a) => isAppointmentPending(a.Status));

  const patientIds = new Set(completed.map((a) => a.PatientID));

  let totalRevenue = 0;
  for (const a of completed) {
    for (const act of a.performedActions ?? []) {
      totalRevenue += act.TotalPrice;
    }
  }

  return {
    appointmentsInRange: inRange.length,
    completedCount: completed.length,
    pendingCount: pending.length,
    patientsAttended: patientIds.size,
    totalRevenue,
  };
}
