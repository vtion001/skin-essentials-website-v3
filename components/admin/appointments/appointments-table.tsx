"use client"

import React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    Edit,
    Trash2,
    UserPlus,
    MessageSquare,
} from "lucide-react"
import { Appointment } from "@/lib/types/admin.types"
import { AppointmentStatusSelect } from "./appointment-status-select"
import { cn } from "@/lib/utils"

interface AppointmentsTableProps {
    appointments: Appointment[]
    isLoading: boolean
    onEdit: (appointment: Appointment) => void
    onDelete: (appointment: Appointment) => void
    onStatusChange: (id: string, status: Appointment['status']) => void
    onViberNotify: (appointment: Appointment) => void
    onQuickAddClient: (appointment: Appointment) => void
}

export function AppointmentsTable({
    appointments,
    isLoading,
    onEdit,
    onDelete,
    onStatusChange,
    onViberNotify,
    onQuickAddClient,
}: AppointmentsTableProps) {
    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading appointments...</div>
    }

    if (appointments.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">No appointments found.</div>
    }

    return (
        <div className="rounded-2xl border border-[#E2D1C3]/20 overflow-hidden bg-white/50 backdrop-blur-sm">
            <Table>
                <TableHeader className="bg-[#E2D1C3]/10">
                    <TableRow className="border-[#E2D1C3]/20 hover:bg-transparent">
                        <TableHead className="w-[200px] text-[#8B735B] font-bold uppercase text-[11px] tracking-wider py-4">Client Information</TableHead>
                        <TableHead className="text-[#8B735B] font-bold uppercase text-[11px] tracking-wider py-4">Service Details</TableHead>
                        <TableHead className="w-[150px] text-[#8B735B] font-bold uppercase text-[11px] tracking-wider py-4">Schedule</TableHead>
                        <TableHead className="w-[140px] text-[#8B735B] font-bold uppercase text-[11px] tracking-wider py-4">Status</TableHead>
                        <TableHead className="w-[100px] text-[#8B735B] font-bold uppercase text-[11px] tracking-wider py-4">Price</TableHead>
                        <TableHead className="w-[100px] text-right text-[#8B735B] font-bold uppercase text-[11px] tracking-wider py-4">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {appointments.map((a) => (
                        <TableRow key={a.id} className="group border-[#E2D1C3]/10 hover:bg-[#E2D1C3]/5 transition-colors">
                            <TableCell>
                                <div className="space-y-0.5">
                                    <div className="font-bold text-[#1A1A1A]">{a.clientName}</div>
                                    <div className="text-[11px] text-[#8B735B] font-medium">{a.clientPhone}</div>
                                    {a.clientEmail && <div className="text-[10px] text-gray-400">{a.clientEmail}</div>}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-0.5">
                                    <div className="text-[13px] font-medium text-[#1A1A1A]">{a.service}</div>
                                    {a.notes && <div className="text-[11px] text-gray-400 italic line-clamp-1">{a.notes}</div>}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-[11px] font-bold text-[#1A1A1A]">{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                <div className="text-[10px] text-[#8B735B] font-bold">{a.time}</div>
                            </TableCell>
                            <TableCell>
                                <AppointmentStatusSelect
                                    status={a.status}
                                    appointmentId={a.id}
                                    onUpdateStatus={onStatusChange}
                                />
                            </TableCell>
                            <TableCell className="font-bold text-[#1A1A1A]">₱{a.price.toLocaleString()}</TableCell>
                            <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                    <Button size="icon" variant="ghost" onClick={() => onQuickAddClient(a)} className="h-8 w-8 rounded-lg text-[#8B735B] hover:bg-[#E2D1C3]/20" title="Add to Client List">
                                        <UserPlus className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => onEdit(a)} className="h-8 w-8 rounded-lg text-[#8B735B] hover:bg-[#E2D1C3]/20" title="Edit Appointment">
                                        <Edit className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => onViberNotify(a)} className="h-8 w-8 rounded-lg text-[#7360F2] hover:bg-[#7360F2]/10" title="Notify via Viber">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => onDelete(a)} className="h-8 w-8 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50" title="Delete Appointment">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
