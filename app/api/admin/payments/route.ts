import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"
import { aesEncryptToString, aesDecryptFromString, verifyCsrfToken } from "@/lib/utils"
import { cookies } from "next/headers"
import { logAudit } from "@/lib/audit-logger"
import { getAuthUser } from "@/lib/auth-server"

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  try {
    const admin = supabaseAdminClient()
    if (!admin) return NextResponse.json({ error: 'DB Client unavailable' }, { status: 500 })

    const { data, error } = await admin.from('payments').select('*').order('created_at', { ascending: false })

    if (user) {
      await logAudit({
        userId: user.id,
        action: 'READ',
        resource: 'Payments',
        status: error ? 'FAILURE' : 'SUCCESS',
        details: error ? { error: error.message } : { count: data?.length }
      })
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const payments = (data || []).map((p: { id: string;[key: string]: any }) => ({
      ...p,
      transaction_id: aesDecryptFromString(p.transaction_id) ?? p.transaction_id,
      notes: aesDecryptFromString(p.notes) ?? p.notes,
    }))
    return NextResponse.json({ payments })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  try {
    const cookieStore = await cookies()
    const cookiesMap = new Map<string, string>()
    cookieStore.getAll().forEach(c => cookiesMap.set(c.name, c.value))
    if (!verifyCsrfToken(req.headers, cookiesMap)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }
    const raw = await req.json()
    const admin = supabaseAdminClient()
    if (!admin) return NextResponse.json({ error: 'DB Client unavailable' }, { status: 500 })

    const id = raw.id || `pay_${Date.now()}`
    const payload = {
      id,
      appointment_id: raw.appointmentId ?? null,
      client_id: raw.clientId,
      amount: raw.amount,
      method: raw.method,
      status: raw.status,
      transaction_id: aesEncryptToString(raw.transactionId ?? null),
      receipt_url: raw.receiptUrl ?? null,
      uploaded_files: Array.isArray(raw.uploadedFiles) ? raw.uploadedFiles : [],
      notes: aesEncryptToString(raw.notes ?? null),
    }
    const { data, error } = await admin.from('payments').insert(payload).select('*').single()

    if (user) {
      await logAudit({
        userId: user.id,
        action: 'CREATE',
        resource: 'Payments',
        resourceId: id,
        status: error ? 'FAILURE' : 'SUCCESS'
      })
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const payment = {
      ...data,
      transaction_id: aesDecryptFromString(data.transaction_id) ?? data.transaction_id,
      notes: aesDecryptFromString(data.notes) ?? data.notes,
    }
    return NextResponse.json({ payment })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  const user = await getAuthUser(req)
  try {
    const cookieStore = await cookies()
    const cookiesMap = new Map<string, string>()
    cookieStore.getAll().forEach(c => cookiesMap.set(c.name, c.value))
    if (!verifyCsrfToken(req.headers, cookiesMap)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }
    const raw = await req.json()
    const { id } = raw || {}
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const admin = supabaseAdminClient()
    if (!admin) return NextResponse.json({ error: 'DB Client unavailable' }, { status: 500 })

    const updates = {
      appointment_id: raw.appointmentId ?? undefined,
      client_id: raw.clientId ?? undefined,
      amount: raw.amount ?? undefined,
      method: raw.method ?? undefined,
      status: raw.status ?? undefined,
      transaction_id: raw.transactionId !== undefined ? aesEncryptToString(raw.transactionId) : undefined,
      receipt_url: raw.receiptUrl ?? undefined,
      uploaded_files: Array.isArray(raw.uploadedFiles) ? raw.uploadedFiles : undefined,
      notes: raw.notes !== undefined ? aesEncryptToString(raw.notes) : undefined,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await admin.from('payments').update(updates).eq('id', id).select('*').single()

    if (user) {
      await logAudit({
        userId: user.id,
        action: 'UPDATE',
        resource: 'Payments',
        resourceId: id,
        status: error ? 'FAILURE' : 'SUCCESS'
      })
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const payment = {
      ...data,
      transaction_id: aesDecryptFromString(data.transaction_id) ?? data.transaction_id,
      notes: aesDecryptFromString(data.notes) ?? data.notes,
    }
    return NextResponse.json({ payment })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthUser(req)
  try {
    const body = await req.json()
    const { id } = body || {}
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const admin = supabaseAdminClient()
    if (!admin) return NextResponse.json({ error: 'DB Client unavailable' }, { status: 500 })

    const { error } = await admin.from('payments').delete().eq('id', id)

    if (user) {
      await logAudit({
        userId: user.id,
        action: 'DELETE',
        resource: 'Payments',
        resourceId: id,
        status: error ? 'FAILURE' : 'SUCCESS'
      })
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}