/**
 * Staff Tab Module
 * Barrel export for all staff-related components
 */

export { StaffFilters } from "./StaffFilters"
export { StaffTable } from "./StaffTable"

// Types
export interface TreatmentFormItem {
    date?: string
    procedure: string
    clientName?: string
    clientId?: string
    total: number
}
