# Admin Inventory

**Route:** `/admin/inventory`

**Role:** Admin

**Description:** A comprehensive inventory management page with multiple sections:
1. **Consultories Section** - Create new consultories (treatment rooms/offices) with name and optional short code
2. **Register Material Line** - Assign materials to consultories with initial quantities
3. **Stock View** - Filterable by consultory, showing inventory lines with status and action buttons (RECEIVE, REMOVE, CONSUME, DELETE)
4. **Movement History** - Scrollable table of recent stock movements with timestamps, type, and quantity changes

**Key Elements:**
- Consultory CRUD
- Material line registration
- Stock adjustments (RECEIVE/REMOVE/CONSUME)
- Movement history tracking

**Files:**
- `src/app/admin/inventory/page.tsx`
- `src/features/inventory/inventoryApiSlice.ts`
