import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), '.data')
const DATA_FILE = path.join(DATA_DIR, 'social-state.json')

async function ensureDir() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }) } catch {}
}

export async function GET() {
  try {
    await ensureDir()
    const buf = await fs.readFile(DATA_FILE)
    const json = JSON.parse(buf.toString())
    return NextResponse.json(json, { status: 200 })
  } catch {
    return NextResponse.json({ messages: [], conversations: [], connections: [] }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages = Array.isArray(body?.messages) ? body.messages : []
    const conversations = Array.isArray(body?.conversations) ? body.conversations : []
    const connections = Array.isArray(body?.connections) ? body.connections : []
    const sanitizedConnections = connections.map((c: any) => ({
      id: c.id,
      platform: c.platform,
      pageId: c.pageId,
      pageName: c.pageName,
      isConnected: !!c.isConnected,
      lastSyncTimestamp: c.lastSyncTimestamp,
      webhookVerified: !!c.webhookVerified,
    }))
    await ensureDir()
    await fs.writeFile(DATA_FILE, JSON.stringify({ messages, conversations, connections: sanitizedConnections }, null, 2))
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to save' }, { status: 500 })
  }
}