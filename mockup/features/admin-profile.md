# Admin Profile

**Route:** `/admin/profile`

**Role:** Admin

**Description:** Shows the currently logged-in admin's user profile: display name, email, user ID, and roles (formatted via `formatAuthRolesLabel`).

**Key Elements:**
- User display name and email
- User ID
- Auth roles display

**Files:**
- `src/app/admin/profile/page.tsx`
- `src/lib/admin/authRoleLabels.ts`
