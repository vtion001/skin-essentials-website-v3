"use client"

import { useCallback } from "react"
import type { Influencer, ReferralRecord } from "@/lib/types/admin.types"
import { influencerService } from "@/lib/services/admin"

interface UseInfluencerHandlersProps {
    setInfluencers: (influencers: Influencer[]) => void
    setIsInfluencerModalOpen: (open: boolean) => void
    setInfluencerForm: (form: Partial<Influencer> | ((prev: Partial<Influencer>) => Partial<Influencer>)) => void
    setSelectedInfluencer: (influencer: Influencer | null) => void
    setIsReferralModalOpen: (open: boolean) => void
    setReferralForm: (form: Partial<ReferralRecord> | ((prev: Partial<ReferralRecord>) => Partial<ReferralRecord>)) => void
    showNotification: (type: "success" | "error" | "info", message: string) => void
    setIsLoading: (loading: boolean) => void
}

interface UseInfluencerHandlersReturn {
    handleInfluencerSubmit: (
        e: React.FormEvent,
        selectedInfluencer: Influencer | null,
        influencerForm: Partial<Influencer>
    ) => Promise<void>
    handleReferralSubmit: (
        e: React.FormEvent,
        selectedInfluencer: Influencer | null,
        referralForm: Partial<ReferralRecord>
    ) => Promise<void>
    openInfluencerModal: (influencer?: Influencer) => void
    closeInfluencerModal: () => void
    openReferralModal: (influencer: Influencer) => void
    closeReferralModal: () => void
    deleteInfluencer: (influencerId: string) => Promise<void>
}

/**
 * Hook for managing influencer and referral operations
 * Extracted from AdminDashboard to follow SRP
 */
