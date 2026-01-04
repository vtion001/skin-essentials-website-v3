import { NextRequest, NextResponse } from 'next/server'
import { facebookAPI } from '@/lib/facebook-api'
import { logAudit } from '@/lib/audit-logger'
import { getAuthUser } from '@/lib/auth-server'

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  try {
    const { accessToken, pageId } = await req.json()
    if (!accessToken || !pageId) {
      return NextResponse.json({ error: 'Missing accessToken or pageId' }, { status: 400 })
    }

    const conversations = await facebookAPI.getPageConversations(accessToken, pageId)

    if (user) {
      await logAudit({
        userId: user.id,
        action: 'READ',
        resource: 'SocialMedia-Facebook-Conversations',
        details: { pageId, count: conversations?.length },
        status: 'SUCCESS'
      })
    }

    return NextResponse.json({ conversations }, { status: 200 })
  } catch (err: any) {
    if (user) {
      await logAudit({
        userId: user.id,
        action: 'READ',
        resource: 'SocialMedia-Facebook-Conversations',
        status: 'FAILURE',
        details: { error: err?.message }
      })
    }
    return NextResponse.json({ error: err?.message || 'Failed to fetch conversations' }, { status: 500 })
  }
}