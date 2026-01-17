"use client"

import { motion } from "framer-motion"
import {
    LayoutDashboard,
    CalendarDays,
    CreditCard,
    FileText,
    Users,
    Settings,
    MessageSquare,
    FileImage,
    Mail,
    TrendingUp,
    BarChart3,
    Shield,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdminProfileButton } from "@/components/admin/admin-profile-button"

interface AdminSidebarProps {
    activeTab: string
    setActiveTab: (tab: string) => void
    supabaseAvailable: () => boolean
    socialMessagesUnread: number
    medicalRecordsCount: number
    onProfileSettingsOpen: () => void
    onLogout: () => void
    FacebookStatusIndicator?: React.FC
}

const menuItems = [
    { key: "dashboard", label: "Overview", icon: LayoutDashboard },
    { key: "appointments", label: "Bookings", icon: CalendarDays },
    { key: "payments", label: "Financials", icon: CreditCard },
    { key: "medical", label: "Medical Records", icon: FileText },
    { key: "clients", label: "Client Base", icon: Users },
    { key: "staff", label: "Team", icon: Settings },
    { key: "social", label: "Communications", icon: MessageSquare },
    { key: "content", label: "Media & Assets", icon: FileImage },
]

const generalItems = [
    { key: "email", label: "Automations", icon: Mail },
    { key: "sms", label: "SMS Gateway", icon: MessageSquare },
    { key: "influencers", label: "Partnerships", icon: TrendingUp },
    { key: "analytics", label: "Performance", icon: BarChart3 },
    { key: "audit-logs", label: "Audit Trails", icon: Shield },
]

export function AdminSidebar({
    activeTab,
    setActiveTab,
    supabaseAvailable,
    socialMessagesUnread,
    medicalRecordsCount,
    onProfileSettingsOpen,
    onLogout,
    FacebookStatusIndicator,
}: AdminSidebarProps) {
    return (
        <aside className="hidden lg:flex w-[280px] flex-col bg-white border-r border-stone-100 fixed h-screen z-50">
            {/* Sidebar Header: Brand Logo & Title */}
            <div className="p-8 pb-6">
                <div className="flex items-center justify-center mb-6">
                    <img
                        src="https://res.cloudinary.com/dbviya1rj/image/upload/v1753674655/skinessentials_logo_350_x_180_px_fpp26r.png"
                        alt="Skin Essentials Logo"
                        className="w-full h-auto object-contain max-w-[200px]"
                    />
                </div>

                {/* System Status Indicators in Sidebar */}
                <div className="mt-6 space-y-2">
                    {supabaseAvailable() ? (
                        <div className="flex items-center gap-2 text-[9px] font-bold tracking-widest text-[#0F2922] bg-[#0F2922]/10 px-3 py-1.5 rounded-full border border-[#0F2922]/20 uppercase">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0F2922] animate-pulse" />
                            System Online
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-[9px] font-bold tracking-widest text-rose-600 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20 uppercase">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            System Offline
                        </div>
                    )}
                    {FacebookStatusIndicator && (
                        <div className="scale-90 origin-left">
                            <FacebookStatusIndicator />
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-none">
                <div className="mb-10">
                    <p className="text-[10px] font-bold tracking-[0.25em] text-stone-400 uppercase mb-6 px-4">
                        Menu
                    </p>
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setActiveTab(item.key)}
                                className={`relative w-full flex items-center gap-4 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 group ${activeTab === item.key
                                    ? "text-[#d09d80] bg-[#fbc6c5]/10"
                                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                                    }`}
                            >
                                {activeTab === item.key && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="absolute left-0 w-1.5 h-6 bg-[#d09d80] rounded-r-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon
                                    className={`w-5 h-5 transition-colors ${activeTab === item.key
                                        ? "text-[#d09d80]"
                                        : "text-stone-400 group-hover:text-stone-900"
                                        }`}
                                />
                                {item.label}
                                {item.key === "social" && socialMessagesUnread > 0 && (
                                    <span className="ml-auto bg-[#0F2922] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                                        {socialMessagesUnread}
                                    </span>
                                )}
                                {item.key === "medical" && medicalRecordsCount > 0 && (
                                    <span className="ml-auto bg-[#0F2922]/10 text-[#0F2922] text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center border border-[#0F2922]/20">
                                        {medicalRecordsCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-[10px] font-bold tracking-[0.25em] text-stone-400 uppercase mb-6 px-4">
                        General
                    </p>
                    <div className="space-y-1">
                        {generalItems.map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setActiveTab(item.key)}
                                className={`relative w-full flex items-center gap-4 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 group ${activeTab === item.key
                                    ? "text-[#d09d80] bg-[#fbc6c5]/10"
                                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                                    }`}
                            >
                                {activeTab === item.key && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="absolute left-0 w-1.5 h-6 bg-[#d09d80] rounded-r-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon
                                    className={`w-5 h-5 transition-colors ${activeTab === item.key
                                        ? "text-[#d09d80]"
                                        : "text-stone-400 group-hover:text-stone-900"
                                        }`}
                                />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar Footer: Profile Section */}
            <div className="p-6 border-t border-stone-100">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div>
                            <AdminProfileButton />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-56 rounded-xl border border-stone-100 shadow-xl bg-white/95 backdrop-blur-md"
                    >
                        <DropdownMenuLabel className="text-stone-800">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-stone-100" />
                        <DropdownMenuItem
                            className="focus:bg-stone-50 focus:text-stone-900 cursor-pointer rounded-lg"
                            onClick={onProfileSettingsOpen}
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Profile Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="focus:bg-red-50 focus:text-red-900 text-red-700 cursor-pointer rounded-lg"
                            onClick={onLogout}
                        >
                            <div className="flex items-center w-full">
                                <span className="flex-1">Log out</span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    )
}
