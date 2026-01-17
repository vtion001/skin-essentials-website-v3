"use client"

import { useCallback } from "react"
import type { Payment } from "@/lib/types/admin.types"

interface UsePaymentHandlersProps {
    setPayments: (payments: Payment[]) => void
    setIsPaymentModalOpen: (open: boolean) => void
    setPaymentForm: (form: Partial<Payment> | ((prev: Partial<Payment>) => Partial<Payment>)) => void
    setSelectedPayment: (payment: Payment | null) => void
    showNotification: (type: "success" | "error" | "info", message: string) => void
    setIsLoading: (loading: boolean) => void
}

interface UsePaymentHandlersReturn {
    handlePaymentSubmit: (e: React.FormEvent, selectedPayment: Payment | null, paymentForm: Partial<Payment>) => Promise<void>
    openPaymentModal: (payment?: Payment) => void
    closePaymentModal: () => void
    deletePayment: (paymentId: string) => Promise<void>
}

/**
 * Hook for managing payment operations
 * Extracted from AdminDashboard to follow SRP
 */
export function usePaymentHandlers({
    setPayments,
    setIsPaymentModalOpen,
    setPaymentForm,
    setSelectedPayment,
    showNotification,
    setIsLoading,
}: UsePaymentHandlersProps): UsePaymentHandlersReturn {

    const handlePaymentSubmit = useCallback(async (
        e: React.FormEvent,
        selectedPayment: Payment | null,
        paymentForm: Partial<Payment>
    ) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const method = selectedPayment ? "PATCH" : "POST"
            const formEl = e.currentTarget as HTMLFormElement
            const fd = new FormData(formEl)

            const amountRaw = String(fd.get("amount") || "")
            const transactionId = String(fd.get("transactionId") || "")
            const notes = String(fd.get("notes") || "")

            const payloadBase = selectedPayment
                ? { id: selectedPayment.id, ...paymentForm }
                : paymentForm

            const payload = {
                ...payloadBase,
                amount: amountRaw ? parseFloat(amountRaw) : (payloadBase.amount || 0),
                transactionId,
                notes,
            }

            const res = await fetch("/api/admin/payments", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error("Failed to save payment")

            // Refresh payments list
            const listRes = await fetch("/api/admin/payments", { cache: "no-store" })
            const json = await listRes.json()
            setPayments(Array.isArray(json?.payments) ? json.payments : [])

            showNotification(
                "success",
                selectedPayment ? "Payment updated successfully!" : "Payment recorded successfully!"
            )

            setIsPaymentModalOpen(false)
            setPaymentForm({})
            setSelectedPayment(null)
        } catch (error) {
            const { reportError } = await import('@/lib/client-logger')
            reportError(error, { 
                context: 'admin_payment_submit_error', 
                meta: { selectedPayment, paymentForm } 
            })
            showNotification("error", "Failed to save payment")
        } finally {
            setIsLoading(false)
        }
    }, [setPayments, setIsPaymentModalOpen, setPaymentForm, setSelectedPayment, showNotification, setIsLoading])

    const openPaymentModal = useCallback((payment?: Payment) => {
        if (payment) {
            setSelectedPayment(payment)
            setPaymentForm(payment)
        } else {
            setSelectedPayment(null)
            setPaymentForm({})
        }
        setIsPaymentModalOpen(true)
    }, [setSelectedPayment, setPaymentForm, setIsPaymentModalOpen])

    const closePaymentModal = useCallback(() => {
        setIsPaymentModalOpen(false)
        setPaymentForm({})
        setSelectedPayment(null)
    }, [setIsPaymentModalOpen, setPaymentForm, setSelectedPayment])

    const deletePayment = useCallback(async (paymentId: string) => {
        setIsLoading(true)

        try {
            const res = await fetch("/api/admin/payments", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: paymentId }),
            })

            if (!res.ok) throw new Error("Failed to delete payment")

            // Refresh payments list
            const listRes = await fetch("/api/admin/payments", { cache: "no-store" })
            const json = await listRes.json()
            setPayments(Array.isArray(json?.payments) ? json.payments : [])

            showNotification("success", "Payment deleted successfully!")
        } catch (error) {
            const { reportError } = await import('@/lib/client-logger')
            reportError(error, { 
                context: 'admin_payment_delete_error', 
                meta: { paymentId } 
            })
            showNotification("error", "Failed to delete payment")
        } finally {
            setIsLoading(false)
        }
    }, [setPayments, showNotification, setIsLoading])

    return {
        handlePaymentSubmit,
        openPaymentModal,
        closePaymentModal,
        deletePayment,
    }
}
