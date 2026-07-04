# Admin Appointments

**Route:** `/admin/appointments`

**Role:** Admin

**Description:** Lists all appointments sorted by date (newest first). The table shows Appointment ID, Date/Time, Patient name (with link to patient detail), Doctor name, Purpose, and Status badge. Labels for patient/doctor come from joined data.

**Key Elements:**
- All appointments table
- Linked patient and doctor names
- Status badges with color coding

**Files:**
- `src/app/admin/appointments/page.tsx`
- `src/features/appointments/appointmentsApiSlice.ts`
