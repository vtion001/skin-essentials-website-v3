import { NextRequest, NextResponse } from 'next/server'
import { facebookAPI } from '@/lib/facebook-api'

export async function POST(req: NextRequest) {
  try {
    const { accessToken, conversationId } = await req.json()
    if (!accessToken || !conversationId) {
      return NextResponse.json({ error: 'Missing accessToken or conversationId' }, { status: 400 })
    }

    const messages = await facebookAPI.getConversationMessages(accessToken, conversationId)
    return NextResponse.json({ messages }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch messages' }, { status: 500 })
  }
}