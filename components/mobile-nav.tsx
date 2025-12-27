"use client"

import { House, Calendar, MessageCircle, User, Grid3X3, Camera, Info, Phone } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export function MobileNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || pathname?.startsWith('/admin')) return null

  const navItems = [
    {
      href: "/",
      icon: House,
      label: "Home",
    },
    {
      href: "/about",
      icon: Info,
      label: "About",
    },
    {
      href: "/services",
      icon: Grid3X3,
      label: "Services",
    },
    {
      href: "/portfolio",
      icon: Camera,
      label: "Portfolio",
    },
    {
      href: "/contact",
      icon: Phone,
      label: "Contact",
    },
  ]

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-[100] bg-white/98 backdrop-blur-xl border-t border-gray-200/60 lg:hidden safe-area-bottom"
      style={{
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)',
        width: '100vw',
        maxWidth: '100vw',
        left: 0,
        right: 0,
      }}
    >
      <div className="grid grid-cols-5 h-16 w-full max-w-full overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className="flex flex-col items-center justify-center gap-0.5 transition-colors duration-200 relative group min-w-0"
            >
              <div className={cn(
                "p-2 rounded-full transition-all duration-200 flex-shrink-0",
                isActive
                  ? "bg-brand-gradient shadow-md"
                  : "bg-transparent group-hover:bg-gray-100/80"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-colors duration-200",
                  isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                )} />
              </div>
              <span className={cn(
                "text-[9px] uppercase tracking-wide transition-all duration-200 text-center font-medium mt-0.5 truncate max-w-full px-1",
                isActive
                  ? "text-brand-rose font-semibold"
                  : "text-gray-400 group-hover:text-gray-600"
              )}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-rose rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
