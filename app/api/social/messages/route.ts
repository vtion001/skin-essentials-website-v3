/**
 * Messages API - Read from Supabase
 * Fast local reads instead of hitting Facebook API
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseSocialService } from '@/lib/services/admin/supabase-social.service'
import { getAuthUser } from '@/lib/auth-server'

// GET: Fetch messages for a conversation from Supabase
export async function GET(req: NextRequest) {
    const user = await getAuthUser(req)
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const searchParams = req.nextUrl.searchParams
        const conversationId = searchParams.get('conversationId')
        const limit = parseInt(searchParams.get('limit') || '50', 10)

        if (!conversationId) {
            return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
        }

        const messages = await supabaseSocialService.getMessages(conversationId, limit)

        // Mark conversation as read
        await supabaseSocialService.markConversationRead(conversationId)

        return NextResponse.json({
            messages,
            count: messages.length,
            source: 'supabase'
        })

    } catch (error: any) {
        console.error('[Messages API] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
