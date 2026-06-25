# Denti-Code Project Rules & Conventions

## General Conventions

### Code Style
- **no comments** in source files unless documenting a non-obvious workaround
- **TypeScript** required for all files (`.ts` / `.tsx`)
- **Export named** functions/constants, avoid `export default`
- **File naming:** `kebab-case.ts` or `PascalCase.tsx` for components
- **Folder naming:** `kebab-case/`

### Component Structure
- Components are **'use client'** (App Router does not use server components in this project)
- Props are typed via interface at the top of the file
- Boolean props default to `false`

```typescript
'use client';

interface Props {
  label: string;
  disabled?: boolean;
}

export function MyButton({ label, disabled = false }: Props) {
  return <button disabled={disabled}>{label}</button>;
}
```

### Imports Order
1. React / Next.js
2. External libraries (redux-toolkit, react-redux, etc.)
3. `@/` path aliases (features → lib → components → types)
4. i18n hooks
5. Relative imports (rare)

### Git Conventions
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`
- Scope optional: `feat(admin):`, `fix(doctor):`
- No direct pushes to `main` — work in feature branches

---

## State Management Rules

### RTK Query API Slices
- Define one `createApi` call per domain in `src/features/{domain}/*ApiSlice.ts`
- Export the slice, the reducer (for store), and the middleware (for store)
- Use `tagTypes` for cache invalidation
- Endpoint query functions use proper `builder.query` / `builder.mutation` signatures
- Always call `.slice()` on the reducer path to get the reducer

#### DO (correct pattern):
```typescript
export const inventoryApiSlice = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, prepareHeaders }),
  tagTypes: ['Category', 'Material'],
  endpoints: (builder) => ({
    getMaterialCategories: builder.query<Category[], void>({
      query: () => '/inventory/categories',
      providesTags: (result) => result
        ? [...result.map(({ id }) => ({ type: 'Category', id })), { type: 'Category', id: 'LIST' }]
        : [{ type: 'Category', id: 'LIST' }],
    }),
    updateStock: builder.mutation<void, { itemId: string; stock: number }>({
      query: ({ itemId, stock }) => ({ url: `/inventory/${itemId}`, method: 'PATCH', body: { stock } }),
      invalidatesTags: (_result, _error, { itemId }) => [{ type: 'Material', id: itemId }],
    }),
  }),
});

export const { useGetMaterialCategoriesQuery, useUpdateStockMutation } = inventoryApiSlice;
```

### Store Configuration
- Store lives at `src/lib/redux/store.ts`
- All API slices' reducers and middlewares are added in the store
- Auth listener middleware is added after all API middlewares

---

## Portal Role Rules

### Admin Portal (`/admin/*`)

**Access:** Users with `role: 'ADMIN'`

**Layout:** `src/app/admin/layout.tsx` → `AdminRoleChecker` → `PortalSidebarLayout`

**Sidebar items:**
| Label | Icon | Path |
|---|---|---|
| Dashboard | LayoutDashboard | `/admin/dashboard` |
| Patients | Users | `/admin/patients` |
| Doctors | Stethoscope | `/admin/doctors` |
| Appointments | Calendar | `/admin/appointments` |
| Services | Server | `/admin/services` |
| Inventory | Package | `/admin/inventory` |
| Settings | Settings | `/admin/settings` |
| Profile | UserCircle | `/admin/profile` |

**Header:** `AdminPortalHeader` — shows `{name}` + "Administration" subtitle

**Rules:**
- Admin sees ALL patients and ALL doctors across the organization
- Admin can register patients via `/admin/patients` (PatientRegistrationForm)
- Admin can view and edit any patient detail
- Admin can view all appointments in a table
- Admin can view system service health status
- Admin can manage material inventory
- Admin can view their own profile

### Doctor Portal (`/doctor/*`)

**Access:** Authenticated users (typically `DOCTOR` role)

**Layout:** `src/app/doctor/layout.tsx` → `AuthChecker` → `PortalSidebarLayout`

**Sidebar items:**
| Label | Icon | Path |
|---|---|---|
| Dashboard | LayoutDashboard | `/doctor/dashboard` |
| Calendar | CalendarClock | `/doctor/calendar` |
| Visits | ClipboardList | `/doctor/appointments` |
| Patients | Users | `/doctor/patients` |
| Profile | UserCircle | `/doctor/profile` |

**Header:** `DoctorPortalHeader` — shows "Dr. {name}" + "Your schedule..." subtitle

**Rules:**
- Doctor sees only their OWN appointments (filtered by `providerId`)
- Doctor can CREATE appointments (CreateAppointmentModal)
- Doctor can view appointment detail, add treatments, view patient info
- Add treatment → `/doctor/appointments/[appointmentId]/add-treatment`
- Doctor can view their OWN patients (patients they have treated)
- Doctor can register new patients
- Doctor can view their own profile and upload avatar
- Doctor calendar shows their own schedule

**Doctor Dashboard:**
- Welcoming quote
- Period stats cards (appointments count, patients count, payments count)
- Period selector (today/week/month/3months/all)
- Uses `useGetDoctorStatsQuery(period)` — shows period change indicators (+15%, -3%, etc.)

**Appointment Detail (Doctor):**
- Patient name + last appointment date (blue accent card)
- Appointment status label, date/time, reason, notes
- Payment details section
- Clinical divider with "Clinic" heading
- Treatments table
- "Add Treatment" button → links to add-treatment page
- Delete treatment enabled (shows with actions column) — when there is 1+ treatments

**Add Treatment Flow:**
- `GET /appointments/:appointmentId` to load appointment data
- Selecting a quadrant from tooth selector populates tooth number
- Clear / Save buttons
- On save → `POST /appointments/:appointmentId/treatments` → redirect back to detail page
- Tooth selector: quadrant buttons (§1-§4) populate tooth dropdown (1-32)

### Patient Portal (`/patient/*`)

**Access:** Authenticated users (typically `PATIENT` role)

**Layout:** `src/app/patient/layout.tsx` → `AuthChecker` → `PortalSidebarLayout`

**Sidebar items:**
| Label | Icon | Path |
|---|---|---|
| Dashboard | LayoutDashboard | `/patient/dashboard` |
| My Visits | Calendar | `/patient/appointments` |
| Profile | UserCircle | `/patient/profile` |

**Header:** `PatientPortalHeader` — shows "Hi, {firstName}" + LanguageSwitcher + ProfileAvatarNav

**Rules:**
- Patient sees only their OWN data
- Patient can view upcoming visits on dashboard
- Patient can view ALL visits (history) on `/patient/appointments`
- Patient can Accept, Reschedule, or Cancel appointments
- Patient can edit their own name, phone, address (profile)
- Patient CANNOT create appointments, add treatments, manage inventory, etc.
- Patient CANNOT see other patients

---

## Notification System

### Components
- `NotificationBell` — bell icon with badge count + dropdown list in portal headers
- RTK Query slice: `notificationsApiSlice` with 30s polling
- Polling only active when dropdown is open (`skipPollingWhileUnfocused`)

### Endpoints (expected, backend pending)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | List user notifications |
| PATCH | `/notifications/:id/read` | Mark one as read |
| POST | `/notifications/read-all` | Mark all as read |

### Unread Counter
- Derived client-side: `notifications.filter(n => !n.readAt).length`

---

## i18n Rules

### Translation Keys
- Dot-notation: `'namespace.key'`
- Groups: `notifications.title`, `notifications.markAllAsRead`
- Variables: `'home.hero.subtitle'` with `{ role }` interpolation
- New keys must be added to BOTH `en.json` AND `es.json`

### Using Translations
```typescript
const { t, locale, setLocale } = useTranslation();
t('appointments.createLabel');      // "Create Appointment"
t('home.hero.title', { role: 'doctor' });  // "Welcome, doctor!"
```

### Locale Resolution
1. `user.preferredLocale` (from auth profile)
2. `orgDefaultLocale` (from settings API)
3. `localStorage.getItem('guestLocale')`
4. `'en'` fallback

---

## API & Data Fetching Rules

- All data fetching uses **RTK Query** hooks (no `fetch` or `axios` directly)
- Mutations use `invalidatesTags` to trigger cache refresh
- Optimistic updates are avoided — prefer `invalidatesTags`
- Error handling: RTK Query provides `isError` + `error` on hook results
- Loading states: use `isLoading` / `isFetching` from query hooks

---

## Component Patterns

### Modals
- Controlled by `isOpen` / `onClose` props
- Modal title via `title` prop
- Footer with action buttons

### Tables
- Data-driven columns via `columnDefinitions` or inline mapping
- Action column (edit/view/delete) on the right
- Empty state: `<p className="text-center text-muted-foreground">{t('common.noData')}</p>`

### Forms
- Labeled inputs with validation
- Submit + Cancel buttons
- Often rendered inside modals or dedicated pages

---

## Security Rules

- Auth token: injected via `prepareHeaders` in `fetchBaseQuery` — never exposed to client code
- Role checks: both client-side (`AdminRoleChecker`, `AuthChecker`) and assumed server-side
- Cookie: `dc_access_token` with `SameSite=Lax` and `max-age=600` (10 min)
- Avatar upload: Next.js API route `/api/avatar` proxies to backend

---

## Testing (pending)

- No test suite is currently configured
- When added, tests should live next to the module they test: `ComponentName.test.tsx`

---

## Scripts

```bash
npm run dev        # Next.js dev server (port 3005)
npm run build      # Production build
npm run lint       # ESLint check (flat config)
```
