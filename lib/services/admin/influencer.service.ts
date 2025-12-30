// Influencer Service
// Extracted from lib/admin-services.ts following SRP

import type { Influencer, ReferralRecord } from '@/lib/types/admin.types'
import { supabaseFetchInfluencers, supabaseFetchReferrals } from '@/lib/supabase'

class InfluencerService {
    private influencers: Influencer[] = []
    private referrals: ReferralRecord[] = []
    private initialized = false

    constructor() {
        if (typeof window !== 'undefined') {
            this.loadFromStorage()
        }
    }

    private loadFromStorage() {
        if (typeof window === 'undefined') {
            this.initialized = true
            return
        }
        try {
            const inf = localStorage.getItem('influencers_data')
            const ref = localStorage.getItem('influencer_referrals_data')
            this.influencers = inf ? JSON.parse(inf) : this.getDefaultInfluencers()
            this.referrals = ref ? JSON.parse(ref) : []
            if (!inf) this.saveToStorage()
            this.initialized = true
        } catch (e) {
            console.error('Error loading influencers:', e)
            this.influencers = this.getDefaultInfluencers()
            this.referrals = []
            this.initialized = true
        }
    }

    private saveToStorage() {
        if (typeof window === 'undefined') return
        try {
            localStorage.setItem('influencers_data', JSON.stringify(this.influencers))
            localStorage.setItem('influencer_referrals_data', JSON.stringify(this.referrals))
        } catch (e) {
            console.error('Error saving influencers:', e)
        }
    }

    async fetchFromSupabase() {
        const infl = await supabaseFetchInfluencers()
        const refs = await supabaseFetchReferrals()
        if (infl) {
            this.influencers = infl.map((r: any) => ({
                id: String(r.id),
                name: String(r.name ?? ''),
                handle: r.handle ? String(r.handle) : undefined,
                platform: String(r.platform ?? 'other') as Influencer['platform'],
                email: r.email ? String(r.email) : undefined,
                phone: r.phone ? String(r.phone) : undefined,
                referralCode: r.referral_code ? String(r.referral_code) : undefined,
                commissionRate: Number(r.commission_rate ?? 0.1),
                totalCommissionPaid: Number(r.total_commission_paid ?? 0),
                status: String(r.status ?? 'active') as Influencer['status'],
                notes: r.notes ? String(r.notes) : undefined,
                createdAt: String(r.created_at ?? new Date().toISOString()),
                updatedAt: String(r.updated_at ?? new Date().toISOString()),
            }))
        }
        if (refs) {
            this.referrals = refs.map((x: any) => ({
                id: String(x.id),
                influencerId: String(x.influencer_id ?? x.influencerId ?? ''),
                clientId: x.client_id ? String(x.client_id) : undefined,
                clientName: String(x.client_name ?? ''),
                amount: Number(x.amount ?? 0),
                date: String(x.date ?? new Date().toISOString()),
                appointmentId: x.appointment_id ? String(x.appointment_id) : undefined,
                notes: x.notes ? String(x.notes) : undefined,
                createdAt: String(x.created_at ?? new Date().toISOString()),
            }))
        }
        this.saveToStorage()
    }

    async syncLocalToSupabaseIfEmpty() {
        try {
            const res = await fetch('/api/admin/influencers', { cache: 'no-store' })
            const json = await res.json()
            const existing = Array.isArray(json?.influencers) ? json.influencers : []
            if (existing.length === 0 && this.influencers.length > 0) {
                for (const i of this.influencers) {
                    const payload = {
                        id: i.id,
                        name: i.name,
                        handle: i.handle,
                        platform: i.platform,
                        email: i.email,
                        phone: i.phone,
                        referral_code: i.referralCode,
                        commission_rate: i.commissionRate,
                        total_commission_paid: i.totalCommissionPaid,
                        status: i.status,
                        notes: i.notes,
                    }
                    await fetch('/api/admin/influencers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    })
                }
            }
            const rres = await fetch('/api/admin/influencer-referrals', { cache: 'no-store' })
            const rjson = await rres.json()
            const rexisting = Array.isArray(rjson?.referrals) ? rjson.referrals : []
            if (rexisting.length === 0 && this.referrals.length > 0) {
                for (const r of this.referrals) {
                    const payload = {
                        id: r.id,
                        influencer_id: r.influencerId,
                        client_id: r.clientId,
                        client_name: r.clientName,
                        amount: r.amount,
                        date: r.date,
                        appointment_id: r.appointmentId,
                        notes: r.notes,
                    }
                    await fetch('/api/admin/influencer-referrals', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    })
                }
            }
        } catch { }
    }

