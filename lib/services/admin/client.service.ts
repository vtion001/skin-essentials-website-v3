// Client Service
// Extracted from lib/admin-services.ts following SRP

import type { Client } from '@/lib/types/admin.types'
import { supabaseFetchClients } from '@/lib/supabase'

class ClientService {
    private clients: Client[] = []
    private initialized = false

    constructor() {
        if (typeof window !== 'undefined') {
            this.loadFromStorage()
        }
    }

    private loadFromStorage() {
        try {
            const stored = localStorage.getItem('clients_data')
            if (stored) {
                this.clients = JSON.parse(stored)
            } else {
                this.clients = this.getDefaultClients()
                fetch('/api/clients/state')
                    .then((res) => res.json())
                    .then((json) => {
                        if (Array.isArray(json.clients)) this.clients = json.clients
                        this.saveToStorage()
                    })
                    .catch(() => this.saveToStorage())
            }
            this.initialized = true
        } catch (error) {
            console.error('Error loading clients:', error)
            this.clients = this.getDefaultClients()
            this.initialized = true
        }
    }

    private saveToStorage() {
        try {
            localStorage.setItem('clients_data', JSON.stringify(this.clients))
            fetch('/api/clients/state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clients: this.clients }),
            }).catch(() => { })
        } catch (error) {
            console.error('Error saving clients:', error)
        }
    }

    private getDefaultClients(): Client[] {
        return [
            {
                id: 'client1',
                firstName: 'Sarah',
                lastName: 'Johnson',
                email: 'sarah@example.com',
                phone: '+1234567890',
                dateOfBirth: '1990-05-15',
                medicalHistory: ['No significant medical history'],
                allergies: ['None known'],
                preferences: {
                    communicationMethod: 'email',
                    reminderSettings: true,
                    marketingConsent: true,
                },
                source: 'website',
                status: 'active',
                totalSpent: 500,
                lastVisit: '2024-01-20',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'client2',
                firstName: 'Maria',
                lastName: 'Garcia',
                email: 'maria@example.com',
                phone: '+1234567891',
                dateOfBirth: '1985-08-22',
                medicalHistory: ['Hypertension'],
                allergies: ['Penicillin'],
                preferences: {
                    communicationMethod: 'sms',
                    reminderSettings: true,
                    marketingConsent: false,
                },
                source: 'referral',
                status: 'active',
                totalSpent: 1200,
                lastVisit: '2024-01-18',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ]
    }

    getAllClients(): Client[] {
        if (!this.initialized) this.loadFromStorage()
        return [...this.clients]
    }

    async fetchFromSupabase() {
        const rows = await supabaseFetchClients()
        if (!rows) return
        const toGender = (val: any): Client['gender'] | undefined => {
            if (!val) return undefined
            const s = String(val).toLowerCase().trim()
            if (s === 'male') return 'male'
            if (s === 'female') return 'female'
            if (s === 'other') return 'other'
            if (s === 'prefer-not-to-say' || s === 'prefer_not_to_say' || s === 'prefer not to say')
                return 'prefer-not-to-say'
            return undefined
        }
        const toStatus = (val: any): Client['status'] => {
            const s = String(val ?? '').toLowerCase().trim()
            if (s === 'active') return 'active'
            if (s === 'inactive') return 'inactive'
            if (s === 'blocked') return 'blocked'
            return 'active'
        }
        const toSource = (val: any): Client['source'] => {
            const s = String(val ?? '').toLowerCase().trim()
            if (s === 'website') return 'website'
            if (s === 'referral') return 'referral'
            if (s === 'facebook') return 'facebook'
            if (s === 'instagram') return 'instagram'
            if (s === 'tiktok') return 'tiktok'
            if (s === 'walk_in' || s === 'walk-in') return 'walk_in'
            if (s === 'social_media' || s === 'social-media') return 'social_media'
            return 'website'
        }
        const normalized: Client[] = rows.map((r: any) => ({
            id: String(r.id),
            firstName: String(r.first_name ?? ''),
            lastName: String(r.last_name ?? ''),
            email: String(r.email ?? ''),
            phone: String(r.phone ?? ''),
            dateOfBirth: r.date_of_birth ? String(r.date_of_birth) : undefined,
            gender: toGender(r.gender),
            address: r.address ? String(r.address) : undefined,
            emergencyContact: r.emergency_contact ?? undefined,
            medicalHistory: Array.isArray(r.medical_history) ? r.medical_history : [],
            allergies: Array.isArray(r.allergies) ? r.allergies : [],
            preferences: r.preferences ?? undefined,
            source: toSource(r.source ?? 'website'),
            status: toStatus(r.status ?? 'active'),
            totalSpent: Number(r.total_spent ?? 0),
            lastVisit: r.last_visit ? String(r.last_visit) : undefined,
            createdAt: String(r.created_at ?? new Date().toISOString()),
            updatedAt: String(r.updated_at ?? new Date().toISOString()),
            decryption_error: Boolean(r.decryption_error),
        }))
        this.clients = normalized
        this.saveToStorage()
    }

    getClientById(id: string): Client | undefined {
        return this.clients.find((client) => client.id === id)
    }

    addClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client {
        const newClient: Client = {
            ...client,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        this.clients.push(newClient)
        this.saveToStorage()
        return newClient
    }

    updateClient(id: string, updates: Partial<Client>): boolean {
        const index = this.clients.findIndex((client) => client.id === id)
        if (index === -1) return false

        this.clients[index] = {
            ...this.clients[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        }
        this.saveToStorage()
        return true
    }

    searchClients(query: string): Client[] {
        const lowercaseQuery = query.toLowerCase()
        return this.clients.filter(
            (client) =>
                client.firstName.toLowerCase().includes(lowercaseQuery) ||
                client.lastName.toLowerCase().includes(lowercaseQuery) ||
                client.email.toLowerCase().includes(lowercaseQuery) ||
                client.phone.includes(query)
        )
    }
}

export const clientService = new ClientService()
