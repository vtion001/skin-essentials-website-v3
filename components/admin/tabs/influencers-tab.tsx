"use client"

import { useMemo } from "react"
import { Search, Plus, Edit, Trash2, UserPlus, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
import { influencerService, type Influencer } from "@/lib/admin-services"

interface InfluencersTabProps {
    influencers: Influencer[]
    setInfluencers: (v: Influencer[]) => void
    openInfluencerModal: (inf?: Influencer) => void
    setSelectedInfluencer: (inf: Influencer) => void
    setIsReferralModalOpen: (v: boolean) => void
    setIsReferralDetailsOpen: (v: boolean) => void
    confirmTwice: (subject: string) => boolean
    showNotification: (type: "success" | "error", message: string) => void

    // Filter states
    search: string
    setSearch: (v: string) => void
    platformFilter: string
    setPlatformFilter: (v: string) => void
    statusFilter: string
    setStatusFilter: (v: string) => void

    // Modal states for animation reduction
    isAppointmentModalOpen: boolean
    isPaymentModalOpen: boolean
    isMedicalRecordModalOpen: boolean
    isClientModalOpen: boolean
    isSocialReplyModalOpen: boolean
    isStaffModalOpen: boolean
    isInfluencerModalOpen: boolean
    isReferralModalOpen: boolean
    isStaffTreatmentQuickOpen: boolean
}

export function InfluencersTab({
    influencers,
    setInfluencers,
    openInfluencerModal,
    setSelectedInfluencer,
    setIsReferralModalOpen,
    setIsReferralDetailsOpen,
    confirmTwice,
    showNotification,
    search,
    setSearch,
    platformFilter,
    setPlatformFilter,
    statusFilter,
    setStatusFilter,
    isAppointmentModalOpen,
    isPaymentModalOpen,
    isMedicalRecordModalOpen,
    isClientModalOpen,
    isSocialReplyModalOpen,
    isStaffModalOpen,
    isInfluencerModalOpen,
    isReferralModalOpen,
    isStaffTreatmentQuickOpen,
}: InfluencersTabProps) {
    const reduceMotion =
        isAppointmentModalOpen ||
        isPaymentModalOpen ||
        isMedicalRecordModalOpen ||
        isClientModalOpen ||
        isSocialReplyModalOpen ||
        isStaffModalOpen ||
        isInfluencerModalOpen ||
        isReferralModalOpen ||
        isStaffTreatmentQuickOpen

    const filteredInfluencers = useMemo(() => {
        const q = search.toLowerCase()
        return influencers
            .filter((i) => (statusFilter === "all" ? true : i.status === statusFilter))
            .filter((i) => (platformFilter === "all" ? true : i.platform === platformFilter))
            .filter(
                (i) =>
                    q === "" ||
                    i.name.toLowerCase().includes(q) ||
                    (i.handle ?? "").toLowerCase().includes(q)
            )
    }, [influencers, search, statusFilter, platformFilter])

    const handleDelete = async (inf: Influencer) => {
        if (!confirmTwice(inf.name || "this influencer")) return
        const res = await fetch("/api/admin/influencers", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: inf.id }),
        })
        if (res.ok) {
            await influencerService.fetchFromSupabase?.()
            setInfluencers(influencerService.getAllInfluencers())
            showNotification("success", "Influencer deleted")
        } else {
            showNotification("error", "Failed to delete influencer")
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Influencers Referral Management</h2>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search influencers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 w-64"
                        />
                    </div>
                    <Button
                        onClick={() => openInfluencerModal()}
                        className={`bg-[#0F2922] hover:bg-[#0F2922]/90 text-white font-bold px-6 py-3 rounded-2xl ${reduceMotion
                                ? ""
                                : "shadow-2xl shadow-[#0F2922]/30 hover:shadow-[#0F2922]/40 transition-all duration-300 hover:scale-105"
                            }`}
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Influencer
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsReferralDetailsOpen(true)}
                    className="h-9 w-full"
                >
                    <Eye className="w-4 h-4 mr-2" />
                    View All Referrals
                </Button>
            </div>

            <Card className="bg-white/60 backdrop-blur-sm border border-white/70 shadow-2xl">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-[#FDFCFB]">
                            <TableRow className="border-b border-[#E2D1C3]/20 hover:bg-transparent">
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] py-5">
                                    Influencer
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    Platform
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    Status
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    Referrals
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    Revenue
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    Due
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    Paid
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B]">
                                    Balance
                                </TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#8B735B] text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInfluencers.map((inf) => {
                                const stats = influencerService.getStats(inf.id)
                                return (
                                    <TableRow
                                        key={inf.id}
                                        className="group border-b border-[#E2D1C3]/10 hover:bg-[#FDFCFB] transition-colors cursor-default"
                                    >
                                        <TableCell className="py-4">
                                            <div className="font-bold text-[#1A1A1A] tracking-tight">{inf.name}</div>
                                            {inf.handle && (
                                                <div className="text-[10px] text-[#8B735B] font-medium tracking-tight uppercase mt-0.5">
                                                    {inf.handle}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-tight">
                                                {inf.platform}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`text-[10px] font-bold uppercase tracking-widest py-0.5 px-3 rounded-full border shadow-none ${inf.status === "active"
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                        : "bg-rose-50 text-rose-600 border-rose-100"
                                                    }`}
                                            >
                                                {inf.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-[11px] font-bold text-[#1A1A1A]">
                                            {stats.totalReferrals}
                                        </TableCell>
                                        <TableCell className="text-[11px] font-bold text-[#1A1A1A]">
                                            ₱{stats.totalRevenue.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-[11px] font-bold text-[#8B735B]">
                                            ₱{stats.commissionDue.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-[11px] font-bold text-emerald-600">
                                            ₱{stats.commissionPaid.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-[11px] font-bold text-rose-600">
                                            ₱{stats.commissionRemaining.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 justify-end">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50"
                                                    onClick={() => {
                                                        setSelectedInfluencer(inf)
                                                        setIsReferralModalOpen(true)
                                                    }}
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-lg text-[#8B735B] hover:bg-[#E2D1C3]/20"
                                                    onClick={() => openInfluencerModal(inf)}
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                                                    onClick={() => handleDelete(inf)}
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
        </div>
    )
}
