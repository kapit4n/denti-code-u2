# Denti-Code Frontend Architecture

## Overview

Denti-Code is a multi-role dental practice management platform. The frontend is a Next.js 16 application with React 19, Redux Toolkit (RTK Query), and Tailwind CSS. It serves three portal types: **Admin**, **Doctor**, and **Patient**, each with role-specific views and capabilities.

The frontend communicates with a set of backend microservices through an API gateway at `http://localhost:3000/api/gateway`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.9 (App Router) |
| UI Library | React 19.2.7 |
| State Management | Redux Toolkit 2.12.0 + RTK Query |
| Styling | Tailwind CSS 3.4.19 |
| Language | TypeScript 5.9.3 |
| Linting | ESLint 9 + eslint-config-next 16 |
| i18n | Custom context-based system (en/es) |

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (StoreProvider)
│   ├── page.tsx                # Public landing page
│   ├── (auth)/login/           # Login page
│   ├── admin/                  # Admin portal (requires ADMIN role)
│   ├── doctor/                 # Doctor portal (requires auth)
│   ├── patient/                # Patient portal (requires auth)
│   └── api/avatar/             # Avatar upload API route
├── components/                 # Shared UI components
│   ├── portal/                 # Portal sidebar layout
│   ├── patients/               # Patient form components
│   └── ...                     # AuthChecker, AvatarThumb, NotificationBell, etc.
├── features/                   # Redux Toolkit slices + RTK Query API slices
│   ├── auth/                   # Authentication state + API
│   ├── appointments/           # Appointments CRUD API
│   ├── doctors/                # Doctors directory API
│   ├── patients/               # Patients CRUD API
│   ├── payments/               # Payments API
│   ├── procedures/             # Procedure types + treatment facilities API
│   ├── inventory/              # Material inventory API
│   ├── locale/                 # Locale settings API
│   ├── notifications/          # Notifications API (with polling)
│   └── systemStatus/           # System health API
├── lib/                        # Utilities and helpers
│   ├── redux/                  # Store config, hooks, providers
│   ├── auth/                   # Session cookie, profile routes
│   ├── appointments/           # Status helpers, i18n, patient actions
│   ├── doctor/                 # Calendar utils, stats, facility groups
│   ├── patient/                # Cost calculation
│   ├── admin/                  # Role labels
│   └── avatar/                 # File upload helper
├── i18n/                       # Internationalization
│   ├── locales/en.json         # English translations (~729 keys)
│   ├── locales/es.json         # Spanish translations (~729 keys)
│   ├── I18nContext.tsx          # Translation context + locale resolution
│   ├── translate.ts            # Dot-notation lookup with interpolation
│   └── supportedLocales.ts     # Locale constants
└── types/                      # TypeScript type definitions
    └── index.ts                # All shared interfaces
