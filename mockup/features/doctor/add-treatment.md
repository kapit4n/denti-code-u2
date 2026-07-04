# Add Treatment

**Route:** `/doctor/appointments/[appointmentId]/add-treatment`

**Role:** Doctor

**Description:** A form page to register a new treatment (performed action) for an appointment. Fields include: procedure type (with standard price auto-fill), quantity and unit price, tooth involved (optional), surfaces involved (optional), anesthesia used (with quick-select buttons for common types), facilities/materials used (checkboxes grouped by category with inventory stock indicators), and clinical notes.

**Key Elements:**
- Procedure type selector with price auto-fill
- Tooth and surface notation
- Anesthesia quick-select buttons
- Inventory material selection with stock indicators
- Clinical notes

**Files:**
- `src/app/doctor/appointments/[appointmentId]/add-treatment/page.tsx`
- `src/features/procedures/proceduresApiSlice.ts`
- `src/lib/doctor/buildTreatmentFacilityGroups.ts`
- `src/lib/doctor/treatmentFacilitiesCatalog.ts`
