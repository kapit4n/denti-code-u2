# Doctor Profile

**Route:** `/doctor/profile`

**Role:** Doctor

**Description:** Shows the doctor's user profile info (name, email, user ID, roles) and clinic doctor card with avatar management. The doctor can upload a new avatar image (JPEG/PNG/WebP) or remove the existing one.

**Key Elements:**
- User profile information
- Clinic doctor card
- Avatar upload and removal
- Image format support (JPEG/PNG/WebP)

**Files:**
- `src/app/doctor/profile/page.tsx`
- `src/features/doctors/doctorsApiSlice.ts`
- `src/lib/avatar/uploadAvatarFile.ts`
