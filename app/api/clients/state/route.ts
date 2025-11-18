import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), '.data')
const DATA_FILE = path.join(DATA_DIR, 'clients-state.json')

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
    return NextResponse.json({ clients: [] }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const clients = Array.isArray(body?.clients) ? body.clients : []
    await ensureDir()
    await fs.writeFile(DATA_FILE, JSON.stringify({ clients }, null, 2))
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to save' }, { status: 500 })
  }
}