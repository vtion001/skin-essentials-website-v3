// Database Schema Types (snake_case from Supabase)
// These represent the actual database column names

export interface AppointmentRow {
    id: string
    client_id: string
    client_name: string
    client_email: string
    client_phone: string
    service: string
    date: string
    time: string
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
    notes: string | null
    duration: number
    price: number
    created_at: string
    updated_at: string
}

export interface ClientRow {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    date_of_birth: string | null
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say' | null
    address: string | null
    emergency_contact: string | null
    medical_history: string | null
    allergies: string | null
    preferences: string | null
    source: 'website' | 'referral' | 'facebook' | 'instagram' | 'tiktok' | 'walk_in' | 'social_media'
    status: 'active' | 'inactive' | 'blocked'
    total_spent: number
    last_visit: string | null
    created_at: string
    updated_at: string
}

export interface PaymentRow {
    id: string
    appointment_id: string | null
    client_id: string
    amount: number
    method: 'gcash' | 'bank_transfer' | 'cash' | 'card'
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    transaction_id: string | null
    receipt_url: string | null
    uploaded_files: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

export interface MedicalRecordRow {
    id: string
    client_id: string
    appointment_id: string | null
    date: string
    chief_complaint: string
    medical_history: string | null
    allergies: string | null
    current_medications: string | null
    treatment_plan: string
    notes: string
    attachments: string | null
    created_by: string
    created_at: string
    updated_at: string
    is_confidential: boolean
    treatments: string | null
}

export interface StaffRow {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    position: 'anesthesiologist' | 'surgeon_aesthetic' | 'dermatologist' | 'nurse' | 'admin' | 'receptionist' | 'therapist' | 'technician' | 'other'
    department: string | null
    license_number: string | null
    specialties: string | null
    hire_date: string
    status: 'active' | 'on_leave' | 'inactive' | 'terminated'
    avatar_url: string | null
    notes: string | null
    treatments: string | null
    created_at: string
    updated_at: string
}
