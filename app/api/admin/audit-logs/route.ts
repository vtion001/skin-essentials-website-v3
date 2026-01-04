import { NextRequest, NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"
import { logAudit } from "@/lib/audit-logger"
import { getAuthUser } from "@/lib/auth-server"
import { DecryptionService } from "@/lib/encryption/decrypt.service"
import { DecryptionAccessControl } from "@/lib/auth/decryption-access"
import { EncryptionDiagnosticService } from "@/lib/encryption/diagnostic.service"

export async function GET(req: NextRequest) {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = supabaseAdminClient()
    if (!admin) return NextResponse.json({ error: 'DB Client unavailable' }, { status: 500 })

    try {
        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '100')
        const offset = parseInt(searchParams.get('offset') || '0')

        // 1. Check if user can decrypt audit logs
        const canDecrypt = await DecryptionAccessControl.canDecrypt(user, 'audit_log')

        if (!canDecrypt) {
            await DecryptionAccessControl.logAccessDenial(user.id, 'audit_log', 'Attempted to view audit logs without MFA or incorrect role')
            return NextResponse.json({ error: 'Access denied. Administrator with MFA required.' }, { status: 403 })
        }

        const { data: logs, error, count } = await admin
            .from('audit_logs')
            .select('*', { count: 'exact' })
            .order('timestamp', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        // 2. Decrypt logs and track failures
        const failures: any[] = []
        const decryptedLogs = (logs || []).map((log: any) => {
            const decDetails = DecryptionService.decrypt(log.details)
            const decResource = DecryptionService.decrypt(log.resource)

            const hasFailure =
                (log.details && decDetails === "[Unavailable]") ||
                (log.resource && decResource === "[Unavailable]")

            if (hasFailure) {
                failures.push({
                    id: log.id,
                    timestamp: log.timestamp,
                    action: log.action
                })
            }

            return {
                ...log,
                details: decDetails,
                resource: decResource,
                decryption_error: hasFailure
            }
        })

        // 3. Log the read action
        await logAudit({
            userId: user.id,
            action: 'READ',
            resource: 'AuditLogs',
            status: 'SUCCESS',
            details: {
                limit,
                offset,
                count,
                decryptedRecords: decryptedLogs.length,
                failedDecryptions: failures.length
            }
        })

        return NextResponse.json({
            logs: decryptedLogs,
            count,
            failedRecords: failures.length,
            failures: failures.slice(0, 10) // Return sample of failures
        })
    } catch (e: any) {
        console.error('Audit logs API failure:', e)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
