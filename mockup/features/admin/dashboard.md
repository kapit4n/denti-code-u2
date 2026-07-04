# Admin Dashboard

**Route:** `/admin/dashboard`

**Role:** Admin

**Description:** Overview page showing summary statistics: total patients, total doctors, total appointments, and today's appointment count as clickable stat cards. Also displays a breakdown of appointments by status (Scheduled, Confirmed, InProgress, Completed, Cancelled, NoShow, Rescheduled) using i18n-friendly status labels.

**Key Elements:**
- Summary stat cards (patients, doctors, appointments, today)
- Appointment status breakdown
- Quick access to key areas

**Files:**
- `src/app/admin/dashboard/page.tsx`
- `src/features/appointments/appointmentsApiSlice.ts`
- `src/features/patients/patientsApiSlice.ts`
- `src/features/doctors/doctorsApiSlice.ts`
