import { NextResponse } from 'next/server'

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, { status: 200, ...(init || {}) })
}

export function jsonError(message: string, status = 400, meta?: Record<string, any>) {
  return NextResponse.json({ ok: false, error: message, ...(meta ? { meta } : {}) }, { status })
}

export function jsonCreated<T>(data: T) {
  return NextResponse.json({ ok: true, data }, { status: 201 })
}

