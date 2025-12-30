import { supabaseAdminClient } from "@/lib/supabase-admin"

export interface ViberSender {
    name: string;
    avatar?: string;
}

export interface ViberMessage {
    receiver: string;
    type: 'text' | 'picture' | 'video' | 'file' | 'location' | 'contact' | 'sticker' | 'url' | 'rich_media';
    sender: ViberSender;
    text?: string;
    media?: string;
    thumbnail?: string;
    size?: number;
    duration?: number;
    location?: { lat: string; lon: string };
    contact?: { name: string; phone_number: string };
    sticker_id?: number;
    rich_media?: any;
    min_api_version?: number;
}

/**
 * Sends a generic message via Viber REST API
 */
export async function sendViberMessage(message: ViberMessage) {
    const token = process.env.VIBER_AUTH_TOKEN;
    if (!token) {
        console.warn("VIBER_AUTH_TOKEN is not set - skipping notification");
        return { ok: false, error: "VIBER_AUTH_TOKEN is not set" };
    }

    try {
        const response = await fetch("https://chatapi.viber.com/pa/send_message", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Viber-Auth-Token": token
            },
            body: JSON.stringify(message)
        });

        const data = await response.json();
        if (data.status !== 0) {
            console.error("Viber API Error Status:", data.status, data.status_message);
            await logViber('Viber', message.receiver, `Error: ${data.status_message}`, data);
            return { ok: false, error: data.status_message, code: data.status };
        }

        await logViber('Viber', message.receiver, message.text || `Sent ${message.type} message`, data);
        return { ok: true, data };
    } catch (error) {
        console.error("Viber Fetch Error:", error);
        return { ok: false, error: "Network error occurred connecting to Viber" };
    }
}

/**
 * Specifically formats and sends a new booking notification to the admin
 */
export async function notifyNewBookingViber(appointment: any) {
    const adminReceiverId = process.env.VIBER_ADMIN_RECEIVER_ID;
    if (!adminReceiverId) {
        console.warn("VIBER_ADMIN_RECEIVER_ID is not set - skipping notification");
        return { ok: false, error: "VIBER_ADMIN_RECEIVER_ID is not set" };
    }

    const { client_name, service, date, time, price, client_email, client_phone } = appointment;

    // Clean formatting for Viber
    const text = `✨ *New Booking Received*\n\n` +
        `👤 *Client:* ${client_name}\n` +
        `✨ *Service:* ${service}\n` +
        `📅 *Schedule:* ${date} at ${time}\n` +
        `💰 *Value:* ₱${Number(price).toLocaleString()}\n` +
        `📧 *Email:* ${client_email || 'N/A'}\n` +
        `📱 *Phone:* ${client_phone || 'N/A'}\n\n` +
        `🔗 View Dashboard: ${process.env.NEXT_PUBLIC_BASE_URL || ''}/admin`;

    return sendViberMessage({
        receiver: adminReceiverId,
        type: 'text',
        sender: {
            name: "SE Notification",
            avatar: "https://skin-essentials-website-v3.vercel.app/logo-bot.png" // Placeholder or enterprise logo
        },
        text: text,
        min_api_version: 1
    });
}

/**
 * Logs the Viber transaction to the error_logs table
 */
async function logViber(provider: string, to: string, message: string, meta: any) {
    const logEntry = {
        context: 'viber_log',
        message: message.substring(0, 200),
        meta: { provider, to, status: 'sent', timestamp: new Date().toISOString(), ...meta }
    }
    const admin = supabaseAdminClient()
    if (admin) {
        try {
            await admin.from('error_logs').insert(logEntry);
        } catch { }
    }
}
