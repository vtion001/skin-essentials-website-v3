"use client"

import { Button } from "@/components/ui/button"
import { Menu, X, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useCallback } from "react"
import { BookingModal } from "@/components/booking-modal"
import { usePathname } from "next/navigation"
import { useOptimizedScroll } from "@/lib/use-performance"
import { ThemeToggle } from "@/components/theme-toggle"

interface SharedHeaderProps {
  showBackButton?: boolean
  backHref?: string
  variant?: "default" | "transparent"
  hideNav?: boolean
}

export function SharedHeader({ showBackButton = false, backHref = "/", variant = "default", hideNav = false }: SharedHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const pathname = usePathname()

  const handleScroll = useCallback((scrollY: number) => {
    setIsScrolled(scrollY > 10)
  }, [])

  useOptimizedScroll(handleScroll)



  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy" },
  ]

  const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
    variant === "transparent" && !isScrolled
      ? "bg-white/80 backdrop-blur-md"
      : isScrolled
        ? "bg-white/95 backdrop-blur-xl shadow-xl border-b border-white/30"
        : "bg-white/90 backdrop-blur-md"
  }`

  return (
    <>
      <header className={headerClasses}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-6 -left-10 w-24 h-24 bg-brand-rose/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-6 -right-10 w-28 h-28 bg-brand-tan/10 rounded-full blur-2xl"></div>
        </div>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Link href={backHref} prefetch={false} className="flex items-center">
                  <ArrowLeft className="w-5 h-5 text-brand-tan hover:text-brand-rose transition-colors" />
                </Link>
              )}
              <Link href="/" prefetch={false} className="flex items-center">
                <div className="relative group">
                  <div className="absolute inset-0 rounded-2xl bg-brand-gradient opacity-15 blur-xl"></div>
                  <div className="relative rounded-2xl bg-white/70 backdrop-blur-sm shadow-md border border-white/30 px-3 py-2 group-hover:shadow-lg transition-all duration-300">
                    <Image
                      src="/images/skinessentials-logo.png"
                      alt="Skin Essentials by HER - Premier Aesthetic Clinic in Quezon City specializing in Hiko Nose Thread Lifts"
                      width={120}
                      height={60}
                      className="h-16 w-auto object-contain"
                      priority
                    />
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {!hideNav && (
            <nav className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={`transition-all duration-300 font-medium relative group px-3 py-2 rounded-xl ${
                    pathname === item.href
                      ? "text-brand-tan bg-white/60 backdrop-blur-sm shadow-sm"
                      : "text-gray-700 hover:text-brand-tan hover:bg-white/60 hover:backdrop-blur-sm"
                  }`}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gradient group-hover:w-full transition-all duration-300"></span>
                  <span className={`absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-gradient transition-opacity duration-300 ${
                    pathname === item.href ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}></span>
                </Link>
              ))}



              <ThemeToggle />

              <Button
                onClick={() => setIsBookingOpen(true)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-brand-gradient text-white shadow-lg hover:shadow-xl hover-lift hover:brightness-110 h-10 px-6 rounded-xl"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Now
              </Button>
            </nav>
            )}

            {/* Mobile Menu Button */}
            {!hideNav && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 rounded-xl hover:bg-gray-100 transition-all duration-300"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            )}
          </div>

          {/* Mobile Menu */}
          {!hideNav && isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-2xl">
              <nav className="flex flex-col p-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    className={`transition-all duration-300 py-3 font-medium ${
                      pathname === item.href
                        ? "text-brand-tan"
                        : "text-gray-700 hover:text-brand-tan"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Button
                  onClick={() => {
                    setIsBookingOpen(true)
                    setIsMenuOpen(false)
                  }}
                  className="bg-brand-gradient hover:bg-brand-gradient-reverse text-white shadow-lg rounded-xl w-full py-3"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Consultation
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Booking Modal */}
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </>
  )
}
