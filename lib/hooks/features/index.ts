/**
 * Feature Hooks Barrel Export
 * 
 * These hooks were extracted from the AdminDashboard component
 * to follow the Single Responsibility Principle (SRP).
 * 
 * Each hook manages a specific domain's operations.
 */

// Appointments
export { useAdminAppointments } from "./use-admin-appointments"

// Camera & Photo Capture
export { useCameraCapture } from "./use-camera-capture"

// Client Management
export { useClientHandlers } from "./use-client-handlers"

// Influencer Management
export { useInfluencerHandlers } from "./use-influencer-handlers"

// Medical Records
export { useMedicalRecordHandlers } from "./use-medical-record-handlers"

// Payment Management
export { usePaymentHandlers } from "./use-payment-handlers"

// Portfolio Management
export { usePortfolioHandlers } from "./use-portfolio-handlers"

// Staff Management
export { useStaffHandlers } from "./use-staff-handlers"
