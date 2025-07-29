export interface Appointment {
  AppointmentID: number;
  ScheduledDateTime: string; // ISO date string
  AppointmentPurpose: string;
  Status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'NoShow';
  // You can add more fields that your API returns, e.g., doctor details
  // doctor: {
  //   FirstName: string;
  //   LastName: string;
  // }
}
