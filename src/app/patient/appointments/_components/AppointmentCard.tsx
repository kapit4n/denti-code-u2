import { Appointment } from '@/types';

interface AppointmentCardProps {
  appointment: Appointment;
  isPast?: boolean;
}

export default function AppointmentCard({ appointment, isPast = false }: AppointmentCardProps) {
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

  return (
    <div className={`bg-white p-5 rounded-lg shadow-md border-l-4 ${isPast ? 'border-gray-400 opacity-75' : 'border-blue-500'}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-lg font-bold text-gray-800">{appointment.AppointmentPurpose}</p>
          <p className="text-sm text-gray-500">Status: {appointment.Status}</p>
        </div>
        <div className="text-right">
          <p className="text-md font-semibold text-gray-700">{formattedDate}</p>
          <p className="text-md text-gray-600">{formattedTime}</p>
        </div>
      </div>
      {!isPast && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
          <button className="bg-blue-500 text-white text-sm font-bold py-2 px-3 rounded hover:bg-blue-600">
            Confirm
          </button>
          <button className="bg-gray-200 text-gray-800 text-sm font-bold py-2 px-3 rounded hover:bg-gray-300">
            Reschedule
          </button>
        </div>
      )}
    </div>
  );
}
