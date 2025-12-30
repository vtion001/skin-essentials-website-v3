import { NextResponse } from "next/server"
import { getSmsCredits } from "@/lib/iprogsms"

export async function GET() {
    try {
        const result = await getSmsCredits()
        if (!result.ok) {
            return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
        }
        return NextResponse.json({ ok: true, balance: result.balance })
    } catch (error) {
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 })
    }
}
