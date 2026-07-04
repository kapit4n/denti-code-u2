# Patient Appointments

**Route:** `/patient/appointments`

**Role:** Patient

**Description:** Lists all of the patient's appointments split into upcoming and past sections. Each appointment is shown as a card with purpose, status badge, doctor name (with avatar), date/time, and recorded treatment cost. Patients can Accept (confirms), Reschedule (datetime picker modal), or Cancel upcoming appointments. Supports anchor-based scrolling (`#patient-appt-{id}`).

**Key Elements:**
- Upcoming and past sections
- Appointment action cards
- Accept/Reschedule/Cancel actions
- Business rule validation per status

**Files:**
- `src/app/patient/appointments/page.tsx`
- `src/features/appointments/appointmentsApiSlice.ts`
- `src/lib/appointments/patientAppointmentActions.ts`
