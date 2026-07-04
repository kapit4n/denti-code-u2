# Doctor Appointments

**Route:** `/doctor/appointments`, `/doctor/appointments/[appointmentId]`

**Role:** Doctor

**Description:** Lists the logged-in doctor's appointments (filtered by matching email with clinic doctor records). Shows upcoming and past sections with patient name, purpose, status badge, recorded treatment total, date/time, and a link to open the visit. A "New Visit" button opens the `CreateAppointmentModal`. The detail view shows patient info, appointment details with status change capability, and a treatments section listing all performed actions with total cost.

**Key Elements:**
- Upcoming and past appointments
- Create appointment modal
- Appointment detail with status management
- Treatments table with costs
- Performed action management

**Files:**
- `src/app/doctor/appointments/page.tsx`
- `src/app/doctor/appointments/[appointmentId]/page.tsx`
- `src/features/appointments/appointmentsApiSlice.ts`
