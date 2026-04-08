export interface Appointment {
  AppointmentID: number;
  PatientID: number;
  PrimaryDoctorID: number;
  ScheduledDateTime: string;
  AppointmentPurpose: string | null;
  Status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'NoShow';
  Notes?: string | null;
  EstimatedDurationMinutes?: number | null;
}

export interface CreateAppointmentInput {
  PatientID: number;
  PrimaryDoctorID: number;
  ScheduledDateTime: string;
  EstimatedDurationMinutes?: number;
  AppointmentPurpose?: string;
  Status: Appointment['Status'];
  Notes?: string;
}

export interface ClinicDoctor {
  DoctorID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  ContactPhone: string;
  LicenseNumber: string;
  OfficeRoomNumber?: string | null;
  IsActive?: boolean;
  SpecializationID?: number | null;
}

export interface PatientProfile {
  PatientID: number;
  FirstName: string;
  LastName: string;
  DateOfBirth: string;
  Gender?: string;
  Address?: string;
  ContactPhone: string;
  Email?: string;
  MedicalHistorySummary?: string;
}
