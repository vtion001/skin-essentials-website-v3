'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  Facebook,
  Instagram,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SharedHeaderProps {
  showBackButton?: boolean
  backHref?: string
}

export const SharedHeader = ({ showBackButton, backHref }: SharedHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (pathname.startsWith('/admin')) return null

  const navLinks = [
    { name: 'HOME', href: '/' },
    { name: 'ABOUT', href: '/about' },
    { name: 'SERVICES', href: '/services', hasDropdown: true },
    { name: 'PORTFOLIO', href: '/portfolio' },
    { name: 'FAQ', href: '/faq' },
    { name: 'CONTACT', href: '/contact' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Utility Bar (Black) */}
      <div className="bg-black text-white py-2.5 px-4 font-inter">
        <div className="container mx-auto flex justify-center items-center text-[9px] tracking-[0.3em] font-medium uppercase text-center">
          <div className="flex items-center gap-2">
            <span className="opacity-80">✦ FREE CONSULTATION FOR FIRST-TIME CLIENTS</span>
            <Link href="/contact" className="underline underline-offset-4 hover:text-brand-tan transition-colors decoration-white/20 hover:decoration-brand-tan">LEARN MORE</Link>
          </div>
        </div>
      </div>

      {/* Main Header (White) */}
      <div className={cn(
        "bg-white transition-all duration-300 border-b border-gray-100",
        isScrolled ? "py-2 shadow-md" : "py-3 xl:py-6"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 transition-transform hover:scale-[1.02]">
              <img
                src="https://res.cloudinary.com/dbviya1rj/image/upload/v1753674655/skinessentials_logo_350_x_180_px_fpp26r.png"
                alt="Skin Essentials by HER"
                className="h-9 md:h-11 w-auto object-contain"
              />
            </Link>

            {/* Navigation (Desktop) */}
            <nav className="hidden xl:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-[10px] tracking-[0.25em] font-bold transition-all hover:text-brand-tan relative group",
                    pathname === link.href ? "text-brand-tan" : "text-gray-900"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {link.name}
                    {link.hasDropdown && <ChevronDown className="w-2.5 h-2.5 opacity-40 group-hover:rotate-180 transition-transform" />}
                  </span>
                  <span className={cn(
                    "absolute -bottom-1.5 left-0 h-[1.5px] bg-brand-tan transition-all duration-300",
                    pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                  )}></span>
                </Link>
              ))}
            </nav>

            {/* Icons & CTA */}
            <div className="flex items-center gap-8">
              <div className="hidden lg:flex items-center gap-5 text-gray-900">
                <Link href="https://facebook.com" className="hover:text-brand-tan transition-all hover:scale-110"><Facebook className="w-[1.1rem] h-[1.1rem] stroke-[1.5]" /></Link>
                <Link href="https://instagram.com" className="hover:text-brand-tan transition-all hover:scale-110"><Instagram className="w-[1.1rem] h-[1.1rem] stroke-[1.5]" /></Link>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/contact" className="hidden md:block">
                  <Button className="bg-brand-gradient hover:shadow-xl hover-lift text-white text-[10px] tracking-[0.1em] font-bold px-6 py-2 rounded-full">
                    BOOK NOW
                  </Button>
                </Link>

                {/* Mobile Menu Toggle - Hidden in favor of MobileNav */}
                <button
                  className="hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "lg:hidden fixed inset-0 bg-white z-40 transition-transform duration-500 pt-32 px-6",
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <nav className="flex flex-col gap-8 text-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-2xl font-serif italic text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-[1px] bg-gray-100 my-4"></div>
          <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
            <Button className="bg-brand-gradient w-full py-6 text-lg font-bold">
              BOOK AN APPOINTMENT
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
