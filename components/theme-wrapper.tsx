"use client"

import { usePathname } from "next/navigation"
import type React from "react"

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdmin = pathname?.startsWith("/admin")

    return (
        <div className={isAdmin ? "" : "luxury-theme"}>
            {children}
        </div>
    )
}
