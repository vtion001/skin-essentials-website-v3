/**
 * Conversations API - Read from Supabase
 * Fast local reads instead of hitting Facebook API
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseSocialService } from '@/lib/services/admin/supabase-social.service'
import { getAuthUser } from '@/lib/auth-server'

// GET: Fetch all conversations from Supabase
export async function GET(req: NextRequest) {
    const user = await getAuthUser(req)
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const searchParams = req.nextUrl.searchParams
        const platform = searchParams.get('platform') || undefined
        const pageId = searchParams.get('pageId') || undefined

        const conversations = await supabaseSocialService.getConversations(platform, pageId)

        return NextResponse.json({
            conversations,
            count: conversations.length,
            source: 'supabase'
        })

    } catch (error: any) {
        console.error('[Conversations API] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
