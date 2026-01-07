import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"

export async function GET() {
    try {
        const supabase = supabaseAdminClient()
        if (!supabase) {
            return NextResponse.json({ logs: [] })
        }

        const { data, error } = await supabase
            .from('error_logs')
            .select('*')
            .or('context.eq.sms_outbound,context.eq.sms_schedule_active')
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) throw error

        return NextResponse.json({ logs: data })
    } catch (error) {
        console.error("Failed to fetch SMS logs:", error)
        return NextResponse.json({ logs: [] }, { status: 500 })
    }
}
