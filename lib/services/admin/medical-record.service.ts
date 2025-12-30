// Medical Record Service
// Extracted from lib/admin-services.ts following SRP

import type { MedicalRecord } from '@/lib/types/admin.types'
import { supabaseAvailable, supabaseFetchMedicalRecords } from '@/lib/supabase'

class MedicalRecordService {
    private records: MedicalRecord[] = []
    private initialized = false

    constructor() {
        if (typeof window !== 'undefined') {
            this.loadFromStorage()
        }
    }

    async fetchFromSupabase() {
        if (!supabaseAvailable()) return
        const rows = await supabaseFetchMedicalRecords()
        this.initialized = true
        if (!rows) return
        const normalized: MedicalRecord[] = rows.map((r: any) => ({
            id: String(r.id || ''),
            clientId: String(r.client_id || r.clientId || ''),
            appointmentId: r.appointment_id || r.appointmentId || undefined,
            date: String(r.date || ''),
            chiefComplaint: String(r.chief_complaint || r.chiefComplaint || ''),
            medicalHistory: Array.isArray(r.medical_history || r.medicalHistory)
                ? r.medical_history || r.medicalHistory
                : [],
            allergies: Array.isArray(r.allergies) ? r.allergies : [],
            currentMedications: Array.isArray(r.current_medications || r.currentMedications)
                ? r.current_medications || r.currentMedications
                : [],
            treatmentPlan: String(r.treatment_plan || r.treatmentPlan || ''),
            notes: String(r.notes || ''),
            attachments: Array.isArray(r.attachments) ? r.attachments : [],
            createdBy: String(r.created_by || r.createdBy || ''),
            createdAt: String(r.created_at || r.createdAt || new Date().toISOString()),
            updatedAt: String(r.updated_at || r.updatedAt || new Date().toISOString()),
            isConfidential: Boolean(r.is_confidential ?? r.isConfidential ?? false),
            treatments: Array.isArray(r.treatments) ? r.treatments : [],
        }))
        this.records = normalized
        this.saveToStorage()
    }

    async syncLocalToSupabaseIfEmpty() {
        if (!supabaseAvailable()) return
        const rows = await supabaseFetchMedicalRecords()
        if (!rows || rows.length > 0) return
        await this.fetchFromSupabase()
    }

    private loadFromStorage() {
        try {
            const stored = localStorage.getItem('medical_records_data')
            if (stored) {
                this.records = JSON.parse(stored)
            } else {
                this.records = []
                this.saveToStorage()
            }
            this.initialized = true
        } catch (error) {
            console.error('Error loading medical records:', error)
            this.records = []
            this.initialized = true
        }
        // Try to hydrate from Supabase asynchronously
        this.fetchFromSupabase().catch(() => { })
    }

    private saveToStorage() {
        try {
            localStorage.setItem('medical_records_data', JSON.stringify(this.records))
        } catch (error) {
            console.error('Error saving medical records:', error)
        }
    }

    getAllRecords(): MedicalRecord[] {
        if (!this.initialized) this.loadFromStorage()
        return [...this.records]
    }

    getRecordsByClient(clientId: string): MedicalRecord[] {
        return this.records.filter((record) => record.clientId === clientId)
    }

    addRecord(record: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>): MedicalRecord {
        const newRecord: MedicalRecord = {
            ...record,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        this.records.push(newRecord)
        this.saveToStorage()
        return newRecord
    }

    updateRecord(id: string, updates: Partial<MedicalRecord>): boolean {
        const index = this.records.findIndex((record) => record.id === id)
        if (index === -1) return false

        this.records[index] = {
            ...this.records[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        }
        this.saveToStorage()
        return true
    }
}

export const medicalRecordService = new MedicalRecordService()
