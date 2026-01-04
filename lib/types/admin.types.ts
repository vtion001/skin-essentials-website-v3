// Admin Dashboard Type Definitions
// Extracted from lib/admin-services.ts for modular architecture

import type { FacebookPage, FacebookConversation, FacebookMessage } from '../facebook-api'
import type { InstagramUser, InstagramConversation, InstagramMessage } from '../instagram-api'

// Re-export external types for convenience
export type { FacebookPage, FacebookConversation, FacebookMessage }
export type { InstagramUser, InstagramConversation, InstagramMessage }

export interface Appointment {
    id: string
    clientId: string
    clientName: string
    clientEmail: string
    clientPhone: string
    service: string
    date: string
    time: string
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
    notes?: string
    duration: number // in minutes
    price: number
    createdAt: string
    updatedAt: string
    decryption_error?: boolean
}

export interface Payment {
    id: string
    appointmentId?: string
    clientId: string
    amount: number
    method: 'gcash' | 'bank_transfer' | 'cash' | 'card'
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    transactionId?: string
    receiptUrl?: string
    uploadedFiles: string[]
    notes?: string
    createdAt: string
    updatedAt: string
    decryption_error?: boolean
}

export interface MedicalRecord {
    id: string
    clientId: string
    appointmentId?: string
    date: string
    chiefComplaint: string
    medicalHistory: string[]
    allergies: string[]
    currentMedications: string[]
    treatmentPlan: string
    notes: string
    attachments: string[]
    createdBy: string
    createdAt: string
    updatedAt: string
    isConfidential: boolean
    decryption_error?: boolean
    treatments?: { date: string; procedure: string; aestheticianId?: string; staffName?: string; total?: number }[]
}

export interface Client {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth?: string
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
    address?: string
    emergencyContact?: {
        name: string
        phone: string
        relationship: string
    }
    medicalHistory: string[]
    allergies: string[]
    preferences: {
        communicationMethod: 'email' | 'sms' | 'phone'
        reminderSettings: boolean
        marketingConsent: boolean
    }
    source: 'website' | 'referral' | 'facebook' | 'instagram' | 'tiktok' | 'walk_in' | 'social_media'
    status: 'active' | 'inactive' | 'blocked'
    totalSpent: number
    lastVisit?: string
    createdAt: string
    updatedAt: string
    decryption_error?: boolean
}

export interface Staff {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    position: 'anesthesiologist' | 'surgeon_aesthetic' | 'dermatologist' | 'nurse' | 'admin' | 'receptionist' | 'therapist' | 'technician' | 'other'
    department?: string
    licenseNumber?: string
    specialties: string[]
    hireDate: string
    status: 'active' | 'on_leave' | 'inactive' | 'terminated'
    avatarUrl?: string
    notes?: string
    treatments?: { procedure: string; clientName?: string; total: number; date?: string }[]
    createdAt: string
    updatedAt: string
    decryption_error?: boolean
}

export interface SocialMessage {
    id: string
    platform: 'instagram' | 'facebook'
    senderId: string
    senderName: string
    senderProfilePicture?: string
    message: string
    timestamp: string
    isRead: boolean
    isReplied: boolean
    replyMessage?: string
    replyTimestamp?: string
    attachments: string[]
    clientId?: string
    conversationId: string
    messageType: 'text' | 'image' | 'video' | 'audio' | 'file'
    isFromPage: boolean // true if message is from business page, false if from user
}

export interface SocialConversation {
    id: string
    platform: 'instagram' | 'facebook'
    participantId: string
    participantName: string
    participantProfilePicture?: string
    lastMessage: string
    lastMessageTimestamp: string
    unreadCount: number
    isActive: boolean
    messages: SocialMessage[]
    pageId?: string
    pageName?: string
    clientId?: string
}

export interface SocialPlatformConnection {
    id: string
    platform: 'instagram' | 'facebook'
    pageId: string
    pageName: string
    accessToken: string
    isConnected: boolean
    lastSyncTimestamp?: string
    webhookVerified: boolean
}

export interface Influencer {
    id: string
    name: string
    handle?: string
    platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'other'
    email?: string
    phone?: string
    referralCode?: string
    commissionRate: number
    totalCommissionPaid: number
    status: 'active' | 'inactive'
    notes?: string
    createdAt: string
    updatedAt: string
}

export interface ReferralRecord {
    id: string
    influencerId: string
    clientId?: string
    clientName: string
    amount: number
    date: string
    appointmentId?: string
    notes?: string
    createdAt: string
}

// Utility constant
export const AVATAR_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="8" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial" font-size="12">IMG</text></svg>'
