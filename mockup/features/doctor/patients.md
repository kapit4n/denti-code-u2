# Doctor Patients

**Route:** `/doctor/patients`

**Role:** Doctor

**Description:** Lists the doctor's treated patients (derived from their appointments). Shows a `RegisterPatientForm` for adding new patients. The table displays patient name (with email), phone, visit count, last visit date, and action links to open or edit the patient.

**Key Elements:**
- Treated patients list
- Register new patient form
- Visit count and last visit tracking
- Open/edit patient actions

**Files:**
- `src/app/doctor/patients/page.tsx`
- `src/features/patients/patientsApiSlice.ts`
