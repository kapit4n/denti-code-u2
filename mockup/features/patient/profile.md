# Patient Profile

**Route:** `/patient/profile`

**Role:** Patient

**Description:** Displays all patient profile fields in read-only mode with an "Edit" button that switches to an editable form. Fields include name, email, phone, DOB, gender, address, and medical history. Includes loading skeleton UI.

**Key Elements:**
- Profile view/edit toggle
- Medical history field
- Loading skeleton state
- Direct API sync

**Files:**
- `src/app/patient/profile/page.tsx`
- `src/features/patients/patientsApiSlice.ts`
