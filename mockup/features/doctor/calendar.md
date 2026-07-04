# Doctor Calendar

**Route:** `/doctor/calendar`

**Role:** Doctor

**Description:** A multi-view calendar for the doctor's appointments. Supports three view modes: Week View (Monday-Sunday columns with time slots), Month View (standard month grid), and Day View (single day with hourly slots). Navigation controls include prev/next arrows and "Today" button. Double-clicking on a time slot opens the `CreateAppointmentModal` with the selected time pre-filled.

**Key Elements:**
- Week, Month, and Day views
- Navigation with prev/next/today
- Double-click to create appointments
- Appointment count per period

**Files:**
- `src/app/doctor/calendar/page.tsx`
- `src/lib/doctor/calendarUtils.ts`
