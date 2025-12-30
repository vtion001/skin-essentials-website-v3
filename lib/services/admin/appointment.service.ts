// Appointment Service
// Extracted from lib/admin-services.ts following SRP

import type { Appointment } from '@/lib/types/admin.types'
import {
    supabaseAvailable,
    supabaseFetchAppointments,
    supabaseInsertAppointment,
    supabaseUpdateAppointment,
    supabaseDeleteAppointment,
} from '@/lib/supabase'

class AppointmentService {
    private appointments: Appointment[] = []
    private initialized = false

    constructor() {
        if (typeof window !== 'undefined') {
            this.loadFromStorage()
        }
    }

    private loadFromStorage() {
        try {
            const stored = localStorage.getItem('appointments_data')
            if (stored) {
                this.appointments = JSON.parse(stored)
            } else {
                this.appointments = this.getDefaultAppointments()
                this.saveToStorage()
            }
            this.initialized = true
        } catch (error) {
            console.error('Error loading appointments:', error)
            this.appointments = this.getDefaultAppointments()
            this.initialized = true
        }
        // Try to hydrate from Supabase asynchronously
        this.fetchFromSupabase().catch(() => { })
    }

    private saveToStorage() {
        try {
            localStorage.setItem('appointments_data', JSON.stringify(this.appointments))
        } catch (error) {
            console.error('Error saving appointments:', error)
        }
    }

    private getDefaultAppointments(): Appointment[] {
        return [
            {
                id: '1',
                clientId: 'client1',
                clientName: 'Sarah Johnson',
                clientEmail: 'sarah@example.com',
                clientPhone: '+1234567890',
                service: 'Dermal Fillers - Lip Enhancement',
                date: '2024-01-25',
                time: '10:00',
                status: 'scheduled',
                duration: 60,
                price: 500,
                notes: 'First time client, consultation included',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: '2',
                clientId: 'client2',
                clientName: 'Maria Garcia',
                clientEmail: 'maria@example.com',
                clientPhone: '+1234567891',
                service: 'Botox - Wrinkle Reduction',
                date: '2024-01-26',
                time: '14:00',
                status: 'confirmed',
                duration: 45,
                price: 350,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ]
    }

    getAllAppointments(): Appointment[] {
        if (!this.initialized) this.loadFromStorage()
        return [...this.appointments]
    }

    async fetchFromSupabase() {
        if (!supabaseAvailable()) return
        const rows = await supabaseFetchAppointments()
        if (!rows) return
        // Normalize rows to Appointment shape
        const normalized: Appointment[] = rows.map((r: any) => ({
            id: String(r.id),
            clientId: String(r.client_id ?? r.clientId ?? ''),
            clientName: String(r.client_name ?? r.clientName ?? ''),
            clientEmail: String(r.client_email ?? r.clientEmail ?? ''),
            clientPhone: String(r.client_phone ?? r.clientPhone ?? ''),
            service: String(r.service),
            date: String(r.date),
            time: String(r.time),
            status: (r.status ?? 'scheduled') as Appointment['status'],
            notes: r.notes ?? '',
            duration: Number(r.duration ?? 60),
            price: Number(r.price ?? 0),
            createdAt: String(r.created_at ?? r.createdAt ?? new Date().toISOString()),
            updatedAt: String(r.updated_at ?? r.updatedAt ?? new Date().toISOString()),
        }))
        this.appointments = normalized
        this.saveToStorage()
    }

    async syncLocalToSupabaseIfEmpty() {
        if (!supabaseAvailable()) return
        const rows = await supabaseFetchAppointments()
        if (!rows || rows.length > 0) return
        const payloads = this.appointments.map((a) => ({
            id: a.id,
            client_id: a.clientId,
            client_name: a.clientName,
            client_email: a.clientEmail,
            client_phone: a.clientPhone,
            service: a.service,
            date: a.date,
            time: a.time,
            status: a.status,
            notes: a.notes,
            duration: a.duration,
            price: a.price,
            created_at: a.createdAt,
            updated_at: a.updatedAt,
        }))
        await Promise.all(payloads.map((p) => supabaseInsertAppointment(p).catch(() => false)))
    }

    getAppointmentsByDate(date: string): Appointment[] {
        return this.appointments.filter((apt) => apt.date === date)
    }

    async addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ ok: boolean, data?: Appointment, error?: string }> {
        const newAppointment: Appointment = {
            ...appointment,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        const row = {
            id: newAppointment.id,
            client_id: newAppointment.clientId,
            client_name: newAppointment.clientName,
            client_email: newAppointment.clientEmail,
            client_phone: newAppointment.clientPhone,
            service: newAppointment.service,
            date: newAppointment.date,
            time: newAppointment.time,
            status: newAppointment.status,
            notes: newAppointment.notes,
            duration: newAppointment.duration,
            price: newAppointment.price,
            created_at: newAppointment.createdAt,
            updated_at: newAppointment.updatedAt,
        }

        try {
            const res = await fetch('/api/admin/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(row),
            })

            const json = await res.json()
            if (!res.ok) {
                return { ok: false, error: json.error || 'Failed to save appointment' }
            }

            this.appointments.push(newAppointment)
            this.saveToStorage()
            return { ok: true, data: newAppointment }
        } catch (err) {
            return { ok: false, error: 'Network error' }
        }
    }

    async updateAppointment(id: string, updates: Partial<Appointment>): Promise<{ ok: boolean, error?: string }> {
        const index = this.appointments.findIndex((apt) => apt.id === id)
        if (index === -1) return { ok: false, error: 'Appointment not found' }

        const normalized = {
            client_id: updates?.clientId,
            client_name: updates?.clientName,
            client_email: updates?.clientEmail,
            client_phone: updates?.clientPhone,
            service: updates?.service,
            date: updates?.date,
            time: updates?.time,
            status: updates?.status,
            notes: updates?.notes,
            duration: updates?.duration,
            price: updates?.price,
            updated_at: new Date().toISOString(),
        }

        try {
            const res = await fetch('/api/admin/appointments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, updates: normalized }),
            })

            const json = await res.json()
            if (!res.ok) {
                return { ok: false, error: json.error || 'Failed to update appointment' }
            }

            this.appointments[index] = {
                ...this.appointments[index],
                ...updates,
                updatedAt: normalized.updated_at,
            }
            this.saveToStorage()
            return { ok: true }
        } catch (err) {
            return { ok: false, error: 'Network error' }
        }
    }

    deleteAppointment(id: string): boolean {
        const index = this.appointments.findIndex((apt) => apt.id === id)
        if (index === -1) return false

        this.appointments.splice(index, 1)
        this.saveToStorage()
        supabaseDeleteAppointment(id).catch(() => { })
        return true
    }

    getAvailableTimeSlots(date: string): string[] {
        const bookedSlots = this.getAppointmentsByDate(date).map((apt) => apt.time)
        const allSlots = [
            '09:00',
            '09:30',
            '10:00',
            '10:30',
            '11:00',
            '11:30',
            '12:00',
            '12:30',
            '13:00',
            '13:30',
            '14:00',
            '14:30',
            '15:00',
            '15:30',
            '16:00',
            '16:30',
            '17:00',
            '17:30',
        ]
        return allSlots.filter((slot) => !bookedSlots.includes(slot))
    }
}

export const appointmentService = new AppointmentService()
