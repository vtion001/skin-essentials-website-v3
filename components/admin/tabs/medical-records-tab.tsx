"use client"

import { useState } from "react"
import { Plus, Eye, Trash2, AlertCircle, RefreshCw } from "lucide-react"
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { type MedicalRecord, type Client } from "@/lib/admin-services"
import { maskName } from "@/lib/utils/privacy"

interface MedicalRecordsTabProps {
    medicalRecords: MedicalRecord[]
    clients: Client[]
    privacyMode: boolean
    openMedicalRecordModal: (record?: MedicalRecord) => void
    refreshMedicalRecords: () => Promise<void>
    showNotification: (type: "success" | "error", message: string) => void
}

export function MedicalRecordsTab({
    medicalRecords,
    clients,
    privacyMode,
    openMedicalRecordModal,
    refreshMedicalRecords,
    showNotification,
}: MedicalRecordsTabProps) {
    const [confirmMedicalRecord, setConfirmMedicalRecord] = useState<MedicalRecord | null>(null)
    const [confirmMedicalDeleting, setConfirmMedicalDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirmMedicalRecord) return
        setConfirmMedicalDeleting(true)
        try {
            const csrf =
                typeof document !== "undefined"
                    ? document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)?.[1] || ""
                    : ""
            const res = await fetch("/api/admin/medical-records", {
                method: "DELETE",
                headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
                credentials: "include",
                body: JSON.stringify({ id: confirmMedicalRecord.id }),
            })
            if (res.ok) {
                await refreshMedicalRecords()
                showNotification("success", "Medical record deleted")
                setConfirmMedicalRecord(null)
            } else {
                showNotification("error", "Failed to delete medical record")
            }
        } finally {
            setConfirmMedicalDeleting(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Electronic Medical Records</h2>
                <Button
                    onClick={() => openMedicalRecordModal()}
                    className="bg-[#0F2922] hover:bg-[#0F2922]/90 text-white shadow-2xl shadow-[#0F2922]/30 hover:shadow-[#0F2922]/40 transition-all duration-300 hover:scale-105 font-bold px-6 py-3 rounded-2xl"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Record
                </Button>
            </div>

            <Card className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20">
                <CardContent className="p-4 sm:p-6">
                    <Table>
                        <TableHeader className="bg-[#FDFCFB]">
                            <TableRow className="border-b border-[#E2D1C3]/20 hover:bg-transparent">
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] py-5">
                                    Client
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    Date
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    Chief Complaint
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    Treatment Plan
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    Confidential
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {medicalRecords.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-gray-400 font-medium">
                                        No medical records found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {medicalRecords.map((record) => {
                                const client = clients.find((c) => c.id === record.clientId)
                                const clientName = client ? `${client.firstName} ${client.lastName}` : "Unknown Client"
                                return (
                                    <TableRow
                                        key={record.id}
                                        className="group border-b border-[#E2D1C3]/10 hover:bg-[#FDFCFB] transition-colors cursor-default"
                                    >
                                        <TableCell className="py-4">
                                            <div className="font-bold text-[#1A1A1A] tracking-tight">
                                                {client?.firstName === "[Unavailable]" ? (
                                                    <Badge variant="outline" className="text-[9px] bg-red-50 text-red-600 border-red-100 py-0.5 normal-case">Secure Name Locked</Badge>
                                                ) : (
                                                    privacyMode ? maskName(clientName) : clientName
                                                )}
                                            </div>
                                            <div className="text-[10px] text-[#8B735B] font-medium tracking-tight uppercase mt-0.5">
                                                {client?.email === "[Unavailable]" ? (
                                                    <Badge variant="outline" className="text-[8px] bg-amber-50 text-amber-600 border-amber-100 py-0 normal-case">Secure Email Locked</Badge>
                                                ) : (client?.email || "")}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-[11px] font-bold text-[#1A1A1A]">
                                                {new Date(record.date).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <div className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-tight truncate">
                                                {record.chiefComplaint === "[Unavailable]" ? (
                                                    <span className="text-amber-600">Locked</span>
                                                ) : record.chiefComplaint}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            {record.decryption_error || record.treatmentPlan === "[Unavailable]" ? (
                                                <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border">
                                                    Record Unavailable - Contact Admin
                                                </Badge>
                                            ) : (
                                                <div className="text-[10px] text-[#8B735B]/70 font-bold uppercase tracking-widest truncate">
                                                    {record.treatmentPlan}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {record.isConfidential ? (
                                                <Badge className="bg-rose-50 text-rose-600 border-rose-100 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border">
                                                    Confidential
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border">
                                                    Standard
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-lg text-[#8B735B] hover:bg-[#E2D1C3]/20"
                                                    onClick={() => openMedicalRecordModal(record)}
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                                                    onClick={() => setConfirmMedicalRecord(record)}
                                                    aria-label="Delete medical record"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!confirmMedicalRecord}
                onOpenChange={(open) => {
                    if (!open && !confirmMedicalDeleting) setConfirmMedicalRecord(null)
                }}
            >
                <DialogContent className="max-w-md bg-white/80 backdrop-blur-sm border border-rose-200/60 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-rose-600" />
                            Delete Medical Record
                        </DialogTitle>
                    </DialogHeader>
                    {confirmMedicalRecord && (
                        <div className="space-y-3 text-sm text-gray-700">
                            <p>Are you sure you want to delete this medical record? This action cannot be undone.</p>
                            <div className="rounded-lg border bg-white/70 p-3">
                                <div className="font-medium">
                                    {(() => {
                                        const c = clients.find((x) => x.id === confirmMedicalRecord.clientId)
                                        return c ? `${c.firstName} ${c.lastName}` : "Unknown Client"
                                    })()}
                                </div>
                                <div className="text-gray-600">
                                    {new Date(confirmMedicalRecord.date).toLocaleDateString()}
                                </div>
                                {confirmMedicalRecord.chiefComplaint && (
                                    <div className="text-gray-600 truncate">{confirmMedicalRecord.chiefComplaint}</div>
                                )}
                                {confirmMedicalRecord.treatmentPlan && (
                                    <div className="text-gray-600 truncate">{confirmMedicalRecord.treatmentPlan}</div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmMedicalRecord(null)}
                            disabled={confirmMedicalDeleting}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            {confirmMedicalDeleting ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
