# Admin Patients

**Route:** `/admin/patients`, `/admin/patients/[patientId]`

**Role:** Admin

**Description:** Lists all patients in a sortable table (by last/first name). Includes a `RegisterPatientForm` component at the top for adding new patients. Each row shows PatientID, name (clickable link to the detail page), Date of Birth, phone, email, and an "Edit" action link. The detail page shows the patient's full name and ID with an `EditPatientForm` component.

**Key Elements:**
- Sortable patient table
- Register new patient form
- Patient detail/edit view

**Files:**
- `src/app/admin/patients/page.tsx`
- `src/app/admin/patients/[patientId]/page.tsx`
- `src/features/patients/patientsApiSlice.ts`
- `src/components/patients/RegisterPatientForm.tsx`
- `src/components/patients/EditPatientForm.tsx`
