import { useState, useCallback, useEffect } from "react"
import { Appointment } from "@/lib/types/admin.types"
import { AppointmentRow } from "@/lib/types/database.types"
import { formatSms } from "@/lib/sms-templates"
import {
    createAppointmentAction,
    updateAppointmentAction,
    deleteAppointmentAction,
    getAppointmentsAction
} from "@/app/actions/appointment"

export function useAdminAppointments(showNotification: (type: "success" | "error" | "info", message: string) => void) {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAppointment, setEditingAppointment] = useState<Partial<Appointment> | null>(null)

    const loadAppointments = useCallback(async () => {
        const res = await getAppointmentsAction()
        if (res.success && res.data) {
            // Normalize database rows to frontend types
            const normalized: Appointment[] = (res.data as AppointmentRow[]).map((r: AppointmentRow) => ({
                id: r.id,
                clientId: r.client_id,
                clientName: r.client_name,
                clientEmail: r.client_email,
                clientPhone: r.client_phone,
                service: r.service,
                date: r.date,
                time: r.time,
                status: r.status,
                notes: r.notes ?? '',
                duration: r.duration,
                price: r.price,
                createdAt: r.created_at,
                updatedAt: r.updated_at,
            }))
            setAppointments(normalized)
        }
    }, [])

    const openModal = (appointment?: Partial<Appointment>) => {
        setEditingAppointment(appointment || null)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setEditingAppointment(null)
        setIsModalOpen(false)
    }

    // Initial load
    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        loadAppointments()
    }, [loadAppointments])

    const createAppointment = async (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const res = await createAppointmentAction(data)
            if (res.success) {
                            showNotification('success', 'Appointment created successfully')
                            loadAppointments()
                
                            // Log Activity
                            const { logActivity } = await import('@/lib/audit-logger')
                            await logActivity('CREATE_APPOINTMENT', 'Booking Management', { 
                                name: data.clientName, 
                                service: data.service, 
                                date: data.date, 
                                time: data.time 
                            });
                            return true;
            } else {
                console.error('Create Appointment Error:', res.error)
                showNotification('error', res.error || 'Failed to create appointment')
                return false
            }
        } catch (error) {
            showNotification('error', 'Failed to create appointment')
            return false
        }
    }

    const handleUpdateStatus = async (id: string, newStatus: Appointment['status']) => {
        try {
            const res = await updateAppointmentAction(id, { status: newStatus })
            if (res.success) {
                loadAppointments()

                // Log Activity
                const { logActivity } = await import('@/lib/audit-logger')
                await logActivity('UPDATE_APPOINTMENT_STATUS', 'Booking Management', { id, status: newStatus })
                
                showNotification('success', `Status updated to ${newStatus}`)

                // Trigger SMS if confirmed or scheduled
                if (newStatus === 'confirmed' || newStatus === 'scheduled') {
                    const appointment = appointments.find(a => a.id === id)
                    if (appointment && appointment.clientPhone) {
                        const dateStr = new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        let message = ''

                        if (newStatus === 'confirmed') {
                            message = formatSms('APPOINTMENT_CONFIRMED', {
                                name: appointment.clientName,
                                service: appointment.service,
                                date: dateStr,
                                time: appointment.time
                            })
                        } else {
                            message = formatSms('APPOINTMENT_RECEIVED', {
                                name: appointment.clientName,
                                service: appointment.service,
                                date: dateStr,
                                time: appointment.time
                            })
                        }

                        // Non-blocking SMS call
                        fetch('/api/admin/sms/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                phoneNumber: appointment.clientPhone,
                                message: message
                            })
                        }).then(r => r.json()).then(data => {
                            if (data.ok) showNotification('success', `${newStatus === 'confirmed' ? 'Confirmation' : 'Received'} SMS sent`)
                            else console.error('Failed to send SMS:', data.error)
                        }).catch(e => console.error('SMS Network Error:', e))
                    }
                }
            } else {
                showNotification('error', res.error || 'Failed to update status')
            }
        } catch (error) {
            showNotification('error', 'Failed to update status')
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await deleteAppointmentAction(id)
            if (res.success) {
                showNotification('success', 'Appointment deleted successfully')
                setAppointments(prev => prev.filter(a => a.id !== id))

                // Log Activity
                const { logActivity } = await import('@/lib/audit-logger')
                await logActivity('DELETE_APPOINTMENT', 'Booking Management', { id })
                
                return true
            } else {
                showNotification('error', res.error || 'Failed to delete appointment')
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

    const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
        try {
            const res = await updateAppointmentAction(id, updates)
            if (res.success) {
                loadAppointments()
                return true
            } else {
                console.error('Update Appointment Error:', res.error)
                showNotification('error', res.error || 'Failed to update appointment')
                return false
            }
        } catch (error) {
            showNotification('error', 'Failed to update appointment')
            return false
        }
    }

    const getAvailableTimeSlots = (date: string) => {
        const bookedSlots = appointments
            .filter(apt => apt.date === date && apt.status !== 'cancelled' && apt.status !== 'no-show')
            .map(apt => apt.time)

        const allSlots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
            '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
        ]

        return allSlots.filter(slot => !bookedSlots.includes(slot))
    }

    return {
        appointments,
        setAppointments,
        isLoading,
        setIsLoading,
        loadAppointments,
        createAppointment,
        updateAppointment,
        handleUpdateStatus,
        handleDelete,
        handleViberNotify,
        getAvailableTimeSlots,
        isModalOpen,
        openModal,
        closeModal,
        editingAppointment
    }
}
