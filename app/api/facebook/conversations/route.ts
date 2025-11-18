import { NextRequest, NextResponse } from 'next/server'
import { facebookAPI } from '@/lib/facebook-api'

export async function POST(req: NextRequest) {
  try {
    const { accessToken, pageId } = await req.json()
    if (!accessToken || !pageId) {
      return NextResponse.json({ error: 'Missing accessToken or pageId' }, { status: 400 })
    }

    const conversations = await facebookAPI.getPageConversations(accessToken, pageId)
    return NextResponse.json({ conversations }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch conversations' }, { status: 500 })
  }
}