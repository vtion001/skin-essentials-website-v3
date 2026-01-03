import { NextRequest, NextResponse } from "next/server"
import { notifyNewBookingViber } from "@/lib/viber-service"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { appointment } = body || {}

        if (!appointment) {
            return NextResponse.json({ ok: false, error: "Missing appointment data" }, { status: 400 })
        }

        const { client_name, clientName } = appointment
        const normalized = {
            ...appointment,
            client_name: client_name || clientName // Handle both snake_case and camelCase
        }

        const result = await notifyNewBookingViber(normalized)

        if (result.ok) {
            return NextResponse.json({ ok: true })
        } else {
            return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
        }
    } catch (e: unknown) {
        return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 })
    }
}
