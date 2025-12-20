
import { NextResponse } from 'next/server'
import { supabaseAdminClient } from '@/lib/supabase-admin'

export async function GET() {
    try {
        const admin = supabaseAdminClient()

        if (!admin) {
            return NextResponse.json({
                status: 'error',
                message: 'Supabase admin client is null',
                env: {
                    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                    key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
                }
            }, { status: 500 })
        }

        const { data, error } = await admin.from('service_categories').select('count(*)', { count: 'exact', head: true })

        if (error) {
            return NextResponse.json({
                status: 'error',
                message: 'Database connection failed',
                details: error.message
            }, { status: 500 })
        }

        return NextResponse.json({
            status: 'ok',
            message: 'Supabase connected successfully',
            data
        })
    } catch (e: any) {
        return NextResponse.json({
            status: 'error',
            message: 'Unexpected error',
            details: e.message
        }, { status: 500 })
    }
}
