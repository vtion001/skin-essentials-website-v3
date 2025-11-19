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
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-gray-200/50 md:hidden safe-area-bottom">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs transition-all duration-300 hover-lift",
                isActive 
                  ? "text-brand-rose bg-brand-rose/10" 
                  : "text-gray-600 hover:text-brand-rose hover:bg-brand-rose/10",
                "relative"
              )}
            >
              <div className={cn(
                "p-2 rounded-full transition-all duration-300",
                isActive && "bg-brand-gradient shadow-lg"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isActive ? "text-white" : ""
                )} />
              </div>
              <span className={cn(
                "transition-all duration-300",
                isActive ? "font-semibold text-brand-rose" : ""
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
