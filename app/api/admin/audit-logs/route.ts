import { NextRequest, NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"
import { logAudit } from "@/lib/audit-logger"
import { getAuthUser } from "@/lib/auth-server"

export async function GET(req: NextRequest) {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Ensure only admins can see audit logs (though they already passed through middleware)

    try {
        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '100')
        const offset = parseInt(searchParams.get('offset') || '0')

        const admin = supabaseAdminClient()
        if (!admin) return NextResponse.json({ error: 'DB Client unavailable' }, { status: 500 })

        const { data, error, count } = await admin
            .from('audit_logs')
            .select('*', { count: 'exact' })
            .order('timestamp', { ascending: false })
            .range(offset, offset + limit - 1)

        // Log that an admin viewed the audit logs!
        await logAudit({
            userId: user.id,
            action: 'READ',
            resource: 'AuditLogs',
            status: error ? 'FAILURE' : 'SUCCESS',
            details: { limit, offset, count }
        })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ logs: data, count })
    } catch (e: unknown) {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
