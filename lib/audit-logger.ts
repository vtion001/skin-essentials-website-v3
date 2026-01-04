import { supabaseAdminClient } from './supabase-admin'

export type AuditAction = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT'

export interface AuditLogEntry {
    userId: string
    action: AuditAction
    resource: string
    resourceId?: string
    details?: any
    status: 'SUCCESS' | 'FAILURE'
    ipAddress?: string
}

/**
 * HIPAA Audit Logging Utility
 * Records activity consistent with 164.312(b) requirements.
 */
export async function logAudit(entry: AuditLogEntry) {
    const admin = supabaseAdminClient()
    if (!admin) {
        console.error('CRITICAL: Audit log failed - Supabase admin client not available', entry)
        return
    }

    const payload = {
        user_id: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resource_id: entry.resourceId,
        details: entry.details,
        status: entry.status,
        ip_address: entry.ipAddress,
        created_at: new Date().toISOString()
    }

    try {
        const { error } = await admin.from('audit_logs').insert(payload)
        if (error) {
            console.error('Audit log DB error:', error, payload)
        }
    } catch (err) {
        console.error('Unexpected audit log error:', err, payload)
    }
}
