/**
 * Centralized SMS Templates for Skin Essentials
 * Use these templates to ensure consistent messaging across all platforms.
 */

export const SMS_TEMPLATES = {
    // Appointment Lifecycle
    APPOINTMENT_CONFIRMED: "Dear {name}, your appointment for {service} at Skin Essentials on {date} at {time} has been CONFIRMED. Please arrive 10 mins early. Thank you!",
    APPOINTMENT_RECEIVED: "Dear {name}, your booking for {service} on {date} at {time} is RECEIVED. We will review it and notify you once confirmed. Thank you!",
    
    // Reminders
    REMINDER_24H: "Hello {name}, this is a gentle reminder for your appointment with Skin Essentials on {date} at {time}. See you soon!",
    REMINDER_3H: "Hi {name}, seeing you in 3 hours for your {service} at Skin Essentials today at {time}!",
    REMINDER_1H: "Hi {name}, just a quick reminder! Your appointment is in 1 hour ({time}). We're ready for you!",
    
    // Generic / Admin
    GENERIC_CONFIRMATION: "Hi {name}, your appointment on {date} at {time} is confirmed. Reply YES to acknowledge.",
    GENERIC_REMINDER: "Hello {name}, this is a reminder for your appointment on {date} at {time}.",
} as const;

export type SmsTemplateKey = keyof typeof SMS_TEMPLATES;

interface TemplateData {
    name?: string;
    service?: string;
    date?: string;
    time?: string;
    [key: string]: string | undefined;
}

/**
 * Formats a template string by replacing placeholders like {name}, {date}, etc.
 */
export function formatSms(templateKey: SmsTemplateKey, data: TemplateData): string {
    let template: string = SMS_TEMPLATES[templateKey];
    
    Object.entries(data).forEach(([key, value]) => {
        const placeholder = new RegExp(`{${key}}`, 'g');
        template = template.replace(placeholder, value || '');
    });
    
    return template;
}
