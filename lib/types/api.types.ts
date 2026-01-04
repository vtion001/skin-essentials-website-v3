// Webhook Payload Types for Facebook and Instagram
// Based on Meta's Graph API documentation

export interface FacebookWebhookEntry {
    id: string
    time: number
    messaging?: FacebookMessagingEvent[]
    changes?: FacebookChange[]
}

export interface FacebookMessagingEvent {
    sender: { id: string }
    recipient: { id: string }
    timestamp: number
    mid?: string // Message ID at event level
    delivery?: { mids: string[]; watermark: number }
    read?: { watermark: number }
    message?: {
        mid: string
        text?: string
        attachments?: Array<{
            type: string
            payload?: {
                url?: string
                [key: string]: unknown
            }
        }>
    }
    postback?: {
        title: string
        payload: string
    }
}

export interface FacebookChange {
    field: string
    value: {
        from?: { id: string; name?: string }
        post_id?: string
        verb?: string
        item?: string
        comment_id?: string
        message?: string
        [key: string]: unknown
    }
}

export interface InstagramWebhookEntry {
    id: string
    time: number
    messaging?: InstagramMessagingEvent[]
    changes?: InstagramChange[]
}

export interface InstagramMessagingEvent {
    sender: { id: string }
    recipient: { id: string }
    timestamp: number
    mid?: string // Message ID at event level
    message?: {
        mid: string
        text?: string
        attachments?: Array<{
            type: string
            payload?: {
                url?: string
                [key: string]: unknown
            }
        }>
    }
}

export interface InstagramChange {
    field: string
    value: {
        from?: { id: string; username?: string }
        media_id?: string
        comment_id?: string
        text?: string
        [key: string]: unknown
    }
}

// Gmail API Types
export interface GmailMessage {
    id: string
    threadId: string
    labelIds?: string[]
    snippet?: string
    payload?: {
        headers?: Array<{
            name: string
            value: string
        }>
        body?: {
            data?: string
        }
        parts?: Array<{
            body?: {
                data?: string
            }
        }>
    }
}

export interface GmailListResponse {
    messages?: Array<{
        id: string
        threadId: string
    }>
    nextPageToken?: string
    resultSizeEstimate?: number
}

// Service Category Types
export interface ServiceFAQ {
    q: string
    a: string
}

export interface Service {
    name: string
    description: string
    price: string
    duration?: string
    results?: string
    sessions?: string
    includes?: string
    benefits?: string[]
    faqs?: ServiceFAQ[]
    originalPrice?: string
    badge?: string
    pricing?: string
    image?: string
}

export interface ServiceCategory {
    id: string
    category: string
    description: string
    image: string
    color: string
    services: Service[]
}

export interface ServiceCategoryRow {
    id: string
    category: string
    description: string | null
    image: string | null
    color: string | null
    services: unknown // JSONB field
}

// Portfolio Types
export interface PortfolioItem {
    id: string
    title: string
    description: string
    before_image: string
    after_image: string
    category: string
    created_at: string
}

// Treatment Types
export interface Treatment {
    id?: string
    date: string
    procedure: string
    aestheticianId?: string
    staffName?: string
    clientId?: string
    clientName?: string
    total?: number
    notes?: string
}

export interface TreatmentRow {
    id: string
    date: string
    procedure: string
    aesthetician_id: string | null
    staff_name: string | null
    client_id: string | null
    client_name: string | null
    total: number | null
    created_at: string
}
