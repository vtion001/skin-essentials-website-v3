import { format } from "date-fns"
import { supabaseAdminClient } from "@/lib/supabase-admin"

export async function createMessageReminder(phoneNumber: string, message: string, scheduledDate: Date) {
    const iprogToken = process.env.IPROGSMS_API_TOKEN
    if (!iprogToken) {
        console.error("IPROGSMS_API_TOKEN is not set")
        return { ok: false, error: "IPROGSMS_API_TOKEN is not set" }
    }

    // Format using local date methods to build YYYY-MM-DD HH:MMAM/PM
    const YYYY = scheduledDate.getFullYear()
    const MM = String(scheduledDate.getMonth() + 1).padStart(2, '0')
    const DD = String(scheduledDate.getDate()).padStart(2, '0')

    let hours = scheduledDate.getHours()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    const hh = String(hours).padStart(2, '0')
    const mm = String(scheduledDate.getMinutes()).padStart(2, '0')

    const formattedDate = `${YYYY}-${MM}-${DD} ${hh}:${mm}${ampm}`
    let phone = phoneNumber.replace(/[^0-9]/g, "")

    try {
        const res = await fetch("https://www.iprogsms.com/api/v1/message-reminders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                api_token: iprogToken,
                phone_number: phone,
                message: message,
                scheduled_at: formattedDate
            })
        })

        const data = await res.json()
        if (!res.ok) {
            console.error("Failed to create message reminder:", data)
            return { ok: false, error: data }
        }

        // Persist to local DB for tracking (since API doesn't support listing)
        try {
            const supabase = supabaseAdminClient()
            const reminderId = data.data?.id
            if (reminderId) {
                // Remove 'admin' possibly null check if safe or use optional chaining if admin client is typed as null-able
                // Assuming supabaseAdminClient() returns a client always or handling error if implementation differs.
                // The global rules say: 'admin' is possibly 'null'.
                if (supabase) {
                    await supabase.from('error_logs').insert({
                        context: 'sms_schedule_active',
                        message: message,
                        details: JSON.stringify({ // Storing as JSON string to fit text column if needed, or if details is jsonb, this works too usually
                            provider_id: reminderId,
                            phone: phone,
                            scheduled_at: data.data?.scheduled_at || scheduledDate.toISOString(),
                            full_response: data
                        })
                    })
                }
            }
        } catch (dbError) {
            console.error("Failed to persist reminder to local DB:", dbError)
        }

        return { ok: true, data }

    } catch (e) {
        console.error("Error creating message reminder:", e)
        return { ok: false, error: e }
    }
}

export async function listMessageReminders() {
    // Fetch from local DB instead of API
    try {
        const supabase = supabaseAdminClient()
        if (!supabase) return { ok: false, error: "DB Client unavailable" }

        const { data, error } = await supabase
            .from('error_logs')
            .select('*')
            .eq('context', 'sms_schedule_active')
            .order('created_at', { ascending: true })

        if (error) throw error

        // Transform back to the shape our UI expects
        const mapped = (data || []).map((row: any) => {
            let details: any = {}
            try { details = typeof row.details === 'string' ? JSON.parse(row.details) : row.details } catch { }

            return {
                id: details.provider_id || row.id, // Use provider ID if available
                db_id: row.id, // Keep generic DB ID for deletion reference
                phone_number: details.phone || "Unknown",
                message: row.message,
                scheduled_at: details.scheduled_at || row.created_at,
                status: 'scheduled',
                created_at: row.created_at
            }
        })

        return { ok: true, data: mapped }
    } catch (e) {
        console.error("Local DB List Error:", e)
        return { ok: false, error: e }
    }
}

export async function deleteMessageReminder(id: string | number) {
    const iprogToken = process.env.IPROGSMS_API_TOKEN
    if (!iprogToken) return { ok: false, error: "Token missing" }

    try {
        // 1. Delete from Provider
        const res = await fetch(`https://www.iprogsms.com/api/v1/message-reminders/${id}?api_token=${iprogToken}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        })
        const data = await res.json()

        // Log provider error but proceed to cleanup local DB
        if (!res.ok) console.warn("Provider delete failed (might be already gone):", data)

        // 2. Delete from Local DB
        const supabase = supabaseAdminClient()
        if (supabase) {
            // Find the record where provider_id matches
            const { data: records } = await supabase
                .from('error_logs')
                .select('id, details')
                .eq('context', 'sms_schedule_active')

            if (records) {
                const match = records.find((r: any) => {
                    try {
                        const d = typeof r.details === 'string' ? JSON.parse(r.details) : r.details
                        // Compare as strings to be safe
                        return String(d.provider_id) === String(id)
                    } catch { return false }
                })

                if (match) {
                    await supabase.from('error_logs').delete().eq('id', match.id)
                }
            }
        }

        return { ok: true, data }
    } catch (e) {
        return { ok: false, error: e }
    }
}

export async function getSmsCredits() {
    const iprogToken = process.env.IPROGSMS_API_TOKEN
    if (!iprogToken) {
        return { ok: false, error: "IPROGSMS_API_TOKEN is not set" }
    }

    try {
        const res = await fetch(`https://www.iprogsms.com/api/v1/account/sms_credits?api_token=${iprogToken}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })

        const data = await res.json()
        if (!res.ok) {
            return { ok: false, error: data }
        }

        return { ok: true, balance: data.data?.load_balance ?? 0 }
    } catch (e) {
        return { ok: false, error: e }
    }
}