    private getDefaultInfluencers(): Influencer[] {
        return [
            {
                id: 'inf1',
                name: 'Ava Cruz',
                handle: '@avacruz',
                platform: 'instagram',
                email: 'ava@example.com',
                phone: '+639201234567',
                referralCode: 'AVA10',
                commissionRate: 0.1,
                totalCommissionPaid: 0,
                status: 'active',
                notes: 'Beauty lifestyle influencer',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ]
    }

    getAllInfluencers(): Influencer[] {
        if (!this.initialized) this.loadFromStorage()
        return [...this.influencers]
    }

    addInfluencer(inf: Omit<Influencer, 'id' | 'createdAt' | 'updatedAt' | 'totalCommissionPaid'>): Influencer {
        const newInf: Influencer = {
            ...inf,
            id: Date.now().toString(),
            totalCommissionPaid: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        this.influencers.push(newInf)
        this.saveToStorage()
        return newInf
    }

    updateInfluencer(id: string, updates: Partial<Influencer>): boolean {
        const i = this.influencers.findIndex((x) => x.id === id)
        if (i === -1) return false
        this.influencers[i] = { ...this.influencers[i], ...updates, updatedAt: new Date().toISOString() }
        this.saveToStorage()
        return true
    }

    deleteInfluencer(id: string): boolean {
        const i = this.influencers.findIndex((x) => x.id === id)
        if (i === -1) return false
        this.influencers.splice(i, 1)
        this.referrals = this.referrals.filter((r) => r.influencerId !== id)
        this.saveToStorage()
        return true
    }

    addReferral(rec: Omit<ReferralRecord, 'id' | 'createdAt'>): ReferralRecord {
        const newRec: ReferralRecord = { ...rec, id: Date.now().toString(), createdAt: new Date().toISOString() }
        this.referrals.push(newRec)
        this.saveToStorage()
        return newRec
    }

    deleteReferral(id: string): boolean {
        const i = this.referrals.findIndex((r) => r.id === id)
        if (i === -1) return false
        this.referrals.splice(i, 1)
        this.saveToStorage()
        return true
    }

    getReferralsByInfluencer(influencerId: string): ReferralRecord[] {
        if (!this.initialized) this.loadFromStorage()
        return this.referrals.filter((r) => r.influencerId === influencerId)
    }

    getStats(influencerId: string) {
        const rows = this.getReferralsByInfluencer(influencerId)
        const totalReferrals = rows.length
        const totalRevenue = rows.reduce((s, r) => s + r.amount, 0)
        const inf = this.influencers.find((x) => x.id === influencerId)
        const rate = inf?.commissionRate ?? 0.1
        const commissionDue = totalRevenue * rate
        const paidRaw = inf?.totalCommissionPaid ?? 0
        const paid = Math.min(Math.max(0, paidRaw), commissionDue)
        const remaining = Math.max(commissionDue - paid, 0)
        return {
            totalReferrals,
            totalRevenue,
            commissionRate: rate,
            commissionDue,
            commissionPaid: paid,
            commissionRemaining: remaining,
        }
    }

    payCommission(influencerId: string, amount?: number): boolean {
        const inf = this.influencers.find((x) => x.id === influencerId)
        if (!inf) return false
        const stats = this.getStats(influencerId)
        const toPay = amount ?? stats.commissionRemaining
        inf.totalCommissionPaid = (inf.totalCommissionPaid || 0) + Math.max(toPay, 0)
        inf.updatedAt = new Date().toISOString()
        this.saveToStorage()
        return true
    }
}

export const influencerService = new InfluencerService()
