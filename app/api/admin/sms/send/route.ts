import { NextRequest, NextResponse } from "next/server"
import { sendSms } from "@/lib/iprogsms"
import { getAuthUser } from "@/lib/auth-server"

export async function POST(req: NextRequest) {
    // 1. Auth check
    const user = await getAuthUser(req)
    if (!user) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { phoneNumber, message } = body

        if (!phoneNumber || !message) {
            return NextResponse.json({ ok: false, error: "Phone number and message are required" }, { status: 400 })
        }

        // 2. Send SMS
        const result = await sendSms(phoneNumber, message)

        if (!result.ok) {
            return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
        }

        return NextResponse.json({ ok: true, data: result.data })
    } catch (error) {
        console.error("SMS Send Error:", error)
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 })
    }
}
