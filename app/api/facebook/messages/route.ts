import { NextRequest, NextResponse } from 'next/server'
import { facebookAPI } from '@/lib/facebook-api'
import { logAudit } from '@/lib/audit-logger'
import { getAuthUser } from '@/lib/auth-server'

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  try {
    const { accessToken, conversationId } = await req.json()
    if (!accessToken || !conversationId) {
      return NextResponse.json({ error: 'Missing accessToken or conversationId' }, { status: 400 })
    }

    const messages = await facebookAPI.getConversationMessages(accessToken, conversationId)

    if (user) {
      await logAudit({
        userId: user.id,
        action: 'READ',
        resource: 'SocialMedia-Facebook-Messages',
        resourceId: conversationId,
        details: { count: messages?.length },
        status: 'SUCCESS'
      })
    }

    return NextResponse.json({ messages }, { status: 200 })
  } catch (err: any) {
    if (user) {
      await logAudit({
        userId: user.id,
        action: 'READ',
        resource: 'SocialMedia-Facebook-Messages',
        status: 'FAILURE',
        details: { error: err?.message }
      })
    }
    return NextResponse.json({ error: err?.message || 'Failed to fetch messages' }, { status: 500 })
  }
}