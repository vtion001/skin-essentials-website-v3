import { supabaseAdminClient } from '@/lib/supabase-admin'
import { logAudit } from '@/lib/audit-logger'

export type RecordType = 'audit_log' | 'medical_record' | 'staff' | 'client' | 'payment' | 'appointment'

export class DecryptionAccessControl {
    /**
     * Check if user has decryption access
     * Based on role and MFA status
     */
    public static async canDecrypt(
        user: any,
        recordType: RecordType
    ): Promise<boolean> {
        if (!user) return false

        // 1. Get role from metadata or fallback to 'ADMINISTRATOR' if they passed the admin auth check
        const role = user.app_metadata?.role || user.user_metadata?.role || 'ADMINISTRATOR'

        // 2. Check MFA status (Support both Supabase AAL2 and our custom mfa_verified flag)
        const mfaVerified =
            user.app_metadata?.aal === 'aal2' ||
            user.user_metadata?.mfa_verified === true ||
            user.mfa_verified === true

        // ADMINISTRATOR with MFA always has full access
        if (role === 'ADMINISTRATOR' && mfaVerified) {
            return true
        }

        // Specific role-based access for non-MFA or other roles
        switch (recordType) {
            case 'audit_log':
                // Audit logs strictly require Admin + MFA
                return role === 'ADMINISTRATOR' && mfaVerified

            case 'medical_record':
                // Medical records available to specialists, but masked if no MFA probably?
                // For this implementation, let's keep it tight
                return ['ADMINISTRATOR', 'DOCTOR', 'NURSE'].includes(role) && mfaVerified

            case 'staff':
                return ['ADMINISTRATOR', 'HR_MANAGER'].includes(role) && mfaVerified

            case 'client':
            case 'appointment':
                return ['ADMINISTRATOR', 'DOCTOR', 'NURSE', 'RECEPTIONIST'].includes(role)

            case 'payment':
                return role === 'ADMINISTRATOR' || role === 'ACCOUNTANT'

            default:
                return false
        }
    }

    /**
     * Log access denial for HIPAA audit
     */
    public static async logAccessDenial(
        userId: string,
        recordType: string,
        reason: string
    ) {
        await logAudit({
            userId,
            action: 'ACCESS_DENIED' as any,
            resource: recordType,
            status: 'FAILURE',
            details: { reason, timestamp: new Date().toISOString() }
        }).catch(() => { })
    }
}
