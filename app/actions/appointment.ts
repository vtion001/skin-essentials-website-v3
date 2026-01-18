'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdminClient } from '@/lib/supabase-admin'
import { Appointment } from '@/lib/types/admin.types'
import { AppointmentSchema } from '@/lib/validations/appointment'
import { formatSms } from '@/lib/sms-templates'
import { z } from 'zod'

// Helper to check duplicates
async function checkDuplicate(date: string, time: string, excludeId?: string) {
    const admin = supabaseAdminClient()
    if (!admin) return false

    let query = admin
        .from('appointments')
        .select('id')
        .eq('date', date)
        .eq('time', time)

    if (excludeId) {
        query = query.neq('id', excludeId)
    }

    const { data } = await query.maybeSingle()
    return !!data
}

export async function createAppointmentAction(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) {
    const admin = supabaseAdminClient()
    if (!admin) return { success: false, error: 'Database unavailable' }

    // 0. Validate Input
    const parse = AppointmentSchema.safeParse(data)
    if (!parse.success) {
        return { success: false, error: parse.error.issues.map(i => i.message).join(', ') }
    }
    const validated = parse.data

    // 1. Duplicate check
    const isDuplicate = await checkDuplicate(validated.date, validated.time)
    if (isDuplicate) {
        return { success: false, error: 'This time slot is already booked.' }
    }

    const payload = {
        id: `apt_${Date.now()}`,
        client_id: validated.clientId,
        client_name: validated.clientName,
        client_email: validated.clientEmail,
        client_phone: validated.clientPhone,
        service: validated.service,
        date: validated.date,
        time: validated.time,
        status: validated.status,
        notes: validated.notes || '',
        duration: validated.duration,
        price: validated.price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }

    try {
        const { error } = await admin.from('appointments').insert(payload).single()
        if (error) throw new Error(error.message)

        // Side Effects (Fire and forget, or await?)
        // In Server Actions, it's safe to await.

        // 2. SMS
        if (payload.client_phone) {
            try {
                const { sendSms } = await import("@/lib/sms-service")
                const msg = formatSms('GENERIC_CONFIRMATION', {
                    name: payload.client_name,
                    date: payload.date,
                    time: payload.time
                });
                await sendSms(payload.client_phone, msg)
            } catch (e) {
                console.error('SMS Error:', e)
            }
        }

        // 3. Viber
        try {
            const { notifyNewBookingViber } = await import("@/lib/viber-service")
            await notifyNewBookingViber(payload)
        } catch (e) {
            console.error('Viber Error:', e)
        }

        // 4. Reminders
        if (payload.client_phone && payload.date && payload.time) {
            try {
                const { createMessageReminder } = await import("@/lib/iprogsms")
                const apptTime = new Date(`${payload.date}T${payload.time}:00`)
                const now = new Date()

                // 24h
                const time24 = new Date(apptTime.getTime() - 24 * 60 * 60 * 1000)
                if (time24 > now) {
                    const msg = formatSms('REMINDER_24H', {
                        name: payload.client_name,
                        date: payload.date,
                        time: payload.time
                    });
                    await createMessageReminder(payload.client_phone, msg, time24)
                }

                // 3h
                const time3 = new Date(apptTime.getTime() - 3 * 60 * 60 * 1000)
                if (time3 > now) {
                    const msg = formatSms('REMINDER_3H', {
                        name: payload.client_name,
                        service: payload.service || 'appointment',
                        time: payload.time
                    });
                    await createMessageReminder(payload.client_phone, msg, time3)
                }

                // 1h
                const time1 = new Date(apptTime.getTime() - 1 * 60 * 60 * 1000)
                if (time1 > now) {
                    const msg = formatSms('REMINDER_1H', {
                        name: payload.client_name,
                        time: payload.time
                    });
                    await createMessageReminder(payload.client_phone, msg, time1)
                }
            } catch (e) {
                console.error('Reminder Error:', e)
            }
        }

        revalidatePath('/admin')
        return { success: true, data: { ...payload, id: payload.id } }

    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to create appointment' }
    }
}

export async function updateAppointmentAction(id: string, updates: Partial<Appointment>) {
    const admin = supabaseAdminClient()
    if (!admin) return { success: false, error: 'Database unavailable' }

    // 0. Validate Input (Partial)
    const parse = AppointmentSchema.partial().safeParse(updates)
    if (!parse.success) {
        return { success: false, error: parse.error.issues.map(i => i.message).join(', ') }
    }
    const validated = parse.data

    // 1. Duplicate check only if date/time changing
    if (validated.date || validated.time) {
        // Need current appointment to fill gaps if only one provided? 
        // For simplicity, assume if one changes, we might need both or check current.
        // But `checkDuplicate` needs explicit date/time.
        // If we update only Time, we need current Date.

        // Fetch current to be safe if strictly checking
        const { data: current } = await admin.from('appointments').select('date, time').eq('id', id).single()

        const checkDate = validated.date || current?.date
        const checkTime = validated.time || current?.time

        if (checkDate && checkTime) {
            const isDuplicate = await checkDuplicate(checkDate, checkTime, id)
            if (isDuplicate) {
                return { success: false, error: 'This time slot is already booked.' }
            }
        }
    }
    const payload = {
        client_id: updates.clientId,
        client_name: updates.clientName,
        client_email: updates.clientEmail,
        client_phone: updates.clientPhone,
        service: updates.service,
        date: updates.date,
        time: updates.time,
        status: updates.status,
        notes: updates.notes,
        duration: updates.duration,
        price: updates.price,
        updated_at: new Date().toISOString()
    }

    // Remove undefined keys
    Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key])

    try {
        const { error } = await admin.from('appointments').update(payload).eq('id', id)
        if (error) throw new Error(error.message)

        revalidatePath('/admin')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function deleteAppointmentAction(id: string) {
    const admin = supabaseAdminClient()
    if (!admin) return { success: false, error: 'Database unavailable' }

    try {
        const { error } = await admin.from('appointments').delete().eq('id', id)
        if (error) throw new Error(error.message)

        revalidatePath('/admin')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function getAppointmentsAction() {
    const admin = supabaseAdminClient()
    if (!admin) return { success: false, error: 'Database unavailable' }

    try {
        const { data, error } = await admin
            .from('appointments')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)

        const { DecryptionService } = await import("@/lib/encryption/decrypt.service")

        const decryptedData = (data || []).map((apt: any) => {
            const dec = DecryptionService.decryptObject(apt, [
                'client_name',
                'client_email',
                'client_phone',
                'service',
                'notes'
            ])

            const hasError =
                dec.client_name === "[Unavailable]" ||
                dec.client_email === "[Unavailable]"

            return {
                ...dec,
                decryption_error: hasError
            }
        })

        return { success: true, data: decryptedData }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
