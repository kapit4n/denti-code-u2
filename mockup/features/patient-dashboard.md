# Patient Dashboard

**Route:** `/patient/dashboard`

**Role:** Patient

**Description:** Welcome dashboard showing patient info summary (name, email, phone, DOB, address with avatar thumbnail), upcoming appointments preview (up to 4 cards with doctor name, date/time, purpose, status badge, and costs), and quick links to full appointments list and profile edit.

**Key Elements:**
- Patient info summary card
- Upcoming appointments preview
- Quick link buttons
- Avatar thumbnail

**Files:**
- `src/app/patient/dashboard/page.tsx`
- `src/features/patients/patientsApiSlice.ts`
- `src/features/appointments/appointmentsApiSlice.ts`
