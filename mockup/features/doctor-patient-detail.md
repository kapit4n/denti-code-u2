# Patient Detail

**Route:** `/doctor/patients/[patientId]`

**Role:** Doctor

**Description:** A comprehensive patient detail page with:
- **Patient Demographics** - Name, DOB, gender, address, medical history summary with inline edit
- **Payments Section** - Financial summary (billed total, payments received, outstanding balance), payment registration form, and payments list
- **Visits Section** - Table of the patient's appointments with this doctor showing date, purpose, status, treatment total

**Key Elements:**
- Patient demographics with edit
- Payment summary and registration
- Visits history table
- Outstanding balance tracking

**Files:**
- `src/app/doctor/patients/[patientId]/page.tsx`
- `src/features/patients/patientsApiSlice.ts`
- `src/features/payments/paymentsApiSlice.ts`
