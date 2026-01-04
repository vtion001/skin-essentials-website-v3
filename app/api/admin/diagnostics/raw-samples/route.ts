import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { supabaseAdminClient } from '@/lib/supabase-admin'

/**
 * Admin-only endpoint to view RAW database values for debugging decryption issues.
 * This endpoint bypasses decryption to show exactly what's stored in the DB.
 */
export async function GET(req: Request) {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Only MFA-verified admins can access raw data
    const mfaVerified = user.mfa_verified === true ||
        user.app_metadata?.aal === 'aal2' ||
        user.user_metadata?.mfa_verified === true

    if (!mfaVerified) {
        return NextResponse.json({ error: 'MFA required' }, { status: 403 })
    }

    const admin = supabaseAdminClient()
    if (!admin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })

    try {
        // Sample from multiple tables
        const [appointments, clients, payments, staff] = await Promise.all([
            admin.from('appointments').select('id, client_name, client_email, service').limit(3),
            admin.from('clients').select('id, first_name, last_name, email').limit(3),
            admin.from('payments').select('id, transaction_id, notes').limit(3),
            admin.from('staff').select('id, first_name, last_name, email').limit(3)
        ])

        // Try to decrypt one sample to diagnose the issue
        const { DecryptionService } = await import('@/lib/encryption/decrypt.service')
        const { getEncryptionKey } = await import('@/lib/utils')

        let decryptionTest: any = { status: 'no_samples' }

        // Find first encrypted value to test
        const sampleEmail = clients.data?.[0]?.email
        if (sampleEmail && typeof sampleEmail === 'string' && sampleEmail.startsWith('{')) {
            try {
                const parsed = JSON.parse(sampleEmail)
                const keyBuffer = getEncryptionKey()

                decryptionTest = {
                    rawValue: sampleEmail.substring(0, 100) + '...',
                    parsedFormat: { iv: parsed.iv?.substring(0, 10), tag: parsed.tag?.substring(0, 10), dataLen: parsed.data?.length },
                    keyDerivation: keyBuffer ? `Buffer(${keyBuffer.length} bytes)` : 'null',
                    decryptionAttempt: DecryptionService.decrypt(sampleEmail)
                }
            } catch (parseErr: any) {
                decryptionTest = { error: 'Parse failed', message: parseErr.message }
            }
        }

        return NextResponse.json({
            message: 'RAW database values (before decryption)',
            samples: {
                appointments: appointments.data || [],
                clients: clients.data || [],
                payments: payments.data || [],
                staff: staff.data || []
            },
            decryptionTest,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('Raw sample error:', error)
        return NextResponse.json({ error: 'Failed to fetch samples', message: error.message }, { status: 500 })
    }
}
