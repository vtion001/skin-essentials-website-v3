"use client"

import { Button } from "@/components/ui/button"
import { Menu, X, Calendar, ArrowLeft, ChevronDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { BookingModal } from "@/components/booking-modal"
import { usePathname } from "next/navigation"

interface SharedHeaderProps {
  showBackButton?: boolean
  backHref?: string
  variant?: "default" | "transparent"
}

export function SharedHeader({ showBackButton = false, backHref = "/", variant = "default" }: SharedHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const serviceCategories = [
    {
      title: "Face Enhancement",
      items: [
        { name: "Hiko Nose Lift", href: "/services#nose-thread-lift" },
        { name: "Face Thread Lift", href: "/services#face-thread-lift" },
        { name: "Botox", href: "/services#botox" },
      ],
    },
    {
      title: "Dermal Fillers",
      items: [
        { name: "Face Fillers", href: "/services#face-fillers" },
        { name: "Lip Fillers", href: "/services#lip-fillers" },
        { name: "Body Fillers", href: "/services#body-fillers" },
      ],
    },
    {
      title: "Laser Treatments",
      items: [
        { name: "Hair Removal", href: "/services#hair-removal" },
        { name: "Pico Laser", href: "/services#pico-laser" },
        { name: "Tattoo Removal", href: "/services#tattoo-removal" },
      ],
    },
    {
      title: "Skin Care",
      items: [
        { name: "Vampire Facial", href: "/services#vampire-facial" },
        { name: "Thermage", href: "/services#thermage" },
        { name: "Stem Cell Boosters", href: "/services#stem-cell" },
      ],
    },
  ]

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/faq", label: "FAQ" },
    { href: "/#contact", label: "Contact" },
  ]

  const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
    variant === "transparent" && !isScrolled
      ? "bg-white/80 backdrop-blur-md"
      : isScrolled
        ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100"
        : "bg-white/90 backdrop-blur-md"
  }`

  return (
    <>
      <header className={headerClasses}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Link href={backHref} className="flex items-center">
                  <ArrowLeft className="w-5 h-5 text-[#d09d80] hover:text-[#fbc6c5] transition-colors" />
                </Link>
              )}
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/skinessentials-logo.png"
                  alt="Skin Essentials by HER"
                  width={120}
                  height={60}
                  className="h-12 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-all duration-300 font-medium relative group ${
                    pathname === item.href || (item.href === "/#contact" && pathname === "/")
                      ? "text-[#d09d80]"
                      : "text-gray-700 hover:text-[#d09d80]"
                  }`}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}

              {/* Services Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setIsServicesOpen(true)}
                onMouseLeave={() => setIsServicesOpen(false)}
              >
                <button className="flex items-center text-gray-700 hover:text-[#d09d80] font-medium transition-colors duration-300">
                  Services
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>

                {isServicesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-[800px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 grid grid-cols-4 gap-6">
                    {serviceCategories.map((category, index) => (
                      <div key={index}>
                        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                          {category.title}
                        </h3>
                        <div className="space-y-3">
                          {category.items.map((item, itemIndex) => (
                            <Link
                              key={itemIndex}
                              href={item.href}
                              className="block text-gray-600 hover:text-[#d09d80] transition-colors duration-200 text-sm"
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={() => setIsBookingOpen(true)}
                className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl px-6"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Now
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 rounded-xl hover:bg-gray-100 transition-all duration-300"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-2xl">
              <nav className="flex flex-col p-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`transition-all duration-300 py-3 font-medium ${
                      pathname === item.href || (item.href === "/#contact" && pathname === "/")
                        ? "text-[#d09d80]"
                        : "text-gray-700 hover:text-[#d09d80]"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/services"
                  className="text-gray-700 hover:text-[#d09d80] py-3 font-medium transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Services
                </Link>
                <Button
                  onClick={() => {
                    setIsBookingOpen(true)
                    setIsMenuOpen(false)
                  }}
                  className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white shadow-lg rounded-xl w-full py-3"
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
