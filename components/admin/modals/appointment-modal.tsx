"use client"

import { useEffect, useState } from "react"
import { Appointment } from "@/lib/types/admin.types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AnimatedInput } from "@/components/ui/animated-input"
import { AnimatedSelect } from "@/components/ui/animated-select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface AppointmentModalProps {
    isOpen: boolean
    onClose: () => void
    appointment: Partial<Appointment> | null
    onCreate: (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>
    onUpdate: (id: string, data: Partial<Appointment>) => Promise<boolean>
    getAvailableTimeSlots: (date: string) => string[]
}

const serviceOptions = [
    "Consultation",
    "Acne Treatment",
    "Anti-Aging Facial",
    "Chemical Peel",
    "Microdermabrasion",
    "Laser Therapy",
    "Microneedling",
    "HydraFacial",
    "Botox / Fillers",
    "Skin Analysis",
    "Follow-up"
]

const statusOptions = ["scheduled", "completed", "cancelled", "no-show"]

const INITIAL_FORM: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> = {
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    service: '',
    date: '',
    time: '',
    status: 'scheduled',
    notes: '',
    duration: 60,
    price: 0
}

export function AppointmentModal({
    isOpen,
    onClose,
    appointment,
    onCreate,
    onUpdate,
    getAvailableTimeSlots
}: AppointmentModalProps) {
    const [form, setForm] = useState(INITIAL_FORM)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [availableTimes, setAvailableTimes] = useState<string[]>([])

    useEffect(() => {
        if (appointment) {
            setForm(prev => ({ ...INITIAL_FORM, ...appointment }))
            if (appointment.date) {
                setAvailableTimes(getAvailableTimeSlots(appointment.date))
            }
        } else {
            setForm(INITIAL_FORM)
            setAvailableTimes([])
        }
    }, [appointment, isOpen]) // Reset on open if needed, mainly on appointment change

    const handleDateChange = (date: string) => {
        setForm(prev => ({ ...prev, date, time: '' }))
        setAvailableTimes(getAvailableTimeSlots(date))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            let success = false
            if (appointment && appointment.id) {
                success = await onUpdate(appointment.id, form)
            } else {
                success = await onCreate(form)
            }

            if (success) {
                onClose()
                setForm(INITIAL_FORM)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(v) => { if (!v) onClose() }} modal={false}>
            <DialogContent className="sm:max-w-xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
                <DialogHeader>
                    <DialogTitle>{appointment ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <AnimatedInput
                            id="apt-name"
                            label="Client Name"
                            value={form.clientName}
                            onChange={(e) => setForm(prev => ({ ...prev, clientName: e.target.value }))}
                        />
                        <AnimatedInput
                            id="apt-phone"
                            label="Phone"
                            value={form.clientPhone}
                            onChange={(e) => setForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                        />
                    </div>
                    <AnimatedInput
                        id="apt-email"
                        label="Email"
                        type="email"
                        value={form.clientEmail}
                        onChange={(e) => setForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <AnimatedSelect
                            label="Service"
                            value={form.service}
                            onValueChange={(v) => setForm(prev => ({ ...prev, service: v }))}
                            options={serviceOptions.map(s => ({ value: s, label: s }))}
                            placeholder="Select Service"
                        />
                        <AnimatedInput
                            id="apt-price"
                            label="Price"
                            type="number"
                            value={form.price}
                            onChange={(e) => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <input
                                type="date"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={form.date}
                                onChange={(e) => handleDateChange(e.target.value)}
                            />
                        </div>
                        <AnimatedSelect
                            label="Time"
                            value={form.time}
                            onValueChange={(v) => setForm(prev => ({ ...prev, time: v }))}
                            options={availableTimes.map(t => ({ value: t, label: t }))}
                            placeholder="Select Time"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <AnimatedInput
                            id="apt-duration"
                            label="Duration (min)"
                            type="number"
                            value={form.duration}
                            onChange={(e) => setForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
                        />
                        <AnimatedSelect
                            label="Status"
                            value={form.status}
                            onValueChange={(v) => setForm(prev => ({ ...prev, status: v as Appointment['status'] }))}
                            options={statusOptions.map(s => ({ value: s, label: s }))}
                            placeholder="Select Status"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                            value={form.notes}
                            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Add notes..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button variant="brand" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            appointment?.id ? 'Update Appointment' : 'Create Appointment'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
