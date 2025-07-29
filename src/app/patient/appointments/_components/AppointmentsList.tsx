import { Appointment } from '@/types'; // You should define this type
import AppointmentCard from './AppointmentCard';

interface AppointmentsListProps {
  appointments: Appointment[];
}

export default function AppointmentsList({ appointments }: AppointmentsListProps) {
  const now = new Date();

  const upcomingAppointments = appointments
    .filter(appt => new Date(appt.ScheduledDateTime) >= now)
    .sort((a, b) => new Date(a.ScheduledDateTime).getTime() - new Date(b.ScheduledDateTime).getTime());

  const pastAppointments = appointments
    .filter(appt => new Date(appt.ScheduledDateTime) < now)
    .sort((a, b) => new Date(b.ScheduledDateTime).getTime() - new Date(a.ScheduledDateTime).getTime());

  return (
    <div className="space-y-8">
      {/* Upcoming Appointments Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Upcoming</h3>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map(appt => (
              <AppointmentCard key={appt.AppointmentID} appointment={appt} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming appointments.</p>
        )}
      </div>

      {/* Past Appointments Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">History</h3>
        {pastAppointments.length > 0 ? (
          <div className="space-y-4">
            {pastAppointments.map(appt => (
              <AppointmentCard key={appt.AppointmentID} appointment={appt} isPast />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No past appointments found.</p>
        )}
      </div>
    </div>
  );
}
