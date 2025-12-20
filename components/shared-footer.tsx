'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Facebook, Instagram, Phone, MapPin, Clock } from 'lucide-react'

export default function SharedFooter() {
  const pathname = usePathname()

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (pathname.startsWith('/admin')) return null

  return (
    <footer className="bg-white text-gray-900 border-t border-gray-100">
      {/* Top Banner: Brand Statement */}
      <div className="py-12 border-b border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="hidden md:block h-[1px] flex-1 bg-gray-100"></div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-gray-400 font-bold">Serving Quezon City & Beyond</p>
            <div className="hidden md:block h-[1px] flex-1 bg-gray-100"></div>
          </div>
          <div className="flex justify-center mb-8">
            <img
              src="https://res.cloudinary.com/dbviya1rj/image/upload/v1753674655/skinessentials_logo_350_x_180_px_fpp26r.png"
              alt="Skin Essentials by HER"
              className="h-12 w-auto object-contain"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-[10px] tracking-[0.25em] uppercase text-gray-500 font-bold">
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-brand-rose" />
              <span>0995-260-3451</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-brand-rose" />
              <span>Project 6, Quezon City</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-brand-rose" />
              <span>Mon-Sun: 10AM-6PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Banner: Social & Newsletter (Gray) */}
      <div className="bg-gray-50/80 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Social */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <h3 className="text-[10px] tracking-[0.25em] uppercase font-bold text-gray-900">Follow #SkinEssentials</h3>
              <div className="flex items-center gap-4">
                <Link href="https://www.facebook.com" aria-label="Facebook" className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-opacity">
                  <Facebook className="w-4 h-4 text-white" />
                </Link>
                <Link href="https://www.instagram.com" aria-label="Instagram" className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-opacity">
                  <Instagram className="w-4 h-4 text-white" />
                </Link>
              </div>
            </div>

            {/* Right: Newsletter */}
            <div className="lg:border-l lg:border-gray-200 lg:pl-16">
              <h3 className="text-[10px] tracking-[0.25em] uppercase font-bold text-gray-900 mb-6 font-serif italic">Newsletter</h3>
              <form className="relative group" action="#" method="post">
                <input
                  type="email"
                  placeholder="PLEASE ENTER YOUR EMAIL ADDRESS"
                  className="w-full bg-transparent border-b border-gray-900 pb-2 text-[10px] tracking-[0.25em] focus:outline-none placeholder:text-gray-400 uppercase font-bold"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-0 bottom-2 text-[10px] font-bold tracking-[0.1em] hover:text-brand-tan transition-colors uppercase"
                >
                  OK
                </button>
              </form>
              <Link href="/terms" className="text-[10px] uppercase tracking-[0.25em] font-bold text-gray-400 hover:text-gray-600 transition-colors mt-2 inline-block underline underline-offset-4 decoration-gray-200">
                Read legal terms
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Links & Scroll to Top */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 mx-auto mb-12 text-[10px] tracking-[0.25em] uppercase font-bold hover:text-brand-tan transition-colors group"
          >
            Back to top
            <span className="transform group-hover:-translate-y-1 transition-transform">^</span>
          </button>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 border-t border-gray-100 pt-8">
            {[
              { label: 'Services', href: '/services' },
              { label: 'Portfolio', href: '/portfolio' },
              { label: 'About Us', href: '/about' },
              { label: 'Contact', href: '/contact' },
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Legal Terms', href: '#' },
              { label: 'Mobile Version', href: '#' }
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[10px] tracking-[0.25em] uppercase font-bold text-gray-400 hover:text-gray-900 transition-colors"
                prefetch={false}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-center text-[10px] text-gray-300 mt-12 tracking-[0.25em] font-bold uppercase">
            &copy; {new Date().getFullYear()} Skin Essentials by HER. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}