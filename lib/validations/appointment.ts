
import { z } from "zod";

export const AppointmentSchema = z.object({
    id: z.string().optional(),
    clientId: z.string().optional(),
    clientName: z.string().min(1, "Client Name is required"),
    clientEmail: z.string().email("Invalid email address").optional().or(z.literal('')),
    clientPhone: z.string().optional(),
    service: z.string().min(1, "Service is required"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
    status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show']).default('scheduled'),
    duration: z.number().min(1, "Duration must be at least 1 minute"),
    price: z.number().min(0, "Price must be non-negative"),
    notes: z.string().optional(),
});

export type AppointmentInput = z.infer<typeof AppointmentSchema>;
