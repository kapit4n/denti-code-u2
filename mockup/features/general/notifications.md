# Notifications

**Role:** Cross-cutting (Admin, Doctor, Patient)

**Description:** A bell icon button in the header that shows unread count badge, opens a dropdown with the 20 most recent notifications (sorted by date), allows click-to-mark-read and "Mark all as read" action. Notifications poll every 30 seconds when the dropdown is open. Types include: appointment_reminder, new_patient, status_change, system.

**Key Elements:**
- Bell icon with unread badge
- Notification dropdown (last 20)
- Mark read / mark all read
- Auto-polling every 30s
- Multiple notification types

**Files:**
- `src/features/notifications/notificationsApiSlice.ts`
- `src/components/NotificationBell.tsx`
