"use client"

import React from "react"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminProfileButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    name?: string
    email?: string
    initial?: string
    onClick?: () => void
}

export function AdminProfileButton({
    name = "Administrator",
    email = "admin@skin-essentials.com",
    initial = "A",
    onClick,
    className,
    ...props
}: AdminProfileButtonProps) {
    return (
        <div
            className={cn(
                "flex items-center gap-4 p-4 bg-[#0F2922]/5 rounded-2xl hover:bg-[#0F2922]/10 transition-colors cursor-pointer group",
                className
            )}
            onClick={onClick}
            {...props}
        >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0F2922] to-[#0F2922]/40 flex items-center justify-center font-bold text-white text-sm overflow-hidden border-2 border-transparent group-hover:border-[#0F2922] transition-all">
                {initial}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#0F2922] truncate uppercase tracking-tight">
                    {name}
                </p>
                <p className="text-[10px] text-[#0F2922]/60 truncate mt-0.5">
                    {email}
                </p>
            </div>
            <MoreHorizontal className="w-4 h-4 text-[#0F2922]/40 group-hover:text-[#0F2922]" />
        </div>
    )
}
