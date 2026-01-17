/**
 * Admin Dashboard Types
 * Consolidated type definitions for the admin module
 */

import type {
    Appointment,
    Payment,
    MedicalRecord,
    Client,
    SocialMessage,
    Staff,
    Influencer,
    ReferralRecord,
} from "@/lib/admin-services"
import type { PortfolioItem } from "@/lib/types/api.types"
import type { Service, ServiceCategory } from "@/lib/services-data"

// ================================
// Notification Types
// ================================

export type NotificationType = "success" | "error" | "info"

export interface Notification {
    type: NotificationType
    message: string
}

// ================================
// Modal State Types
// ================================

export interface AdminModalState {
    isPaymentModalOpen: boolean
    isMedicalRecordModalOpen: boolean
    isClientModalOpen: boolean
    isSocialReplyModalOpen: boolean
    isStaffModalOpen: boolean
    isInfluencerModalOpen: boolean
    isReferralModalOpen: boolean
    isProfileSettingsOpen: boolean
    isServiceEditOpen: boolean
    isCategoryEditOpen: boolean
}

// ================================
// Selected Item Types
// ================================

export interface AdminSelectedItems {
    selectedPayment: Payment | null
    selectedMedicalRecord: MedicalRecord | null
    selectedClient: Client | null
    selectedMessage: SocialMessage | null
    selectedStaff: Staff | null
    selectedInfluencer: Influencer | null
}

// ================================
// Form State Types
// ================================

export interface AdminFormState {
    paymentForm: Partial<Payment>
    medicalRecordForm: Partial<MedicalRecord>
    clientForm: Partial<Client>
    staffForm: Partial<Staff>
    influencerForm: Partial<Influencer>
    referralForm: Partial<ReferralRecord>
    portfolioForm: Partial<PortfolioItem>
}

// ================================
// Privacy & Reveal State
// ================================

export interface ClientRevealState {
    name: boolean
    email: boolean
    phone: boolean
    address: boolean
}

export interface InfluencerRevealState {
    referralCode: boolean
    email: boolean
    phone: boolean
}

// ================================
// Content Management Types
// ================================

export interface ContentCategory {
    id: string
    category: string
    description?: string
    image?: string
    color?: string
    services: Service[]
}

export interface NewCategoryForm {
    category: string
    description?: string
    image?: string
    color?: string
}

export interface NewServiceForm {
    name: string
    price: string
    description: string
    duration?: string
    results?: string
    image?: string
}

export interface ServiceEditForm {
    name: string
    price: string
    description: string
    duration?: string
    results?: string
    sessions?: string
    includes?: string
    originalPrice?: string
    badge?: string
    pricing?: string
    image?: string
    benefits?: string[]
    faqs?: { q: string; a: string }[]
}

export interface CategoryEditForm {
    category?: string
    description?: string
    image?: string
    color?: string
}

// ================================
// Staff Treatment Types
// ================================

export interface StaffTreatmentForm {
    procedure: string
    clientName?: string
    total: number
    date?: string
}

// ================================
// Add Result Form Type
// ================================

export interface AddResultForm {
    beforeImage: string
    afterImage: string
}

// ================================
// Tab Constants
// ================================

export type AdminTabKey =
    | "dashboard"
    | "appointments"
    | "payments"
    | "medical"
    | "clients"
    | "staff"
    | "social"
    | "content"
    | "email"
    | "sms"
    | "influencers"
    | "analytics"
    | "audit-logs"

export const ADMIN_TABS: { key: AdminTabKey; label: string }[] = [
    { key: "dashboard", label: "Overview" },
    { key: "appointments", label: "Bookings" },
    { key: "payments", label: "Financials" },
    { key: "medical", label: "Medical Records" },
    { key: "clients", label: "Client Base" },
    { key: "staff", label: "Team" },
    { key: "social", label: "Communications" },
    { key: "content", label: "Media & Assets" },
    { key: "email", label: "Automations" },
    { key: "sms", label: "SMS Gateway" },
    { key: "influencers", label: "Partnerships" },
    { key: "analytics", label: "Performance" },
    { key: "audit-logs", label: "Audit Trails" },
]

// ================================
// Export Re-exports
// ================================

export type {
    Appointment,
    Payment,
    MedicalRecord,
    Client,
    SocialMessage,
    Staff,
    Influencer,
    ReferralRecord,
    PortfolioItem,
    Service,
    ServiceCategory,
}
