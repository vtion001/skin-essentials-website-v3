"use client"

import { Home, Calendar, MessageCircle, User, Grid3X3, Camera, Info, Phone } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      icon: Home,
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
    {
      href: "/faq",
      icon: User,
      label: "FAQ",
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-6 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs transition-colors",
                isActive ? "text-[#d09d80] bg-[#fbc6c5]/10" : "text-gray-600 hover:text-[#d09d80] hover:bg-[#fbc6c5]/10",
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
