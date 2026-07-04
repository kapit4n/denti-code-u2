# System Services

**Route:** `/admin/services`, `/admin/services/endpoints/[serviceId]`

**Role:** Admin

**Description:** Displays the health status of all backend microservices (gateway, auth, patients, clinic_provider, appointments, ui). Each row shows service name, status (up/down/not_configured with color-coded badges), base URL, detail, and a link to view endpoints. A "Refresh" button allows manual re-check. The endpoints page lists API endpoints for a specific service with HTTP method, path, gateway path, and summary.

**Key Elements:**
- Service health monitoring
- Color-coded status badges
- Endpoint catalog per service
- Manual refresh capability

**Files:**
- `src/app/admin/services/page.tsx`
- `src/app/admin/services/endpoints/[serviceId]/page.tsx`
- `src/features/systemStatus/systemStatusApiSlice.ts`
