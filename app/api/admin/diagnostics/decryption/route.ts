import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { EncryptionDiagnosticService } from '@/lib/encryption/diagnostic.service'
import { supabaseAdminClient } from '@/lib/supabase-admin'

export async function POST(req: Request) {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // User passed middleware authentication, check MFA
    const mfaVerified = user.mfa_verified === true ||
        user.app_metadata?.aal === 'aal2' ||
        user.user_metadata?.mfa_verified === true

    if (!mfaVerified) {
        return NextResponse.json({ error: 'MFA verification required for diagnostics' }, { status: 403 })
    }

    try {
        const admin = supabaseAdminClient()
        if (!admin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })

        // 1. Run key test
        const keyTest = await EncryptionDiagnosticService.testDecryptionKey()

        // 2. Check environment
        const envCheck = {
            encryptionKeySet: !!(process.env.ENCRYPTION_KEY || process.env.DATA_ENCRYPTION_KEY),
            encryptionKeyLength: (process.env.ENCRYPTION_KEY || process.env.DATA_ENCRYPTION_KEY)?.length || 0,
            legacyKeySet: !!process.env.ENCRYPTION_KEY_LEGACY,
            backupKeySet: !!process.env.ENCRYPTION_KEY_BACKUP
        }

        // 3. Sample check on audit logs (where the issue was reported)
        const { data: samples } = await admin
            .from('audit_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(10)

        const diagnostics = await Promise.all(
            (samples || []).map(async (record: any) => {
                // Check if details contains encrypted data
                const diagnostic = await EncryptionDiagnosticService.diagnoseDecryptionFailure(
                    record.details,
                    record.id,
                    'audit_log'
                )
                return {
                    id: record.id,
                    action: record.action,
                    diagnostic
                }
            })
        )

        const recommendations = generateRecommendations(keyTest, envCheck, diagnostics)

        return NextResponse.json({
            keyTest,
            envCheck,
            sampleDiagnostics: diagnostics,
            timestamp: new Date().toISOString(),
            recommendations
        })
    } catch (error: any) {
        console.error('Diagnostic API error:', error)
        return NextResponse.json({ error: 'Internal diagnostics failure' }, { status: 500 })
    }
}

function generateRecommendations(keyTest: any, envCheck: any, diagnostics: any[]): string[] {
    const recommendations: string[] = []

    if (!envCheck.encryptionKeySet) {
        recommendations.push('CRITICAL: Primary encryption key environment variable is not set.')
    }

    if (!keyTest.keyValid) {
        recommendations.push('CRITICAL: The current encryption key failed a basic encryption/decryption loop test.')
    }

    if (envCheck.encryptionKeyLength !== 64 && envCheck.encryptionKeyLength !== 44) {
        recommendations.push(`WARNING: Encryption key length is ${envCheck.encryptionKeyLength}, which is unusual for AES-256-GCM hex (64) or base64 (44).`)
    }

    const failureCount = diagnostics.filter(d => !d.diagnostic.success).length
    if (failureCount > 0) {
        recommendations.push(`Identified ${failureCount} records with invalid data formats in the last 10 audit logs. This may indicate data corruption or a historical change in encryption strategy.`)
    }

    if (recommendations.length === 0) {
        recommendations.push('No obvious encryption configuration issues detected. Failures may be due to specific record corruption or incorrect salt usage in legacy formats.')
    }

    return recommendations
}
