## Goal
Add a payment preview inside treatment tracking forms and a one‑click “Encode Payment” button that opens the existing payment modal prefilled with the current client/context.

## Scope
- Show recent payments for the selected client (and appointment if present) within treatment tracking (medical records/appointment detail).
- Add a button to encode a new client payment, prefilled from the current treatment context.
- Keep the existing chat capture flow; unify prefill behavior.

## UI Changes
- Treatment Tracking Form (admin):
  - Payment Preview card: latest 3 payments with amount, status, method, and receipt thumbnails (from `receipt_url`/`uploaded_files`).
  - “Encode Payment” button in the form header/action bar. Clicking opens the existing Payment modal.
- Payment Modal: auto-prefill `clientId`, `clientName`, optionally `appointmentId`, and any receipt media if provided by context.

## Data Wiring
- Read payments via `GET /api/admin/payments`, filter by `client_id` and (if available) `appointment_id`.
- Prefill payload on open: `clientId`, `clientName`, `clientPhone`, `clientEmail`, `appointmentId` (if in context), `uploadedFiles`/`receiptUrl` (if invoked from media).
- Reuse existing `handlePaymentSubmit` to persist (`POST /api/admin/payments`).

## Implementation Steps
1. Admin page (`app/admin/page.tsx`):
   - Add a `PaymentPreview` section in treatment tracking: fetch + render recent payments with thumbnails and meta.
   - Add an “Encode Payment” button that sets `paymentForm` from current client/appointment context and calls `openPaymentModal()`.
2. Context plumbing:
   - When treatment tracking is opened, derive `clientId`/`clientName`/`appointmentId` from the active record/appointment.
   - If invoked from chat media capture, persist `payment_draft` as today; ensure treatment context enriches the draft with `appointmentId` when available.
3. Rendering details:
   - Thumbnail grid for receipts (`uploaded_files`) with click-to-view.
   - Status and method badges; amount formatted with currency.
4. Post‑save refresh:
   - On modal close/success, re-fetch payments and update the preview card.

## Validation
- Manual: open treatment tracking, verify preview loads; click “Encode Payment”, confirm modal prefilled; save and see preview update.
- API: verify `GET /api/admin/payments` shows the new record.

## Security & UX
- Respect existing CSRF and encrypted fields; do not surface sensitive data beyond allowed decrypted fields.
- Avoid performance regressions; lazy-load thumbnails.

## Files
- `app/admin/page.tsx`: add preview card + encode button, data fetch/wiring.
- Optional helper: small utility to format amounts and statuses (inline or local file).

## Rollback
- Changes are additive; can hide the preview and button behind a feature flag or remove the section without affecting existing flows.