```

---

## Routing Structure

### Public Routes
| Path | Description |
|---|---|
| `/` | Landing page with hero and role cards |
| `/login` | Login form with branded banner |

### Admin Portal (requires `ADMIN` role)
| Path | Description |
|---|---|
| `/admin/dashboard` | Overview stats (patients, doctors, appointments) |
| `/admin/patients` | Patient list + registration form |
| `/admin/patients/[patientId]` | Patient detail/edit |
| `/admin/doctors` | Doctor directory table |
| `/admin/appointments` | All appointments table |
| `/admin/services` | System services health status |
| `/admin/services/endpoints/[serviceId]` | Service endpoint catalog |
| `/admin/inventory` | Material inventory management |
| `/admin/settings` | Organization locale settings |
| `/admin/profile` | Admin user account view |

### Doctor Portal (requires auth, `DOCTOR` role recommended)
| Path | Description |
|---|---|
| `/doctor` | Redirects to `/doctor/dashboard` |
| `/doctor/dashboard` | Home overview + period metrics |
| `/doctor/appointments` | Visit list + CreateAppointmentModal |
| `/doctor/appointments/[appointmentId]` | Visit detail + treatments table |
| `/doctor/appointments/[appointmentId]/add-treatment` | Add treatment line form |
| `/doctor/calendar` | Month/Week/Day calendar views |
| `/doctor/patients` | Treated patients list + registration |
| `/doctor/patients/[patientId]` | Patient detail + payments + visits |
| `/doctor/profile` | Account + avatar upload |
| `/doctor/settings` | Redirects to profile |

### Patient Portal (requires auth, `PATIENT` role recommended)
| Path | Description |
|---|---|
| `/patient` | Redirects to `/patient/dashboard` |
| `/patient/dashboard` | Profile summary + upcoming visits |
| `/patient/appointments` | Full visit list with Accept/Reschedule/Cancel |
| `/patient/profile` | Profile view/edit with avatar |
| `/patient/settings` | Redirects to profile |

---

## Authentication Flow

```
Login → POST /auth/login → GET /auth/profile → setCredentials → cookie set
Hydration (page load) → read cookie → GET /auth/profile → hydrate Redux
Renewal → on activity → POST /auth/refresh → GET /auth/profile → update credentials
Idle timeout (10min) → logout → clear cookie → redirect /login
```

- **Token storage:** Redux store + `dc_access_token` cookie (SameSite Lax, 10min max-age)
- **Route guards:** `AuthChecker` (any authenticated user) and `AdminRoleChecker` (ADMIN only)
- **SessionManager** handles hydration on mount, activity-based renewal, and idle timeout

---

## State Management Pattern

All API calls follow the **RTK Query** pattern:

```typescript
export const exampleApiSlice = createApi({
  reducerPath: 'exampleApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Example'],
  endpoints: (builder) => ({
    getItems: builder.query<Item[], void>({
      query: () => '/items',
      providesTags: (result) => result
        ? [...result.map(({ id }) => ({ type: 'Example', id })), { type: 'Example', id: 'LIST' }]
        : [{ type: 'Example', id: 'LIST' }],
    }),
    createItem: builder.mutation<Item, Input>({
      query: (body) => ({ url: '/items', method: 'POST', body }),
      invalidatesTags: [{ type: 'Example', id: 'LIST' }],
    }),
  }),
});
```

**Store structure:**
- 1 Redux slice (`auth`) for auth state
- 10 RTK Query API slices, each with its own reducer path and middleware
- Auth listener middleware handles cookie sync on login/logout

---

## Portal Layout Pattern

All three portals share the same layout structure via `PortalSidebarLayout`:

```
PortalShell (layout.tsx)
  └─ AuthChecker (redirects to /login if unauthenticated)
     └─ AdminRoleChecker (admin only, redirects non-ADMIN to /)
        └─ PortalSidebarLayout
           ├─ Sidebar (collapsible, persisted to localStorage)
           ├─ Top bar (flexible header via props)
           └─ Main content area
```

Each portal has its own header component:
- **AdminPortalHeader** — `{name}` + "Administration" subtitle + LanguageSwitcher + NotificationBell + ProfileAvatarNav
- **DoctorPortalHeader** — "Dr. {name}" + "Your schedule..." subtitle + LanguageSwitcher + NotificationBell + ProfileAvatarNav
- **PatientPortalHeader** — "Hi, {name}" + LanguageSwitcher + ProfileAvatarNav

---

## API Gateway & Backend Services

The frontend communicates with `NEXT_PUBLIC_API_GATEWAY_URL` (default: `http://localhost:3000/api/gateway`).

| Service | Port | Technology |
|---|---|---|
| API Gateway | 3000 | Node.js (Express + http-proxy-middleware) |
| Appointments API | 3003 | Node.js + Prisma + SQLite |
| Clinic/Provider API | 3002 | Node.js + Prisma + SQLite |
| Auth Service | 3004 | Node.js + Prisma + SQLite |
| Patients API | 3001 | Node.js + Prisma + SQLite |
| Broker HTTP | 5000 | Python/Flask → RabbitMQ |
| RabbitMQ | 5672 / 15672 | AMQP + Management UI |

**Seed users** (password: `Password123!`):
- `admin@denti-code.com` — ADMIN
- `susan.storm@denti-code.com` — DOCTOR
- `peter.parker@denti-code.com` — DOCTOR
- `patient1@example.com` through `patient5@example.com` — PATIENT

---

## i18n System

- **Two locales:** English (`en`) and Spanish (`es`)
- **Lookup:** Dot-notation keys with `{var}` interpolation
- **Resolution order:** `user.preferredLocale` > `orgDefaultLocale` > `fallback (en)`
- **Guest preference:** Stored in `localStorage`
- **Usage:** `const { t } = useTranslation()` → `t('namespace.key')` or `t('namespace.key', { var })`

---

## Key Conventions

- **'use client'** directive on all interactive components (no server components)
- **Path alias:** `@/` maps to `src/`
- **API slices** live in `src/features/{domain}/` and export named hooks `use{X}Query`/`use{X}Mutation`
- **Pages** are in `src/app/{role}/{path}/page.tsx`
- **Shared components** in `src/components/`
- **Utility functions** in `src/lib/{domain}/`
- **TypeScript interfaces** in `src/types/index.ts`
