"use client"

import { Search, Eye, EyeOff, UserPlus, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface StaffFiltersProps {
    search: string
    setSearch: (v: string) => void
    positionFilter: string
    setPositionFilter: (v: string) => void
    statusFilter: string
    setStatusFilter: (v: string) => void
    privacyMode: boolean
    setPrivacyMode: (v: boolean | ((prev: boolean) => boolean)) => void
    onAddStaff: () => void
    onViewTotals: () => void
}

const POSITION_OPTIONS = [
    { value: "all", label: "All Positions" },
    { value: "anesthesiologist", label: "Anesthesiologist" },
    { value: "surgeon_aesthetic", label: "Surgeon (Aesthetic)" },
    { value: "dermatologist", label: "Dermatologist" },
    { value: "nurse", label: "Nurse" },
    { value: "therapist", label: "Therapist" },
    { value: "technician", label: "Technician" },
    { value: "receptionist", label: "Receptionist" },
    { value: "admin", label: "Admin" },
    { value: "other", label: "Other" },
]

const STATUS_OPTIONS = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "on_leave", label: "On Leave" },
    { value: "inactive", label: "Inactive" },
    { value: "terminated", label: "Terminated" },
]

export function StaffFilters({
    search,
    setSearch,
    positionFilter,
    setPositionFilter,
    statusFilter,
    setStatusFilter,
    privacyMode,
    setPrivacyMode,
    onAddStaff,
    onViewTotals,
}: StaffFiltersProps) {
    return (
        <>
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
                        onClick={onAddStaff}
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
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#8B735B]">
                        Position
                    </Label>
                    <Select value={positionFilter} onValueChange={setPositionFilter}>
                        <SelectTrigger className="h-11 bg-white border-[#E2D1C3]/30 rounded-xl shadow-sm">
                            <SelectValue placeholder="Position" />
                        </SelectTrigger>
                        <SelectContent>
                            {POSITION_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#8B735B]">
                        Status
                    </Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-11 bg-white border-[#E2D1C3]/30 rounded-xl shadow-sm">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end">
                    <Button
                        className="h-11 w-full sm:w-auto bg-white border-[#E2D1C3]/30 text-[#8B735B] hover:bg-[#FDFCFB] rounded-xl shadow-sm transition-all"
                        variant="outline"
                        onClick={onViewTotals}
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Totals
                    </Button>
                </div>
            </div>
        </>
    )
}
