# Doctor Dashboard

**Route:** `/doctor/dashboard`

**Role:** Doctor

**Description:** Welcome section with quick links to Visits, Calendar, and Patients. Displays an upcoming appointments preview (up to 6) with patient name, purpose, status badge, and time. Includes an analytics section with period selector (day/month/year tabs with prev/next/today navigation) showing: Completed visits count, Pending visits count, Unique patients attended, Total revenue, and Total appointments.

**Key Elements:**
- Quick links to key areas
- Upcoming appointments preview
- Analytics with period selector
- Revenue and visit statistics

**Files:**
- `src/app/doctor/dashboard/page.tsx`
- `src/app/doctor/dashboard/_components/DoctorHomeOverview.tsx`
- `src/app/doctor/dashboard/_components/DoctorDashboardStats.tsx`
- `src/lib/doctor/doctorDashboardStats.ts`
