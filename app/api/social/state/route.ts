import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ messages: [], conversations: [], connections: [] })
}

export async function POST(req: Request) {
  try {
    await req.json()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }
}