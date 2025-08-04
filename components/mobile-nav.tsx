"use client"

import { Home, Calendar, MessageCircle, User, Grid3X3, Camera } from "lucide-react"
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
      href: "tel:09952603451",
      icon: Calendar,
      label: "Book",
      isExternal: true,
    },
    {
      href: "https://wa.me/639952603451",
      icon: MessageCircle,
      label: "Chat",
      isExternal: true,
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

          if (item.isExternal) {
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 text-xs transition-colors",
                  item.label === "Book" ? "text-green-600 hover:text-green-700" : "text-blue-600 hover:text-blue-700",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs transition-colors",
                isActive ? "text-rose-600 bg-rose-50" : "text-gray-600 hover:text-rose-600 hover:bg-rose-50",
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
