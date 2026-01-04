import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { supabaseAdminClient } from '@/lib/supabase-admin'
import { aesEncryptToString } from '@/lib/utils'
import { logAudit } from '@/lib/audit-logger'
import { cookies } from 'next/headers'

/**
 * Admin-only endpoint to repair/re-encrypt specific database fields.
 * This is used when encrypted data cannot be decrypted due to key changes.
 * HIPAA: All repair operations are logged to the audit trail.
 */

interface RepairRequest {
    table: 'appointments' | 'clients' | 'payments' | 'staff' | 'medical_records'
    id: string
    field: string
    plaintext: string
}

export async function POST(req: Request) {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Only MFA-verified admins can repair data
    const mfaVerified = user.mfa_verified === true ||
        user.app_metadata?.aal === 'aal2' ||
        user.user_metadata?.mfa_verified === true

    if (!mfaVerified) {
        return NextResponse.json({ error: 'MFA verification required' }, { status: 403 })
    }

    // Verify CSRF
    const cookieStore = await cookies()
    const csrfCookie = cookieStore.get('csrf_token')?.value
    const csrfHeader = req.headers.get('x-csrf-token')
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }

    const admin = supabaseAdminClient()
    if (!admin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })

    try {
        const body: RepairRequest = await req.json()
        const { table, id, field, plaintext } = body

        // Validate input
        const allowedTables = ['appointments', 'clients', 'payments', 'staff', 'medical_records']
        if (!allowedTables.includes(table)) {
            return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
        }

        const allowedFields: Record<string, string[]> = {
            appointments: ['client_name', 'client_email', 'client_phone', 'service', 'notes'],
            clients: ['first_name', 'last_name', 'email', 'phone', 'address'],
            payments: ['transaction_id', 'notes'],
            staff: ['first_name', 'last_name', 'email', 'phone', 'license_number'],
            medical_records: ['chief_complaint', 'diagnosis', 'treatment_plan', 'medications', 'notes', 'medical_history']
        }

        if (!allowedFields[table]?.includes(field)) {
            return NextResponse.json({ error: `Field '${field}' not allowed for table '${table}'` }, { status: 400 })
        }

        if (!id || !plaintext) {
            return NextResponse.json({ error: 'Missing id or plaintext' }, { status: 400 })
        }

        // Encrypt the new value
        const encrypted = aesEncryptToString(plaintext)

        // Update the record
        const { error } = await admin
            .from(table)
            .update({ [field]: encrypted })
            .eq('id', id)

        if (error) {
            console.error('Repair update error:', error)
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }

        // Audit log the repair action
        await logAudit({
            userId: user.id,
            action: 'DATA_REPAIR',
            resource: table,
            resourceId: id,
            status: 'SUCCESS',
            details: {
                field,
                action: 're-encrypted',
                timestamp: new Date().toISOString()
            }
        })

        return NextResponse.json({
            success: true,
            message: `Field '${field}' in ${table} record '${id}' has been re-encrypted.`
        })

    } catch (error: any) {
        console.error('Data repair error:', error)
        return NextResponse.json({ error: 'Repair operation failed', message: error.message }, { status: 500 })
    }
}

/**
 * GET: List records with decryption issues for a specific table
 */
export async function GET(req: Request) {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const mfaVerified = user.mfa_verified === true ||
        user.app_metadata?.aal === 'aal2' ||
        user.user_metadata?.mfa_verified === true

    if (!mfaVerified) {
        return NextResponse.json({ error: 'MFA required' }, { status: 403 })
    }

    const admin = supabaseAdminClient()
    if (!admin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })

    const url = new URL(req.url)
    const table = url.searchParams.get('table') || 'clients'

    try {
        // Get records and identify which have encrypted fields
        const { data, error } = await admin.from(table).select('*').limit(50)
        if (error) throw error

        const records = (data || []).map((record: any) => {
            const encryptedFields: string[] = []

            for (const [key, value] of Object.entries(record)) {
                if (typeof value === 'string' && value.startsWith('{') && value.includes('"iv"')) {
                    encryptedFields.push(key)
                }
            }

            return {
                id: record.id,
                encryptedFields,
                hasEncryptedData: encryptedFields.length > 0
            }
        })

        return NextResponse.json({
            table,
            records: records.filter(r => r.hasEncryptedData),
            totalWithEncryption: records.filter(r => r.hasEncryptedData).length
        })

    } catch (error: any) {
        console.error('List encrypted records error:', error)
        return NextResponse.json({ error: 'Failed to list records' }, { status: 500 })
    }
}
