// Staff Service
// Extracted from lib/admin-services.ts following SRP

import type { Staff } from '@/lib/types/admin.types'
import { supabaseFetchStaff } from '@/lib/supabase'

class StaffService {
    private staff: Staff[] = []
    private initialized = false

    constructor() {
        if (typeof window !== 'undefined') {
            this.loadFromStorage()
        }
    }

    private loadFromStorage() {
        try {
            const stored = localStorage.getItem('staff_data')
            if (stored) {
                this.staff = JSON.parse(stored)
            } else {
                this.staff = this.getDefaultStaff()
                this.saveToStorage()
            }
            this.initialized = true
        } catch (error) {
            console.error('Error loading staff:', error)
            this.staff = this.getDefaultStaff()
            this.initialized = true
        }
    }

    private saveToStorage() {
        try {
            localStorage.setItem('staff_data', JSON.stringify(this.staff))
        } catch (error) {
            console.error('Error saving staff:', error)
        }
    }

    async fetchFromSupabase() {
        const rows = await supabaseFetchStaff()
        if (!rows) return
        const existingMap = new Map<string, { procedure: string; clientName?: string; total: number }[]>(
            this.staff.map((s) => [s.id, Array.isArray(s.treatments) ? s.treatments : []])
        )
        const normalized: Staff[] = rows.map((r: any) => ({
            id: String(r.id),
            firstName: String(r.first_name ?? ''),
            lastName: String(r.last_name ?? ''),
            email: String(r.email ?? ''),
            phone: String(r.phone ?? ''),
            position: String(r.position ?? 'other') as Staff['position'],
            department: r.department ?? undefined,
            licenseNumber: r.license_number ?? undefined,
            specialties: Array.isArray(r.specialties) ? r.specialties : [],
            hireDate: String(r.hire_date ?? new Date().toISOString().slice(0, 10)),
            status: String(r.status ?? 'active') as Staff['status'],
            avatarUrl: r.avatar_url ?? undefined,
            notes: r.notes ?? undefined,
            treatments: Array.isArray(r.treatments) ? r.treatments : existingMap.get(String(r.id)) || [],
            createdAt: String(r.created_at ?? new Date().toISOString()),
            updatedAt: String(r.updated_at ?? new Date().toISOString()),
            decryption_error: Boolean(r.decryption_error),
        }))
        this.staff = normalized
        this.saveToStorage()
    }

    async syncLocalToSupabaseIfEmpty() {
        try {
            const res = await fetch('/api/admin/staff', { cache: 'no-store' })
            const json = await res.json()
            const existing = Array.isArray(json?.staff) ? json.staff : []
            if (existing.length === 0 && this.staff.length > 0) {
                for (const s of this.staff) {
                    const payload = {
                        id: s.id,
                        first_name: s.firstName,
                        last_name: s.lastName,
                        email: s.email,
                        phone: s.phone,
                        position: s.position,
                        department: s.department,
                        license_number: s.licenseNumber,
                        specialties: s.specialties,
                        hire_date: s.hireDate,
                        status: s.status,
                        avatar_url: s.avatarUrl,
                        notes: s.notes,
                    }
                    await fetch('/api/admin/staff', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    })
                }
            }
        } catch { }
    }

    private getDefaultStaff(): Staff[] {
        return [
            {
                id: 'staff1',
                firstName: 'Hanna',
                lastName: 'Reyes',
                email: 'hanna.reyes@example.com',
                phone: '+639171234567',
                position: 'surgeon_aesthetic',
                department: 'Aesthetic Surgery',
                licenseNumber: 'PRC-1234567',
                specialties: ['Rhinoplasty', 'Facial Contouring'],
                hireDate: new Date().toISOString().slice(0, 10),
                status: 'active',
                avatarUrl: undefined,
                notes: 'Senior aesthetic surgeon',
                treatments: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'staff2',
                firstName: 'Miguel',
                lastName: 'Santos',
                email: 'miguel.santos@example.com',
                phone: '+639181234567',
                position: 'anesthesiologist',
                department: 'Anesthesiology',
                licenseNumber: 'PRC-7654321',
                specialties: ['General Anesthesia', 'Sedation'],
                hireDate: new Date().toISOString().slice(0, 10),
                status: 'active',
                avatarUrl: undefined,
                notes: 'Available Tue/Thu',
                treatments: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ]
    }

    getAllStaff(): Staff[] {
        if (!this.initialized) this.loadFromStorage()
        return [...this.staff]
    }

    addStaff(staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Staff {
        const newStaff: Staff = {
            ...staff,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        this.staff.push(newStaff)
        this.saveToStorage()
        return newStaff
    }

    updateStaff(id: string, updates: Partial<Staff>): boolean {
        const index = this.staff.findIndex((s) => s.id === id)
        if (index === -1) return false
        this.staff[index] = { ...this.staff[index], ...updates, updatedAt: new Date().toISOString() }
        this.saveToStorage()
        return true
    }

    deleteStaff(id: string): boolean {
        const index = this.staff.findIndex((s) => s.id === id)
        if (index === -1) return false
        this.staff.splice(index, 1)
        this.saveToStorage()
        return true
    }

    searchStaff(query: string): Staff[] {
        const q = query.toLowerCase()
        return this.getAllStaff().filter(
            (s) =>
                s.firstName.toLowerCase().includes(q) ||
                s.lastName.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q) ||
                s.phone.includes(query) ||
                s.position.toLowerCase().includes(q) ||
                (s.department ?? '').toLowerCase().includes(q)
        )
    }
}

export const staffService = new StaffService()
