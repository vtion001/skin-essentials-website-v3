import { NextResponse } from "next/server"
import { Treatment } from "@/lib/types/api.types"
import { jsonMaybeMasked } from "@/lib/admin-mask"
import { supabaseAdminClient } from "@/lib/supabase-admin"
import { verifyCsrfToken } from "@/lib/utils"

export async function GET(req: Request) {
    const admin = supabaseAdminClient()
    if (!admin) return jsonMaybeMasked(req, { error: 'Supabase admin client not available' }, { status: 500 })

    const { data, error } = await admin.from('treatments').select('*').order('date', { ascending: false })
    if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })

    return jsonMaybeMasked(req, { treatments: data || [] })
}

export async function POST(req: Request) {
    const cookiesMap = new Map<string, string>()
    const cookieHeader = req.headers.get('cookie') || ''
    cookieHeader.split(';').forEach((pair) => {
        const [k, v] = pair.split('=')
        if (k) cookiesMap.set(k.trim(), decodeURIComponent((v || '').trim()))
    })

    // Basic CSRF check
    if (!verifyCsrfToken(req.headers, cookiesMap)) {
        return jsonMaybeMasked(req, { error: 'Invalid CSRF token' }, { status: 403 })
    }

    const body = await req.json()
    const { staffId, medicalRecordId, treatments } = body

    if ((!staffId && !medicalRecordId) || !Array.isArray(treatments)) {
        return jsonMaybeMasked(req, { error: 'Missing staffId/medicalRecordId or treatments array' }, { status: 400 })
    }

    const admin = supabaseAdminClient()
    if (!admin) return jsonMaybeMasked(req, { error: 'Supabase admin client not available' }, { status: 500 })

    // 1. Delete existing treatments for this target
    if (staffId) {
        const { error: delError } = await admin
            .from('treatments')
            .delete()
            .eq('staff_id', staffId)
            .is('medical_record_id', null)
        if (delError) return jsonMaybeMasked(req, { error: delError.message }, { status: 500 })
    } else if (medicalRecordId) {
        const { error: delError } = await admin
            .from('treatments')
            .delete()
            .eq('medical_record_id', medicalRecordId)
        if (delError) return jsonMaybeMasked(req, { error: delError.message }, { status: 500 })
    }

    // 2. Prepare new rows
    const needsClientMap = treatments.some((t: { clientName?: string; clientId?: string }) => t.clientName && !t.clientId)
    const clientMap = new Map<string, string>()

    if (needsClientMap) {
        const { data: clients } = await admin.from('clients').select('id, first_name, last_name')
        clients?.forEach(c => {
            const fullName = `${c.first_name || ''} ${c.last_name || ''}`.trim()
            clientMap.set(fullName.toLowerCase(), c.id)
        })
    }

    const newRows = treatments.map((t: Treatment) => {
        const name = (t.clientName || '').trim().toLowerCase()
        const resolvedClientId = t.clientId || clientMap.get(name) || null

        return {
            id: t.id || `tr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            staff_id: t.aestheticianId || staffId || null,
            medical_record_id: medicalRecordId || null,
            client_id: resolvedClientId || body.clientId || null,
            procedure: t.procedure,
            total: Number(t.total || 0),
            date: t.date || new Date().toISOString().slice(0, 10),
            notes: t.notes || null
        }
    })

    const { data, error } = await admin.from('treatments').insert(newRows).select('*')
    if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })

    return jsonMaybeMasked(req, { success: true, treatments: data })
}
