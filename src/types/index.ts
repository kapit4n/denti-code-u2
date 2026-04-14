export type AppointmentStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled'
  | 'NoShow'
  | 'Rescheduled';

export interface PerformedAction {
  PerformedActionID: number;
  AppointmentID: number;
  ProcedureTypeID: number;
  PerformingDoctorID: number;
  ActionDateTime: string;
  ToothInvolved: string | null;
  SurfacesInvolved: string | null;
  AnesthesiaUsed: string | null;
  /** JSON string array of catalog IDs from the API */
  FacilitiesUsed?: string | null;
  Description_Notes: string | null;
  Quantity: number;
  UnitPrice: number;
  TotalPrice: number;
}

export interface Appointment {
  AppointmentID: number;
  PatientID: number;
  PrimaryDoctorID: number;
  ScheduledDateTime: string;
  AppointmentPurpose: string | null;
  Status: AppointmentStatus;
  Notes?: string | null;
  EstimatedDurationMinutes?: number | null;
  performedActions?: PerformedAction[];
}

export interface AppointmentDetail extends Appointment {
  performedActions: PerformedAction[];
}

export interface CreatePerformedActionInput {
  ProcedureTypeID: number;
  PerformingDoctorID: number;
  ToothInvolved?: string;
  SurfacesInvolved?: string;
  AnesthesiaUsed?: string;
  /** Clinical catalog IDs; sent as JSON array to the API */
  FacilitiesUsed?: string[];
  Description_Notes?: string;
  Quantity: number;
  UnitPrice: number;
}

export interface ProcedureType {
  ProcedureTypeID: number;
  ProcedureName: string;
  Description?: string | null;
  DefaultDurationMinutes?: number | null;
  StandardPrice?: number | null;
  RequiresToothSpecification?: boolean;
  IsActive?: boolean;
  CategoryID?: number;
}

/** From clinic-provider `GET /treatment-facilities` (stable codes stored on performed actions). */
export interface TreatmentFacilityDto {
  FacilityID: number;
  FacilityCode: string;
  CategoryKey: string;
  DisplayName: string;
  SortOrder: number;
  IsActive: boolean;
}

export interface ConsultoryDto {
  ConsultoryID: number;
  Name: string;
  ShortCode: string | null;
  SortOrder: number;
  IsActive: boolean;
}

export type InventoryMovementType = 'RECEIVE' | 'REMOVE' | 'CONSUME';

export interface MaterialInventoryLineDto {
  LineID: number;
  ConsultoryID: number;
  FacilityID: number;
  Quantity: number;
  consultory: Pick<ConsultoryDto, 'ConsultoryID' | 'Name' | 'ShortCode'>;
  facility: Pick<TreatmentFacilityDto, 'FacilityID' | 'FacilityCode' | 'DisplayName' | 'CategoryKey'>;
}

export interface InventoryMovementDto {
  MovementID: number;
  ConsultoryID: number;
  FacilityID: number;
  QuantityChange: number;
  Type: InventoryMovementType;
  Note: string | null;
  createdAt: string;
  consultory: Pick<ConsultoryDto, 'ConsultoryID' | 'Name' | 'ShortCode'>;
  facility: Pick<TreatmentFacilityDto, 'FacilityID' | 'FacilityCode' | 'DisplayName' | 'CategoryKey'>;
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

export type UpdateAppointmentInput = Partial<
  Pick<
    CreateAppointmentInput,
    'ScheduledDateTime' | 'EstimatedDurationMinutes' | 'AppointmentPurpose' | 'Status' | 'Notes'
  >
>;

export interface ClinicDoctor {
  DoctorID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  ContactPhone: string;
  LicenseNumber: string;
  AvatarUrl?: string | null;
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
  AvatarUrl?: string | null;
  MedicalHistorySummary?: string;
}

/** Body for POST /patients (admin or doctor). */
export interface CreatePatientInput {
  FirstName: string;
  LastName: string;
  DateOfBirth: string;
  ContactPhone: string;
  Email?: string;
  Gender?: string;
  Address?: string;
  MedicalHistorySummary?: string;
}

export interface CreatePatientResult {
  message: string;
  patientId: number;
}
