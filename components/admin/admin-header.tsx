"use client"

import { Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminHeaderProps {
    privacyMode: boolean
    setPrivacyMode: (value: boolean | ((prev: boolean) => boolean)) => void
    isLoading: boolean
    onRefresh: () => void
    onLogout: () => void
}

export function AdminHeader({
    privacyMode,
    setPrivacyMode,
    isLoading,
    onRefresh,
    onLogout,
}: AdminHeaderProps) {
    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-100 px-8 py-5 flex items-center justify-between">
            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-stone-800 uppercase">
                        Admin <span className="text-[#d09d80]">Dashboard.</span>
                    </h1>
                    <div className="h-4 w-[1px] bg-stone-200" />
                    <p className="text-[11px] text-[#d09d80] font-bold tracking-[0.2em] uppercase">
                        Portal
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 mr-4 text-[10px] font-bold text-stone-500 uppercase tracking-widest bg-white border border-stone-100 px-3 py-1.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span>
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                        })}
                    </span>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPrivacyMode((prev) => !prev)}
                    className={`text-[10px] font-bold tracking-[0.2em] uppercase border border-stone-200 px-4 h-9 rounded-full transition-all ${privacyMode
                            ? "bg-stone-900 text-white"
                            : "hover:bg-stone-50 text-stone-600"
                        }`}
                >
                    {privacyMode ? "Privacy: On" : "Privacy: Off"}
                </Button>

                <div className="w-[1px] h-6 bg-stone-200 mx-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-600 hover:bg-stone-50 h-9 px-4 rounded-full border border-stone-200"
                >
                    <RefreshCw
                        className={`w-3.5 h-3.5 mr-2 ${isLoading ? "animate-spin" : ""}`}
                    />
                    Refresh
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="text-[10px] font-bold tracking-[0.2em] uppercase text-rose-600 hover:bg-rose-50 h-9 px-4 rounded-full border border-rose-100"
                >
                    Logout
                </Button>
            </div>
        </header>
    )
}
