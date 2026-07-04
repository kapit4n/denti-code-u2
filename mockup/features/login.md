# Login

**Route:** `/login`

**Role:** Public

**Description:** A split-screen login page with a branded left panel (blue gradient with feature highlights) and a login form on the right. After successful authentication, the user is redirected to their role-specific dashboard (`/admin/dashboard`, `/doctor/dashboard`, or `/patient/dashboard`) based on their `roles` array.

**Key Elements:**
- Pre-filled demo credentials
- Error message display
- Language switcher
- Role-based routing on login

**Files:**
- `src/app/(auth)/login/page.tsx`
- `src/features/auth/authApiSlice.ts`
- `src/features/auth/authSlice.ts`
