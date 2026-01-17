"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from "react"
import type {
    NotificationType,
    Notification,
    AdminTabKey,
    ClientRevealState,
    InfluencerRevealState,
} from "../_types/admin.types"
import type {
    Payment,
    MedicalRecord,
    Client,
    SocialMessage,
    Staff,
    Influencer,
    ReferralRecord,
    Appointment,
} from "@/lib/admin-services"
import type { PortfolioItem } from "@/lib/types/api.types"

// ================================
// Context Value Interface
// ================================

interface AdminContextValue {
    // Core UI State
    activeTab: AdminTabKey
    setActiveTab: (tab: AdminTabKey) => void
    isLoading: boolean
    setIsLoading: (loading: boolean) => void

    // Notification System
    notification: Notification | null
    showNotification: (type: NotificationType, message: string) => void
    clearNotification: () => void

    // Privacy Mode
    privacyMode: boolean
    setPrivacyMode: (value: boolean | ((prev: boolean) => boolean)) => void
    clientReveal: ClientRevealState
    setClientReveal: React.Dispatch<React.SetStateAction<ClientRevealState>>
    influencerReveal: InfluencerRevealState
    setInfluencerReveal: React.Dispatch<React.SetStateAction<InfluencerRevealState>>

    // Modal States
    modals: {
        payment: boolean
        medicalRecord: boolean
        client: boolean
        socialReply: boolean
        staff: boolean
        influencer: boolean
        referral: boolean
        profileSettings: boolean
    }
    openModal: (modal: keyof AdminContextValue["modals"]) => void
    closeModal: (modal: keyof AdminContextValue["modals"]) => void

    // Selected Items
    selected: {
        payment: Payment | null
        medicalRecord: MedicalRecord | null
        client: Client | null
        message: SocialMessage | null
        staff: Staff | null
        influencer: Influencer | null
    }
    setSelected: <K extends keyof AdminContextValue["selected"]>(
        key: K,
        value: AdminContextValue["selected"][K]
    ) => void
}

// ================================
// Context Creation
// ================================

const AdminContext = createContext<AdminContextValue | null>(null)

// ================================
// Hook for consuming context
// ================================

export function useAdminContext(): AdminContextValue {
    const context = useContext(AdminContext)
    if (!context) {
        throw new Error("useAdminContext must be used within AdminProvider")
    }
    return context
}

// ================================
// Provider Component
// ================================

interface AdminProviderProps {
    children: React.ReactNode
}

export function AdminProvider({ children }: AdminProviderProps) {
    // Core UI State
    const [activeTab, setActiveTabState] = useState<AdminTabKey>("dashboard")
    const [isLoading, setIsLoading] = useState(false)

    // Notification State
    const [notification, setNotification] = useState<Notification | null>(null)

    // Privacy Mode
    const [privacyMode, setPrivacyMode] = useState(false)
    const [clientReveal, setClientReveal] = useState<ClientRevealState>({
        name: false,
        email: false,
        phone: false,
        address: false,
    })
    const [influencerReveal, setInfluencerReveal] = useState<InfluencerRevealState>({
        referralCode: false,
        email: false,
        phone: false,
    })

    // Modal States
    const [modals, setModals] = useState({
        payment: false,
        medicalRecord: false,
        client: false,
        socialReply: false,
        staff: false,
        influencer: false,
        referral: false,
        profileSettings: false,
    })

    // Selected Items
    const [selected, setSelectedState] = useState<AdminContextValue["selected"]>({
        payment: null,
        medicalRecord: null,
        client: null,
        message: null,
        staff: null,
        influencer: null,
    })

    // ================================
    // Callbacks
    // ================================

    const setActiveTab = useCallback((tab: AdminTabKey) => {
        setActiveTabState(tab)
    }, [])

    const showNotification = useCallback((type: NotificationType, message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 5000)
    }, [])

    const clearNotification = useCallback(() => {
        setNotification(null)
    }, [])

    const openModal = useCallback((modal: keyof typeof modals) => {
        setModals((prev) => ({ ...prev, [modal]: true }))
    }, [])

    const closeModal = useCallback((modal: keyof typeof modals) => {
        setModals((prev) => ({ ...prev, [modal]: false }))
    }, [])

    const setSelected = useCallback(<K extends keyof AdminContextValue["selected"]>(
        key: K,
        value: AdminContextValue["selected"][K]
    ) => {
        setSelectedState((prev) => ({ ...prev, [key]: value }))
    }, [])

    // ================================
    // Memoized Context Value
    // ================================

    const value = useMemo<AdminContextValue>(() => ({
        activeTab,
        setActiveTab,
        isLoading,
        setIsLoading,
        notification,
        showNotification,
        clearNotification,
        privacyMode,
        setPrivacyMode,
        clientReveal,
        setClientReveal,
        influencerReveal,
        setInfluencerReveal,
        modals,
        openModal,
        closeModal,
        selected,
        setSelected,
    }), [
        activeTab,
        setActiveTab,
        isLoading,
        notification,
        showNotification,
        clearNotification,
        privacyMode,
        clientReveal,
        influencerReveal,
        modals,
        openModal,
        closeModal,
        selected,
        setSelected,
    ])

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    )
}

// ================================
// Export Context for advanced use
// ================================

export { AdminContext }
