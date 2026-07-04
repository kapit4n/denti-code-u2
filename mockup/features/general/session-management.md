# Session Management

**Role:** Cross-cutting (Admin, Doctor, Patient)

**Description:** On app load, `SessionManager` reads an auth token cookie, fetches the user profile, and restores the session. It also monitors user activity (pointer, keyboard, scroll, visibility change) and automatically logs out after a configurable idle period. The session is proactively refreshed on activity to keep the token alive.

**Key Elements:**
- Cookie-based token persistence
- Session restoration on load
- Activity monitoring (pointer, keyboard, scroll, visibility)
- Idle timeout auto-logout
- Proactive token refresh

**Files:**
- `src/lib/redux/SessionManager.tsx`
- `src/lib/auth/sessionCookie.ts`
- `src/features/auth/authSlice.ts`
