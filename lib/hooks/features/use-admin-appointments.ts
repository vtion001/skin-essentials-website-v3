import { useState, useCallback, useEffect } from "react"
import { Appointment } from "@/lib/types/admin.types"
import { appointmentService } from "@/lib/services/admin/appointment.service"

interface Notification {
    type: "success" | "error" | "info"
    message: string
}

export function useAdminAppointments(showNotification: (type: "success" | "error" | "info", message: string) => void) {
    // Initialize lazily to avoid synchronous setState in useEffect
    const [appointments, setAppointments] = useState<Appointment[]>(() => {
        if (typeof window !== 'undefined') {
            return appointmentService.getAllAppointments()
        }
        return []
    })
    const [isLoading, setIsLoading] = useState(false)

    const loadAppointments = useCallback(() => {
        setAppointments(appointmentService.getAllAppointments())
    }, [])

    // Initial load - sync with Supabase
    useEffect(() => {
        // Determine if we need to sync with Supabase (this is async)
        appointmentService.fetchFromSupabase().then(() => {
            loadAppointments()
        })
    }, [loadAppointments])

    const handleUpdateStatus = async (id: string, newStatus: Appointment['status']) => {
        try {
            const res = await appointmentService.updateAppointment(id, { status: newStatus })
            if (res.ok) {
                loadAppointments()
                showNotification('success', `Status updated to ${newStatus}`)
            } else {
                showNotification('error', res.error || 'Failed to update status')
            }
        } catch (error) {
            showNotification('error', 'Failed to update status')
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch('/api/admin/appointments', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
            if (res.ok) {
                showNotification('success', 'Appointment deleted successfully')
                loadAppointments()
                return true
            } else {
                const data = await res.json()
                showNotification('error', data.error || 'Failed to delete appointment')
                return false
            }
        } catch (error) {
            showNotification('error', 'Network error occurred')
            return false
        }
    }

    const handleViberNotify = async (appointment: Appointment) => {
        try {
            showNotification('info', 'Sending Viber notification...')
            const res = await fetch('/api/admin/viber', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointment })
            })
            const data = await res.json()
            if (res.ok) {
                showNotification('success', 'Viber notification sent!')
            } else {
                showNotification('error', data.error || 'Failed to send Viber notification')
            }
        } catch (error) {
            showNotification('error', 'Network error occurred')
        }
    }

    return {
        appointments,
        setAppointments,
        isLoading,
        setIsLoading,
        loadAppointments,
        handleUpdateStatus,
        handleDelete,
        handleViberNotify
    }
}
