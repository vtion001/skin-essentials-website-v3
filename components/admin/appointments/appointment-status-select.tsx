"use client"

import React from "react"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Appointment } from "@/lib/types/admin.types"

interface AppointmentStatusSelectProps {
    status: Appointment['status']
    appointmentId: string
    onUpdateStatus: (id: string, status: Appointment['status']) => void
}

export function AppointmentStatusSelect({ status, appointmentId, onUpdateStatus }: AppointmentStatusSelectProps) {
    return (
        <Select
            value={status}
            onValueChange={(v) => onUpdateStatus(appointmentId, v as Appointment['status'])}
        >
            <SelectTrigger className={cn(
                "h-auto py-1 px-3 rounded-full border shadow-none text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-80 focus:ring-0 w-fit gap-1.5 [&>svg]:w-2.5 [&>svg]:h-2.5 [&>svg]:opacity-50",
                status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    status === 'confirmed' ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' :
                        status === 'scheduled' ? 'bg-[#E2D1C3]/20 text-[#8B735B] border-[#E2D1C3]/30' :
                            'bg-rose-50 text-rose-600 border-rose-100'
            )}>
                <SelectValue>{status}</SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-[#E2D1C3]/30 bg-white/95 backdrop-blur-xl shadow-xl p-1">
                <SelectItem value="scheduled" className="rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#8B735B] focus:bg-[#E2D1C3]/10 focus:text-[#8B735B] cursor-pointer">Scheduled</SelectItem>
                <SelectItem value="confirmed" className="rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] focus:bg-[#1A1A1A]/5 focus:text-[#1A1A1A] cursor-pointer">Confirmed</SelectItem>
                <SelectItem value="completed" className="rounded-xl text-[10px] font-bold uppercase tracking-widest text-emerald-600 focus:bg-emerald-50 focus:text-emerald-600 cursor-pointer">Completed</SelectItem>
                <SelectItem value="cancelled" className="rounded-xl text-[10px] font-bold uppercase tracking-widest text-rose-600 focus:bg-rose-50 focus:text-rose-600 cursor-pointer">Cancelled</SelectItem>
                <SelectItem value="no-show" className="rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-600 focus:bg-gray-50 focus:text-gray-600 cursor-pointer">No Show</SelectItem>
            </SelectContent>
        </Select>
    )
}
