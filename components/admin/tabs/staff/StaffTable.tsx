"use client"

import { Edit, Eye, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { type Staff, type Client } from "@/lib/admin-services"
import { maskName } from "@/lib/utils/privacy"

interface TreatmentFormItem {
    date?: string
    procedure: string
    clientName?: string
    clientId?: string
    total: number
}

interface StaffTableProps {
    staff: Staff[]
    clients: Client[]
    privacyMode: boolean
    onEdit: (staff: Staff) => void
    onDelete: (staff: Staff) => void
    onPreview: (staff: Staff) => void
    onAddTreatment: (staff: Staff, treatments: TreatmentFormItem[]) => void
}

export function StaffTable({
    staff,
    clients,
    privacyMode,
    onEdit,
    onDelete,
    onPreview,
    onAddTreatment,
}: StaffTableProps) {
    return (
        <Card className="bg-white/60 backdrop-blur-sm border border-white/70 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
                <div className="relative w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                    <Table className="min-w-[1000px] lg:min-w-full">
                        <TableHeader className="bg-[#FDFCFB]">
                            <TableRow className="border-b border-[#E2D1C3]/20 hover:bg-transparent">
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] py-5">
                                    Staff
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    Position
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    Department
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    License
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    Hired
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    Status
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    Treatments
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff.map((s) => (
                                <TableRow
                                    key={s.id}
                                    className="group border-b border-[#E2D1C3]/10 hover:bg-[#FDFCFB] transition-colors cursor-default"
                                >
                                    <TableCell className="py-4">
                                        <div className="font-bold text-[#1A1A1A] tracking-tight">
                                            {s.firstName === "[Unavailable]" ? (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] bg-red-50 text-red-600 border-red-100 py-0 h-5 normal-case"
                                                >
                                                    Secure Name Locked
                                                </Badge>
                                            ) : (
                                                `${s.firstName} ${s.lastName}`.trim()
                                            )}
                                        </div>
                                        <div className="text-[10px] text-[#8B735B] font-medium tracking-tight uppercase mt-0.5">
                                            {s.email === "[Unavailable]" ? (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[8px] bg-amber-50 text-amber-600 border-amber-100 py-0 h-4 normal-case"
                                                >
                                                    Secure Email Locked
                                                </Badge>
                                            ) : (
                                                s.email
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-tight">
                                            {s.position?.replace("_", " ") || "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-[10px] text-[#8B735B]/70 font-bold uppercase tracking-widest">
                                            {s.department ?? "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-[11px] font-bold text-[#1A1A1A]">
                                            {s.licenseNumber === "[Unavailable]" ? (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[8px] bg-amber-50 text-amber-600 border-amber-100 py-0 h-4 normal-case"
                                                >
                                                    Secure Locked
                                                </Badge>
                                            ) : privacyMode ? (
                                                s.licenseNumber ? "••••••••" : "-"
                                            ) : (
                                                s.licenseNumber || "-"
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-[11px] font-bold text-[#1A1A1A]">
                                            {new Date(s.hireDate).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={`text-[10px] font-bold uppercase tracking-widest py-0.5 px-3 rounded-full border shadow-none ${s.status === "active"
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                    : "bg-rose-50 text-rose-600 border-rose-100"
                                                }`}
                                        >
                                            {s.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {Array.isArray(s.treatments) && s.treatments.length > 0 ? (
                                            <Table className="bg-transparent">
                                                <TableHeader className="bg-[#FDFCFB]/50">
                                                    <TableRow className="border-b border-[#E2D1C3]/10">
                                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest text-[#8B735B] py-2">
                                                            Proc
                                                        </TableHead>
                                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest text-[#8B735B]">
                                                            Client
                                                        </TableHead>
                                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest text-[#8B735B] text-right">
                                                            Total
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {s.treatments.slice(0, 3).map((t: any, i: number) => (
                                                        <TableRow key={i} className="border-none">
                                                            <TableCell className="py-1 text-[9px] font-bold text-[#1A1A1A] truncate max-w-[6rem]">
                                                                {t.procedure === "[Unavailable]" ? "Locked" : t.procedure}
                                                            </TableCell>
                                                            <TableCell className="py-1 text-[9px] text-[#8B735B] truncate max-w-[6rem]">
                                                                {t.clientName === "[Unavailable]" ||
                                                                    t.client_name === "[Unavailable]"
                                                                    ? "Locked"
                                                                    : privacyMode
                                                                        ? maskName(t.clientName || t.client_name || "")
                                                                        : t.clientName || t.client_name || "-"}
                                                            </TableCell>
                                                            <TableCell className="py-1 text-[9px] font-bold text-[#1A1A1A] text-right">
                                                                ₱{Number(t.total || 0).toLocaleString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <span className="text-[10px] text-[#8B735B]/40 font-bold uppercase tracking-widest">
                                                No activities
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 justify-end">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    const treatments = [
                                                        ...(s.treatments || []).map((t: any) => ({
                                                            ...t,
                                                            clientId:
                                                                t.clientId ||
                                                                clients.find(
                                                                    (c) => `${c.firstName} ${c.lastName}`.trim() === t.clientName
                                                                )?.id,
                                                        })),
                                                        {
                                                            procedure: "",
                                                            clientName: "",
                                                            clientId: "",
                                                            total: 0,
                                                            date: new Date().toISOString().slice(0, 10),
                                                        },
                                                    ]
                                                    onAddTreatment(s, treatments)
                                                }}
                                                className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50"
                                                title="Treatment Tracking"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => onEdit(s)}
                                                className="h-8 w-8 rounded-lg text-[#8B735B] hover:bg-[#E2D1C3]/20"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => onPreview(s)}
                                                className="h-8 w-8 rounded-lg text-[#8B735B] hover:bg-[#E2D1C3]/20"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => onDelete(s)}
                                                className="h-8 w-8 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
