import { NextRequest, NextResponse } from 'next/server'
import { facebookAPI } from '@/lib/facebook-api'

export async function POST(req: NextRequest) {
  try {
    const { accessToken, userId } = await req.json()
    if (!accessToken || !userId) {
      return NextResponse.json({ error: 'Missing accessToken or userId' }, { status: 400 })
    }

    const result = await facebookAPI.getUserInfo(userId, accessToken)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({ user: result.user }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch user info' }, { status: 500 })
  }
}