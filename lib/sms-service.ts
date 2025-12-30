import { supabaseAdminClient } from "@/lib/supabase-admin"

export function normPhone(p: string) {
    const digits = p.replace(/[^0-9]/g, "")
    if (digits.startsWith("63")) return digits
    if (digits.startsWith("0")) return "63" + digits.slice(1)
    return digits
}

export async function sendSms(to: string, message: string, sender?: string) {
    const number = normPhone(String(to))
    if (!number) {
        return { ok: false, error: "Invalid phone number" }
    }

    // Check for iProgSMS first
    const iprogToken = process.env.IPROGSMS_API_TOKEN
    if (iprogToken) {
        try {
            const res = await fetch("https://www.iprogsms.com/api/v1/sms_messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    api_token: iprogToken,
                    phone_number: number,
                    message: String(message)
                })
            })

            const data = await res.json().catch(() => null)
            if (!res.ok) {
                return { ok: false, error: "Failed to send via iProgSMS", details: data }
            }

            await logSms('iProgSMS', to, message)
            return { ok: true, data }
        } catch (e) {
            return { ok: false, error: "iProgSMS Fetch Error", details: e }
        }
    }

    // Fallback to Semaphore
    const apiKey = process.env.SEMAPHORE_API_KEY
    if (!apiKey) {
        return { ok: false, error: "SMS Provider not configured" }
    }

    const senderName = sender || process.env.SEMAPHORE_SENDER_NAME || "SEMAPHORE"
    const url = "https://api.semaphore.co/api/v4/messages"

    try {
        const params = new URLSearchParams()
        params.append("apikey", apiKey)
        params.append("number", number)
        params.append("message", String(message))
        params.append("sendername", senderName)

        const res = await fetch(url, {
            method: "POST",
            body: params,
        })

        const data = await res.json().catch(() => null)
        if (!res.ok || (Array.isArray(data) && data.length === 0)) {
            return { ok: false, error: "Failed to send via Semaphore", details: data }
        }

        await logSms('Semaphore', to, message)
        return { ok: true, data }
    } catch (e) {
        return { ok: false, error: "Semaphore Fetch Error", details: e }
    }
}

async function logSms(provider: string, to: string, message: string) {
    const logEntry = {
        context: 'sms_log',
        message: `Sent to ${to} via ${provider}`,
        meta: { provider, to, message, status: 'sent', timestamp: new Date().toISOString() }
    }
    const admin = supabaseAdminClient()
    if (admin) {
        await admin.from('error_logs').insert(logEntry)
    }
}
