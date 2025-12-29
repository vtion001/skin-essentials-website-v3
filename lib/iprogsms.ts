
export async function createMessageReminder(phoneNumber: string, message: string, scheduledDate: Date) {
    const iprogToken = process.env.IPROGSMS_API_TOKEN
    if (!iprogToken) {
        console.error("IPROGSMS_API_TOKEN is not set")
        return { ok: false, error: "IPROGSMS_API_TOKEN is not set" }
    }

    // Format date as "YYYY-MM-DD HH:MMAM/PM"
    // Note: The example shows 05:00AM. We need to match this format.
    // However, JS 'en-US' options for timeStyle might vary. We should construct manually or use careful options.
    // Example: 2025-03-08 05:00AM

    // We can use toLocaleString with strict options to match close enough, but constructing is safer.
    const YYYY = scheduledDate.getFullYear()
    const MM = String(scheduledDate.getMonth() + 1).padStart(2, '0')
    const DD = String(scheduledDate.getDate()).padStart(2, '0')

    let hours = scheduledDate.getHours()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12 // the hour '0' should be '12'
    const hh = String(hours).padStart(2, '0')
    const mm = String(scheduledDate.getMinutes()).padStart(2, '0')

    // Construct format: YYYY-MM-DD HH:MMAM/PM
    // Note: The example has HH:MMAM (no space before AM/PM)
    const formattedDate = `${YYYY}-${MM}-${DD} ${hh}:${mm}${ampm}`

    // Normalize phone number (iProg/Semaphore style)
    let phone = phoneNumber.replace(/[^0-9]/g, "")
    // Docs say 0917... or maybe generic. Let's keep existing logic or just strip non-digits.
    // Example shows "0917..."

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

        return { ok: true, data }

    } catch (e) {
        console.error("Error creating message reminder:", e)
        return { ok: false, error: e }
    }
}