export function useInfluencerHandlers({
    setInfluencers,
    setIsInfluencerModalOpen,
    setInfluencerForm,
    setSelectedInfluencer,
    setIsReferralModalOpen,
    setReferralForm,
    showNotification,
    setIsLoading,
}: UseInfluencerHandlersProps): UseInfluencerHandlersReturn {

    const handleInfluencerSubmit = useCallback(async (
        e: React.FormEvent,
        selectedInfluencer: Influencer | null,
        influencerForm: Partial<Influencer>
    ) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (!influencerForm.name || !influencerForm.platform) {
                showNotification("error", "Please fill required fields")
                setIsLoading(false)
                return
            }

            const method = selectedInfluencer ? "PATCH" : "POST"
            const payload = selectedInfluencer
                ? { id: selectedInfluencer.id, ...influencerForm }
                : influencerForm

            const res = await fetch("/api/admin/influencers", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error("Failed to save influencer")

            // Refresh influencers list
            await influencerService.fetchFromSupabase?.()
            setInfluencers(influencerService.getAllInfluencers())

            showNotification(
                "success",
                selectedInfluencer
                    ? "Influencer updated successfully!"
                    : "Influencer added successfully!"
            )

            // Log Activity
            const { logActivity } = await import('@/lib/audit-logger')
            await logActivity(
                selectedInfluencer ? 'UPDATE_INFLUENCER' : 'CREATE_INFLUENCER',
                'Partnerships',
                { 
                    id: selectedInfluencer?.id || 'new', 
                    name: influencerForm.name,
                    platform: influencerForm.platform
                }
            )

            setIsInfluencerModalOpen(false)
            setSelectedInfluencer(null)
            setInfluencerForm({ commissionRate: 0.10, status: "active" })
        } catch (error) {
            const { reportError } = await import('@/lib/client-logger')
            reportError(error, { 
                context: 'admin_influencer_submit_error', 
                meta: { selectedInfluencer, influencerForm } 
            })
            showNotification("error", "Failed to save influencer")
        } finally {
            setIsLoading(false)
        }
    }, [
        setInfluencers,
        setIsInfluencerModalOpen,
        setInfluencerForm,
        setSelectedInfluencer,
        showNotification,
        setIsLoading,
    ])

    const handleReferralSubmit = useCallback(async (
        e: React.FormEvent,
        selectedInfluencer: Influencer | null,
        referralForm: Partial<ReferralRecord>
    ) => {
        e.preventDefault()

        if (!selectedInfluencer) return

        setIsLoading(true)

        try {
            if (!referralForm.clientName || !referralForm.amount || !referralForm.date) {
                showNotification("error", "Please fill referral details")
                setIsLoading(false)
                return
            }

            const payload = {
                influencer_id: selectedInfluencer.id,
                client_name: referralForm.clientName,
                amount: Number(referralForm.amount),
                date: referralForm.date,
                notes: referralForm.notes,
            }

            const res = await fetch("/api/admin/influencer-referrals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error("Failed to save referral")

            // Refresh influencers list
            await influencerService.fetchFromSupabase?.()
            setInfluencers(influencerService.getAllInfluencers())

            showNotification("success", "Referral recorded successfully!")
            setIsReferralModalOpen(false)
            setReferralForm({})

            // Log Activity
            const { logActivity } = await import('@/lib/audit-logger')
            await logActivity('RECORD_REFERRAL', 'Partnerships', { 
                influencerId: selectedInfluencer.id, 
                amount: payload.amount,
                client: payload.client_name
            })
        } catch (error) {
            const { reportError } = await import('@/lib/client-logger')
            reportError(error, { 
                context: 'admin_referral_submit_error', 
                meta: { selectedInfluencer, referralForm } 
            })
            showNotification("error", "Failed to save referral")
        } finally {
            setIsLoading(false)
        }
    }, [
        setInfluencers,
        setIsReferralModalOpen,
        setReferralForm,
        showNotification,
        setIsLoading,
    ])

    const openInfluencerModal = useCallback((influencer?: Influencer) => {
        if (influencer) {
            setSelectedInfluencer(influencer)
            setInfluencerForm(influencer)
        } else {
            setSelectedInfluencer(null)
            setInfluencerForm({ commissionRate: 0.10, status: "active" })
        }
        setIsInfluencerModalOpen(true)
    }, [setSelectedInfluencer, setInfluencerForm, setIsInfluencerModalOpen])

    const closeInfluencerModal = useCallback(() => {
        setIsInfluencerModalOpen(false)
        setInfluencerForm({ commissionRate: 0.10, status: "active" })
        setSelectedInfluencer(null)
    }, [setIsInfluencerModalOpen, setInfluencerForm, setSelectedInfluencer])

    const openReferralModal = useCallback((influencer: Influencer) => {
        setSelectedInfluencer(influencer)
        setReferralForm({})
        setIsReferralModalOpen(true)
    }, [setSelectedInfluencer, setReferralForm, setIsReferralModalOpen])

    const closeReferralModal = useCallback(() => {
        setIsReferralModalOpen(false)
        setReferralForm({})
    }, [setIsReferralModalOpen, setReferralForm])

    const deleteInfluencer = useCallback(async (influencerId: string) => {
        setIsLoading(true)

        try {
            const res = await fetch("/api/admin/influencers", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: influencerId }),
            })

            if (!res.ok) throw new Error("Failed to delete influencer")

            await influencerService.fetchFromSupabase?.()
            setInfluencers(influencerService.getAllInfluencers())
            showNotification("success", "Influencer deleted successfully!")

            // Log Activity
            const { logActivity } = await import('@/lib/audit-logger')
            await logActivity('DELETE_INFLUENCER', 'Partnerships', { id: influencerId })
        } catch (error) {
            const { reportError } = await import('@/lib/client-logger')
            reportError(error, { 
                context: 'admin_influencer_delete_error', 
                meta: { influencerId } 
            })
            showNotification("error", "Failed to delete influencer")
        } finally {
            setIsLoading(false)
        }
    }, [setInfluencers, showNotification, setIsLoading])

    return {
        handleInfluencerSubmit,
        handleReferralSubmit,
        openInfluencerModal,
        closeInfluencerModal,
        openReferralModal,
        closeReferralModal,
        deleteInfluencer,
    }
}
