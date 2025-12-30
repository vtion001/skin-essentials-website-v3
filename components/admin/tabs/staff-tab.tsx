"use client"

import { useState, useMemo } from "react"
import {
    Search,
    Edit,
    Eye,
    EyeOff,
    Trash2,
    UserPlus,
    Plus,
    BarChart3,
    CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import { type Staff, type Client, type Payment, staffService } from "@/lib/admin-services"
import { maskName } from "@/lib/utils/privacy"

// Treatment form type
interface TreatmentFormItem {
    date?: string
    procedure: string
    clientName?: string
    clientId?: string
    total: number
}

interface StaffTabProps {
    staff: Staff[]
    setStaff: (v: Staff[]) => void
    clients: Client[]
    payments: Payment[]
    privacyMode: boolean
    setPrivacyMode: (v: boolean | ((prev: boolean) => boolean)) => void
    openStaffModal: (staff?: Staff) => void
    confirmTwice: (subject: string) => boolean
    showNotification: (type: "success" | "error", message: string) => void
    procedureOptions: string[]
    patchJson: (url: string, body: any) => Promise<any>

    // Filter states
    search: string
    setSearch: (v: string) => void
    positionFilter: string
    setPositionFilter: (v: string) => void
    statusFilter: string
    setStatusFilter: (v: string) => void
}

export function StaffTab({
    staff,
    setStaff,
    clients,
    payments,
    privacyMode,
    setPrivacyMode,
    openStaffModal,
    confirmTwice,
    showNotification,
    procedureOptions,
    patchJson,
    search,
    setSearch,
    positionFilter,
    setPositionFilter,
    statusFilter,
    setStatusFilter,
}: StaffTabProps) {
    // Dialog states
    const [isStaffTotalsOpen, setIsStaffTotalsOpen] = useState(false)
    const [staffTotalsFilter, setStaffTotalsFilter] = useState("all")
    const [isStaffPreviewOpen, setIsStaffPreviewOpen] = useState(false)
    const [staffPreviewTarget, setStaffPreviewTarget] = useState<Staff | null>(null)
    const [isStaffTreatmentQuickOpen, setIsStaffTreatmentQuickOpen] = useState(false)
    const [staffTreatmentTarget, setStaffTreatmentTarget] = useState<Staff | null>(null)
    const [staffTreatmentForm, setStaffTreatmentForm] = useState<TreatmentFormItem[]>([])
    const [openQuickCalendarIdx, setOpenQuickCalendarIdx] = useState<number | null>(null)

    // Filtered staff based on search and filters
    const filteredStaff = useMemo(() => {
        const q = search.toLowerCase()
        return staff
            .filter((s) => (positionFilter === "all" ? true : s.position === positionFilter))
            .filter((s) => (statusFilter === "all" ? true : s.status === statusFilter))
            .filter(
                (s) =>
                    q === "" ||
                    `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
                    s.email.toLowerCase().includes(q)
            )
    }, [staff, search, positionFilter, statusFilter])

    const handleDelete = async (s: Staff) => {
        if (!confirmTwice(`${s.firstName} ${s.lastName}`.trim() || "this staff")) return
        const res = await fetch("/api/admin/staff", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: s.id }),
        })
        if (res.ok) {
            await staffService.fetchFromSupabase?.()
            setStaff(staffService.getAllStaff())
            showNotification("success", "Staff deleted")
        } else {
            showNotification("error", "Failed to delete staff")
        }
    }

    const handleSaveTreatments = async () => {
        if (!staffTreatmentTarget) return
        try {
            const res = await fetch("/api/admin/treatments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token":
                        document.cookie.split("; ").find((row) => row.startsWith("csrf_token="))?.split("=")[1] ||
                        "",
                },
                body: JSON.stringify({ staffId: staffTreatmentTarget.id, treatments: staffTreatmentForm }),
            })

            if (!res.ok) throw new Error("Failed to save to treatments table")

            await staffService.fetchFromSupabase?.()
            setStaff(staffService.getAllStaff())
            setIsStaffTreatmentQuickOpen(false)
            showNotification("success", "Treatments synced to table")
        } catch (e) {
            console.error(e)
            await patchJson("/api/admin/staff", { id: staffTreatmentTarget.id, treatments: staffTreatmentForm })
            await staffService.fetchFromSupabase?.()
            setStaff(staffService.getAllStaff())
            setIsStaffTreatmentQuickOpen(false)
            showNotification("error", "Table sync failed; saved to staff record instead")
        }
    }

    // Compute totals data for dialog
    const totalsData = useMemo(() => {
        const rows = staff.flatMap((s) =>
            Array.isArray(s.treatments)
                ? s.treatments.map((t: any) => ({
                    staffId: s.id,
                    staffName: `${s.firstName} ${s.lastName}`.trim(),
                    date: t.date || "-",
                    procedure: t.procedure,
                    clientName: t.clientName || "",
                    total: Number(t.total || 0),
                }))
                : []
        ).filter((r) => (staffTotalsFilter === "all" ? true : r.staffId === staffTotalsFilter))

        if (rows.length === 0) return null

        const grandTotal = rows.reduce((acc, r) => acc + r.total, 0)

        const nameById = new Map<string, string>()
        for (const c of clients) {
            nameById.set(c.id, `${c.firstName} ${c.lastName}`.trim())
        }
        const paymentsByClient = new Map<string, number>()
        for (const p of payments) {
            if (String(p.status || "").toLowerCase() !== "completed") continue
            const nm = nameById.get(String(p.clientId)) || ""
            if (!nm) continue
            paymentsByClient.set(nm, (paymentsByClient.get(nm) || 0) + Number(p.amount || 0))
        }
        const paymentsGrandTotal = rows.reduce(
            (sum, r) => sum + (paymentsByClient.get(r.clientName || "") || 0),
            0
        )

        const byStaff = new Map<string, { staffName: string; clients: Map<string, number>; staffTotal: number }>()
        for (const r of rows) {
            const staffEntry = byStaff.get(r.staffId) || {
                staffName: r.staffName,
                clients: new Map<string, number>(),
                staffTotal: 0,
            }
            const cname = r.clientName || ""
            if (cname) staffEntry.clients.set(cname, (staffEntry.clients.get(cname) || 0) + r.total)
            staffEntry.staffTotal += r.total
            byStaff.set(r.staffId, staffEntry)
        }

        return { rows, grandTotal, paymentsGrandTotal, byStaff, paymentsByClient }
    }, [staff, clients, payments, staffTotalsFilter])

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Staffing Management</h2>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search staff..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 w-full sm:w-64"
                        />
                    </div>
                    <Button
                        variant="outline"
                        className="h-9 whitespace-nowrap"
                        onClick={() => setPrivacyMode((prev) => !prev)}
                    >
                        {privacyMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                        {privacyMode ? "Privacy On" : "Privacy Off"}
                    </Button>
                    <Button
                        onClick={() => openStaffModal()}
                        className="bg-[#0F2922] hover:bg-[#0F2922]/90 text-white shadow-2xl shadow-[#0F2922]/30 hover:shadow-[#0F2922]/40 transition-all duration-300 hover:scale-105 font-bold px-6 py-3 rounded-2xl whitespace-nowrap"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Staff
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#8B735B]">Position</Label>
                    <Select value={positionFilter} onValueChange={setPositionFilter}>
                        <SelectTrigger className="h-11 bg-white border-[#E2D1C3]/30 rounded-xl shadow-sm">
                            <SelectValue placeholder="Position" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Positions</SelectItem>
                            <SelectItem value="anesthesiologist">Anesthesiologist</SelectItem>
                            <SelectItem value="surgeon_aesthetic">Surgeon (Aesthetic)</SelectItem>
                            <SelectItem value="dermatologist">Dermatologist</SelectItem>
                            <SelectItem value="nurse">Nurse</SelectItem>
                            <SelectItem value="therapist">Therapist</SelectItem>
                            <SelectItem value="technician">Technician</SelectItem>
                            <SelectItem value="receptionist">Receptionist</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#8B735B]">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-11 bg-white border-[#E2D1C3]/30 rounded-xl shadow-sm">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="on_leave">On Leave</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end">
                    <Button
                        className="h-11 w-full sm:w-auto bg-white border-[#E2D1C3]/30 text-[#8B735B] hover:bg-[#FDFCFB] rounded-xl shadow-sm transition-all"
                        variant="outline"
                        onClick={() => setIsStaffTotalsOpen(true)}
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Totals
                    </Button>
                </div>
            </div>

            {/* Staff Table */}
            <Card className="bg-white/60 backdrop-blur-sm border border-white/70 shadow-2xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="relative w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                        <Table className="min-w-[1000px] lg:min-w-full">
                            <TableHeader className="bg-[#FDFCFB]">
                                <TableRow className="border-b border-[#E2D1C3]/20 hover:bg-transparent">
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] py-5">Staff</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Position</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Department</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">License</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Hired</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Status</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Treatments</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStaff.map((s) => (
                                    <TableRow key={s.id} className="group border-b border-[#E2D1C3]/10 hover:bg-[#FDFCFB] transition-colors cursor-default">
                                        <TableCell className="py-4">
                                            <div className="font-bold text-[#1A1A1A] tracking-tight">{s.firstName} {s.lastName}</div>
                                            <div className="text-[10px] text-[#8B735B] font-medium tracking-tight uppercase mt-0.5">{s.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-tight">{s.position.replace("_", " ")}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-[10px] text-[#8B735B]/70 font-bold uppercase tracking-widest">{s.department ?? "-"}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-[11px] font-bold text-[#1A1A1A]">
                                                {privacyMode
                                                    ? s.licenseNumber
                                                        ? "••••••••"
                                                        : "-"
                                                    : typeof s.licenseNumber === "string" && s.licenseNumber.includes('"iv":')
                                                        ? "••••••••"
                                                        : s.licenseNumber || "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-[11px] font-bold text-[#1A1A1A]">
                                                {new Date(s.hireDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
                                                            <TableHead className="text-[9px] font-bold uppercase tracking-widest text-[#8B735B] py-2">Proc</TableHead>
                                                            <TableHead className="text-[9px] font-bold uppercase tracking-widest text-[#8B735B]">Client</TableHead>
                                                            <TableHead className="text-[9px] font-bold uppercase tracking-widest text-[#8B735B] text-right">Total</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {s.treatments.slice(0, 3).map((t: any, i: number) => (
                                                            <TableRow key={i} className="border-none">
                                                                <TableCell className="py-1 text-[9px] font-bold text-[#1A1A1A] truncate max-w-[6rem]">{t.procedure}</TableCell>
                                                                <TableCell className="py-1 text-[9px] text-[#8B735B] truncate max-w-[6rem]">
                                                                    {privacyMode ? maskName(t.clientName || "") : t.clientName || "-"}
                                                                </TableCell>
                                                                <TableCell className="py-1 text-[9px] font-bold text-[#1A1A1A] text-right">₱{Number(t.total).toLocaleString()}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            ) : (
                                                <span className="text-[10px] text-[#8B735B]/40 font-bold uppercase tracking-widest">No activities</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 justify-end">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setStaffTreatmentTarget(s)
                                                        setStaffTreatmentForm([
                                                            ...(s.treatments || []).map((t: any) => ({
                                                                ...t,
                                                                clientId: t.clientId || clients.find((c) => `${c.firstName} ${c.lastName}`.trim() === t.clientName)?.id,
                                                            })),
                                                            { procedure: "", clientName: "", clientId: "", total: 0, date: new Date().toISOString().slice(0, 10) },
                                                        ])
                                                        setIsStaffTreatmentQuickOpen(true)
                                                    }}
                                                    className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50"
                                                    title="Treatment Tracking"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => openStaffModal(s)} className="h-8 w-8 rounded-lg text-[#8B735B] hover:bg-[#E2D1C3]/20">
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setStaffPreviewTarget(s)
                                                        setIsStaffPreviewOpen(true)
                                                    }}
                                                    className="h-8 w-8 rounded-lg text-[#8B735B] hover:bg-[#E2D1C3]/20"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(s)}
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

            {/* Staff Totals Dialog */}
            <Dialog open={isStaffTotalsOpen} onOpenChange={setIsStaffTotalsOpen}>
                <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto p-4">
                    <DialogHeader>
                        <DialogTitle>All Staff Treatments</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        <div className="sm:col-span-1">
                            <Label htmlFor="totals_staff_filter">Staff</Label>
                            <Select value={staffTotalsFilter} onValueChange={setStaffTotalsFilter}>
                                <SelectTrigger id="totals_staff_filter" className="h-9">
                                    <SelectValue placeholder="All Staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Staff</SelectItem>
                                    {staff.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{`${s.firstName} ${s.lastName}`.trim()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-end">
                            <Button variant="outline" className="h-9" onClick={() => setPrivacyMode((prev) => !prev)}>
                                {privacyMode ? "Privacy On" : "Privacy Off"}
                            </Button>
                        </div>
                    </div>
                    {!totalsData ? (
                        <div className="text-sm text-muted-foreground">No treatments recorded.</div>
                    ) : (
                        <div className="space-y-3">
                            <Table>
                                <TableHeader className="bg-[#FDFCFB]">
                                    <TableRow className="border-b border-[#E2D1C3]/20 hover:bg-transparent">
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] py-5">Date</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Procedure</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Client</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Staff</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {totalsData.rows.map((r, i) => (
                                        <TableRow key={i} className="group border-b border-[#E2D1C3]/10 hover:bg-[#FDFCFB] transition-colors cursor-default">
                                            <TableCell className="py-4 text-[11px] font-bold text-[#1A1A1A]">{r.date}</TableCell>
                                            <TableCell>
                                                <div className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-tight truncate max-w-[16rem]">{r.procedure}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-[11px] font-bold text-[#1A1A1A] truncate max-w-[12rem]">
                                                    {privacyMode ? maskName(r.clientName) : r.clientName}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-[10px] text-[#8B735B] font-bold uppercase tracking-widest truncate max-w-[12rem]">{r.staffName}</div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-[#1A1A1A]">₱{r.total.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex items-center justify-end gap-6 text-sm">
                                <div className="font-medium">Grand Total: {totalsData.grandTotal.toLocaleString()}</div>
                                <div className="font-medium">Payments Grand Total: {totalsData.paymentsGrandTotal.toLocaleString()}</div>
                                <div className="font-medium">Difference: {(totalsData.paymentsGrandTotal - totalsData.grandTotal).toLocaleString()}</div>
                            </div>
                            <div className="pt-2">
                                {[...totalsData.byStaff.entries()].map(([staffId, info]) => (
                                    <div key={staffId} className="mb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-medium">{info.staffName}</div>
                                            <div className="text-xs text-muted-foreground">{info.staffTotal.toLocaleString()}</div>
                                        </div>
                                        <Table>
                                            <TableHeader className="bg-[#FDFCFB]">
                                                <TableRow className="border-b border-[#E2D1C3]/20 hover:bg-transparent">
                                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] py-3">Client</TableHead>
                                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] text-right">Treatment Total</TableHead>
                                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] text-right">Payment Total</TableHead>
                                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] text-right">Difference</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {[...info.clients.entries()].map(([clientName, total]) => (
                                                    <TableRow key={clientName} className="group border-b border-[#E2D1C3]/10 hover:bg-[#FDFCFB] transition-colors cursor-default">
                                                        <TableCell className="py-2.5">
                                                            <div className="text-[10px] font-bold text-[#1A1A1A] truncate max-w-[16rem]">
                                                                {privacyMode ? maskName(clientName) : clientName}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right text-[10px] font-bold text-[#1A1A1A]">₱{total.toLocaleString()}</TableCell>
                                                        <TableCell className="text-right text-[10px] font-bold text-[#8B735B]">
                                                            ₱{(totalsData.paymentsByClient.get(clientName) || 0).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell
                                                            className={`text-right text-[10px] font-bold ${((totalsData.paymentsByClient.get(clientName) || 0) - total || 0) < 0
                                                                    ? "text-rose-600"
                                                                    : "text-emerald-600"
                                                                }`}
                                                        >
                                                            ₱{((totalsData.paymentsByClient.get(clientName) || 0) - total || 0).toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => setIsStaffTotalsOpen(false)}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Staff Preview Dialog */}
            <Dialog open={isStaffPreviewOpen} onOpenChange={setIsStaffPreviewOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto p-4">
                    <DialogHeader>
                        <DialogTitle>Staff Preview</DialogTitle>
                    </DialogHeader>
                    {staffPreviewTarget && (
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <div className="font-semibold text-lg">
                                    {staffPreviewTarget.firstName} {staffPreviewTarget.lastName}
                                </div>
                                <div className="text-sm text-gray-600">{staffPreviewTarget.email}</div>
                                <div className="text-sm text-gray-600">{staffPreviewTarget.phone}</div>
                            </div>
                            <div className="space-y-3">
                                <div className="font-medium">Treatment Tracking</div>
                                <Table>
                                    <TableHeader className="bg-[#FDFCFB]">
                                        <TableRow className="border-b border-[#E2D1C3]/20 hover:bg-transparent">
                                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] py-3">Date</TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Procedure</TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">Client</TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(Array.isArray(staffPreviewTarget.treatments) ? staffPreviewTarget.treatments : []).map((t: any, i: number) => (
                                            <TableRow key={i} className="group border-b border-[#E2D1C3]/10 hover:bg-[#FDFCFB] transition-colors cursor-default">
                                                <TableCell className="py-2.5 text-[10px] font-bold text-[#1A1A1A]">{t.date || "-"}</TableCell>
                                                <TableCell>
                                                    <div className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-tight truncate max-w-[18rem]">{t.procedure}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-[10px] text-[#8B735B] font-bold truncate max-w-[14rem]">
                                                        {privacyMode ? maskName(t.clientName || "") : t.clientName || "-"}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right text-[10px] font-bold text-[#1A1A1A]">₱{Number(t.total || 0).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="space-y-3">
                                <div className="font-medium">Payment Preview</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(() => {
                                        const names = new Set<string>(
                                            (Array.isArray(staffPreviewTarget.treatments) ? staffPreviewTarget.treatments : [])
                                                .map((t: any) => String(t.clientName || "").trim())
                                                .filter(Boolean)
                                        )
                                        const ids = new Set<string>()
                                        for (const n of names) {
                                            const c = clients.find((x) => `${x.firstName} ${x.lastName}`.trim() === n)
                                            if (c) ids.add(c.id)
                                        }
                                        const items = payments.filter((p) => ids.has(String(p.clientId)))
                                        if (items.length === 0) return [<div key="empty" className="rounded-md border bg-white/60 p-3 text-sm text-gray-600">No payments found</div>]
                                        return items.slice(0, 6).map((p) => (
                                            <div key={p.id} className="rounded-md border bg-white/60 p-3 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline">{String(p.status || "").toUpperCase()}</Badge>
                                                    <span className="text-sm font-medium">₱{Number(p.amount || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">{new Date(p.createdAt || p.updatedAt || Date.now()).toLocaleDateString()}</div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[p.receiptUrl, ...(Array.isArray(p.uploadedFiles) ? p.uploadedFiles : [])]
                                                        .filter(Boolean)
                                                        .slice(0, 3)
                                                        .map((url, i) => (
                                                            <a key={`${p.id}-${i}`} href={String(url)} target="_blank" rel="noreferrer" className="block aspect-square rounded-md overflow-hidden">
                                                                <img src={String(url)} alt="receipt" className="w-full h-full object-cover" loading="lazy" />
                                                            </a>
                                                        ))}
                                                </div>
                                            </div>
                                        ))
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => setIsStaffPreviewOpen(false)}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Treatment Quick Add Dialog */}
            <Dialog open={isStaffTreatmentQuickOpen} onOpenChange={setIsStaffTreatmentQuickOpen}>
                <DialogContent className="max-w-md sm:max-w-xl max-h-[70vh] overflow-y-auto p-4 sm:p-4">
                    <DialogHeader>
                        <DialogTitle>
                            {staffTreatmentTarget ? `Add Treatment – ${staffTreatmentTarget.firstName} ${staffTreatmentTarget.lastName}` : "Add Treatment"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        {staffTreatmentForm.map((t, idx) => (
                            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                                <div className="sm:col-span-3 space-y-1.5 relative">
                                    <Label htmlFor={`qt_date_${idx}`}>Date</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id={`qt_date_${idx}`}
                                            type="date"
                                            className="h-9 w-full"
                                            value={t?.date || ""}
                                            onChange={(e) => setStaffTreatmentForm((prev) => prev.map((x, i) => (i === idx ? { ...x, date: e.target.value } : x)))}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-9 px-2"
                                            aria-label="Pick date"
                                            title="Pick date"
                                            onClick={() => setOpenQuickCalendarIdx(openQuickCalendarIdx === idx ? null : idx)}
                                        >
                                            <CalendarDays className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {openQuickCalendarIdx === idx ? (
                                        <div className="absolute left-0 top-[calc(100%+0.5rem)] min-w-[18rem] p-2 border rounded-md bg-white shadow-lg z-50">
                                            <Calendar
                                                selectedDate={t?.date ? new Date(t.date) : undefined}
                                                onDateSelect={(d: Date) => {
                                                    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
                                                    setStaffTreatmentForm((prev) => prev.map((x, i) => (i === idx ? { ...x, date: iso } : x)))
                                                    setOpenQuickCalendarIdx(null)
                                                }}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                                <div className="sm:col-span-4 space-y-1.5">
                                    <Label htmlFor={`qt_procedure_${idx}`}>Procedure</Label>
                                    <Select
                                        value={t?.procedure || ""}
                                        onValueChange={(value) => setStaffTreatmentForm((prev) => prev.map((x, i) => (i === idx ? { ...x, procedure: value } : x)))}
                                    >
                                        <SelectTrigger id={`qt_procedure_${idx}`} className="h-9 w-full min-w-0 truncate">
                                            <SelectValue placeholder="Select procedure" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {procedureOptions.map((name) => (
                                                <SelectItem key={name} value={name}>
                                                    {name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="sm:col-span-3 space-y-1.5">
                                    <Label htmlFor={`qt_client_${idx}`}>Client</Label>
                                    <Select
                                        value={t?.clientId || ""}
                                        onValueChange={(value) => {
                                            const client = clients.find((c) => c.id === value)
                                            setStaffTreatmentForm((prev) =>
                                                prev.map((x, i) =>
                                                    i === idx ? { ...x, clientId: value, clientName: client ? `${client.firstName} ${client.lastName}`.trim() : "" } : x
                                                )
                                            )
                                        }}
                                    >
                                        <SelectTrigger id={`qt_client_${idx}`} className="h-9 w-full min-w-0 truncate">
                                            <SelectValue placeholder="Select client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {`${c.firstName} ${c.lastName}`.trim()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="sm:col-span-2 space-y-1.5">
                                    <Label htmlFor={`qt_total_${idx}`}>Total</Label>
                                    <Input
                                        id={`qt_total_${idx}`}
                                        type="number"
                                        className="h-9 w-full"
                                        value={typeof t?.total === "number" ? t.total : 0}
                                        onChange={(e) =>
                                            setStaffTreatmentForm((prev) => prev.map((x, i) => (i === idx ? { ...x, total: Number(e.target.value || 0) } : x)))
                                        }
                                    />
                                </div>
                                <div className="sm:col-span-12 flex justify-end">
                                    <Button type="button" variant="outline" onClick={() => setStaffTreatmentForm((prev) => prev.filter((_, i) => i !== idx))}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                setStaffTreatmentForm((prev) => [...prev, { date: new Date().toISOString().split("T")[0], procedure: "", clientName: "", clientId: "", total: 0 }])
                            }
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Treatment
                        </Button>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsStaffTreatmentQuickOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleSaveTreatments}>
                            Save
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
