import { NextResponse } from "next/server"
import { Treatment } from "@/lib/types/api.types"
import { jsonMaybeMasked } from "@/lib/admin-mask"
import { supabaseAdminClient } from "@/lib/supabase-admin"
import { verifyCsrfToken, aesEncryptToString, aesDecryptFromString } from "@/lib/utils"
import { logAudit } from "@/lib/audit-logger"
import { getAuthUser } from "@/lib/auth-server"

export async function GET(req: Request) {
    const user = await getAuthUser(req)
    const admin = supabaseAdminClient()
    if (!admin) return jsonMaybeMasked(req, { error: 'Supabase admin client not available' }, { status: 500 })

    const { data, error } = await admin.from('treatments').select('*').order('date', { ascending: false })

    if (user) {
        await logAudit({
            userId: user.id,
            action: 'READ',
            resource: 'Treatments',
            status: error ? 'FAILURE' : 'SUCCESS',
            details: error ? { error: error.message } : { count: data?.length }
        })
    }

    if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })

    const treatments = (data || []).map((t: any) => ({
        ...t,
        procedure: aesDecryptFromString(t.procedure) ?? t.procedure,
        notes: aesDecryptFromString(t.notes) ?? t.notes,
    }))

    return jsonMaybeMasked(req, { treatments })
}

export async function POST(req: Request) {
    const user = await getAuthUser(req)
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
    const { staffId, medicalRecordId, treatments: incomingTreatments } = body

    if ((!staffId && !medicalRecordId) || !Array.isArray(incomingTreatments)) {
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
    const needsClientMap = incomingTreatments.some((t: { clientName?: string; clientId?: string }) => t.clientName && !t.clientId)
    const clientMap = new Map<string, string>()

    if (needsClientMap) {
        const { data: clients } = await admin.from('clients').select('id, first_name, last_name')
        clients?.forEach(c => {
            const fullName = `${c.first_name || ''} ${c.last_name || ''}`.trim()
            clientMap.set(fullName.toLowerCase(), c.id)
        })
    }

    const newRows = incomingTreatments.map((t: Treatment) => {
        const name = (t.clientName || '').trim().toLowerCase()
        const resolvedClientId = t.clientId || clientMap.get(name) || null

        return {
            id: t.id || `tr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            staff_id: t.aestheticianId || staffId || null,
            medical_record_id: medicalRecordId || null,
            client_id: resolvedClientId || body.clientId || null,
            procedure: aesEncryptToString(t.procedure),
            total: Number(t.total || 0),
            date: t.date || new Date().toISOString().slice(0, 10),
            notes: aesEncryptToString(t.notes || null)
        }
    })

    const { data, error } = await admin.from('treatments').insert(newRows).select('*')

    if (user) {
        await logAudit({
            userId: user.id,
            action: 'CREATE',
            resource: 'Treatments',
            status: error ? 'FAILURE' : 'SUCCESS',
            details: medicalRecordId ? { medicalRecordId } : { staffId }
        })
    }

    if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })

    const savedTreatments = (data || []).map((t: any) => ({
        ...t,
        procedure: aesDecryptFromString(t.procedure) ?? t.procedure,
        notes: aesDecryptFromString(t.notes) ?? t.notes,
    }))

    return jsonMaybeMasked(req, { success: true, treatments: savedTreatments })
}
