## Goal

Display each client’s payment totals alongside treatment totals in the “View Totals” dialog under Staff → All Staff Treatments.

## UI Changes

* Dialog header unchanged.

* Totals table per staff: add payment insights.

  * Extend the per‑staff client breakdown table to include columns:

    1. `Client`
    2. `Treatment Total`
    3. `Payment Total` (sum of completed payments)
    4. `Difference` (Payment − Treatment)

* Summary section:

  * Keep `Grand Total` for treatments.

  * Add `Payments Grand Total (completed)` and `Difference` summary.

## Data Wiring

* Use existing `payments` state from `app/admin/page.tsx`.

* Map payments by `clientId` → client full name (from `clients` state) for rendering consistency.

* Filter payments by `status === 'completed'` for totals; still list all treatments.

* Respect privacy mode: mask client names when `privacyMode` is on.

## Implementation Steps

1. In `app/admin/page.tsx` (View Totals dialog block \~3438–3547):

   * Build `paymentsByClient: Map<string, number>` using `payments` filtered by `completed` and keyed by client full name.

   * While constructing `byStaff`, also compute client treatment totals (already present) and read matching `paymentTotal = paymentsByClient.get(clientName) || 0`.

   * Render new columns in the per‑staff table and a summary footer with payments grand total.
2. Safeguards:

   * If a client name is missing in payments or treatments, handle gracefully with `0`.

   * Currency formatting uses PHP locale as elsewhere.
3. Realtime & Refresh:

   * Leverage existing realtime subscription `refreshPayments()` to keep dialog up to date.

## Validation

* Open Staff → View Totals; verify for clients with payments that the Payment Total and Difference show correctly.

* Confirm privacy mode masks names without breaking sums.

## Files

* `app/admin/page.tsx`: modify only the View Totals dialog content block.

## Rollback

* Revert the added columns and summary lines in the dialog if needed; no schema changes.

