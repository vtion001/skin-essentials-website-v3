'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Facebook, Instagram, Phone, MapPin, Clock } from 'lucide-react'

export default function SharedFooter() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <Image src="/images/skinessentials-logo.png" alt="Skin Essentials by HER" width={140} height={70} className="h-10 w-auto object-contain brightness-0 invert" />
            </div>
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              Non-surgical enhancements and medical-grade skin solutions delivered by licensed professionals using FDA-approved materials.
            </p>
            <div className="flex items-center gap-3">
              <Link href="https://www.facebook.com" aria-label="Visit our Facebook" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="https://www.instagram.com" aria-label="Visit our Instagram" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-3">
            <h3 className="font-bold mb-6 text-lg">Explore</h3>
            <div className="space-y-3 text-gray-300">
              <Link href="/services#thread-lifts" className="block hover:text-white transition-colors">Thread Lifts</Link>
              <Link href="/services#dermal-fillers" className="block hover:text-white transition-colors">Dermal Fillers</Link>
              <Link href="/services#laser-treatments" className="block hover:text-white transition-colors">Laser Treatments</Link>
              <Link href="/services#skin-treatments" className="block hover:text-white transition-colors">Skin Rejuvenation</Link>
              <Link href="/portfolio" className="block hover:text-white transition-colors">Portfolio</Link>
            </div>
          </div>
          <div className="lg:col-span-4">
            <h3 className="font-bold mb-6 text-lg">Stay Updated</h3>
            <form className="space-y-3" action="#" method="post" aria-describedby="newsletter-desc">
              <p id="newsletter-desc" className="text-gray-300">Subscribe to clinic updates and promotions.</p>
              <Label htmlFor="newsletter-email" className="sr-only">Email address</Label>
              <div className="flex gap-3">
                <Input id="newsletter-email" type="email" inputMode="email" placeholder="you@example.com" aria-label="Email address" className="bg-white/10 border-white/20 text-white placeholder:text-gray-300" />
                <Button type="submit" className="bg-brand-gradient hover:bg-brand-gradient-reverse text-white">Subscribe</Button>
              </div>
            </form>
            <div className="mt-6 space-y-3 text-gray-300">
              <p className="flex items-center"><Phone className="w-4 h-4 mr-2 text-brand-rose" />0995-260-3451</p>
              <p className="flex items-start"><MapPin className="w-4 h-4 mr-2 text-brand-rose mt-1" />Granda Building, Road 8<br />Project 6, Quezon City</p>
              <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-brand-rose" />Mon-Sun: 10AM-6PM</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">&copy; {new Date().getFullYear()} Skin Essentials by HER. All rights reserved.</p>
          <div className="flex flex-wrap gap-6 text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}