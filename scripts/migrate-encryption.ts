/**
 * HIPAA Data Migration Script
 * Encrypts existing plaintext data in compliance with the new security policy.
 */
import { supabaseAdminClient } from '../lib/supabase-admin'
import { aesEncrypt, aesEncryptToString } from '../lib/utils'
import dotenv from 'dotenv'

// Load environment variables for local execution
dotenv.config({ path: '.env.local' })

function isEncrypted(val: any): boolean {
    if (!val) return true; // Treat null/empty as "done" or not needed
    if (typeof val === 'object' && val.iv && val.tag && val.data) return true;
    if (typeof val !== 'string') return false;
    try {
        const parsed = JSON.parse(val);
        return !!(parsed && parsed.iv && parsed.tag && parsed.data);
    } catch {
        return false;
    }
}

async function migrate() {
    const admin = supabaseAdminClient()
    if (!admin) {
        console.error('Failed to initialize Supabase admin client.')
        return
    }

    console.log('Starting HIPAA Data Migration...')

    // 1. Migrate Clients
    console.log('--- Migrating Clients ---')
    const { data: clients, error: clientError } = await admin.from('clients').select('*')
    if (clientError) {
        console.error('Error fetching clients:', clientError)
    } else if (clients) {
        for (const client of clients) {
            const updates: any = {}

            // Text fields
            if (!isEncrypted(client.email)) updates.email = aesEncryptToString(client.email)
            if (!isEncrypted(client.phone)) updates.phone = aesEncryptToString(client.phone)
            if (!isEncrypted(client.address)) updates.address = aesEncryptToString(client.address)

            // JSONB fields
            if (client.emergency_contact && !isEncrypted(client.emergency_contact)) {
                updates.emergency_contact = aesEncrypt(client.emergency_contact)
            }
            if (client.medical_history && !isEncrypted(client.medical_history)) {
                updates.medical_history = aesEncrypt(client.medical_history)
            }
            if (client.allergies && !isEncrypted(client.allergies)) {
                updates.allergies = aesEncrypt(client.allergies)
            }
            if (client.preferences && !isEncrypted(client.preferences)) {
                updates.preferences = aesEncrypt(client.preferences)
            }

            if (Object.keys(updates).length > 0) {
                const { error } = await admin.from('clients').update(updates).eq('id', client.id)
                if (error) console.error(`Failed to update client ${client.id}:`, error)
                else console.log(`Encrypted client ${client.id}`)
            }
        }
    }

    // 2. Migrate Appointments
    console.log('--- Migrating Appointments ---')
    const { data: appts, error: apptError } = await admin.from('appointments').select('*')
    if (apptError) {
        console.error('Error fetching appointments:', apptError)
    } else if (appts) {
        for (const appt of appts) {
            const updates: any = {}
            if (!isEncrypted(appt.client_email)) updates.client_email = aesEncryptToString(appt.client_email)
            if (!isEncrypted(appt.client_phone)) updates.client_phone = aesEncryptToString(appt.client_phone)

            if (Object.keys(updates).length > 0) {
                const { error } = await admin.from('appointments').update(updates).eq('id', appt.id)
                if (error) console.error(`Failed to update appointment ${appt.id}:`, error)
                else console.log(`Encrypted appointment ${appt.id}`)
            }
        }
    }

    // 3. Migrate Treatments
    console.log('--- Migrating Treatments ---')
    const { data: treatments, error: treatError } = await admin.from('treatments').select('*')
    if (treatError) {
        console.error('Error fetching treatments:', treatError)
    } else if (treatments) {
        for (const treat of treatments) {
            const updates: any = {}
            if (!isEncrypted(treat.procedure)) updates.procedure = aesEncryptToString(treat.procedure)
            if (!isEncrypted(treat.notes)) updates.notes = aesEncryptToString(treat.notes)

            if (Object.keys(updates).length > 0) {
                const { error } = await admin.from('treatments').update(updates).eq('id', treat.id)
                if (error) console.error(`Failed to update treatment ${treat.id}:`, error)
                else console.log(`Encrypted treatment ${treat.id}`)
            }
        }
    }

    // 4. Migrate Staff
    console.log('--- Migrating Staff ---')
    const { data: staff, error: staffError } = await admin.from('staff').select('*')
    if (staffError) {
        console.error('Error fetching staff:', staffError)
    } else if (staff) {
        for (const s of staff) {
            const updates: any = {}
            if (!isEncrypted(s.license_number)) updates.license_number = aesEncryptToString(s.license_number)
            if (!isEncrypted(s.notes)) updates.notes = aesEncryptToString(s.notes)

            if (Object.keys(updates).length > 0) {
                const { error } = await admin.from('staff').update(updates).eq('id', s.id)
                if (error) console.error(`Failed to update staff member ${s.id}:`, error)
                else console.log(`Encrypted staff member ${s.id}`)
            }
        }
    }

    console.log('HIPAA Migration Completed.')
}

migrate()
