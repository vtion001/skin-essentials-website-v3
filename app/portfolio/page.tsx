'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { MobileNav } from '@/components/mobile-nav'
import { PullToRefresh } from '@/components/pull-to-refresh'
import { PortfolioGallery } from '@/components/portfolio-gallery'
import { SharedHeader } from '@/components/shared-header'
import type { PortfolioItem } from '@/lib/portfolio-data'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PortfolioPage() {
  const [ageConfirmed, setAgeConfirmed] = useState<boolean>(() => {
    try { return localStorage.getItem('age_gate_18_portfolio') === 'true' } catch { return false }
  })
  const [ageGateOpen, setAgeGateOpen] = useState<boolean>(() => {
    try { return localStorage.getItem('age_gate_18_portfolio') !== 'true' } catch { return true }
  })
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])

  useEffect(() => {
    ; (async () => {
      try {
        const res = await fetch('/api/portfolio', { cache: 'no-store' })
        const j = await res.json()
        if (j?.ok && Array.isArray(j.data)) setPortfolioItems(j.data)
      } catch { }
    })()
  }, [])

  return (
    <PullToRefresh>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-rose-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-rose-100/10 to-pink-100/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <SharedHeader />

        {/* Hero Section */}
        <section className="pt-40 pb-32 px-4 relative z-10 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-24 text-center md:text-left">
              <h1 className="text-5xl md:text-[80px] lg:text-[100px] font-bold tracking-tight text-gray-900 leading-none uppercase">
                Real Results<br />Gallery<span className="text-brand-tan">.</span>
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
              <div className="md:col-span-3 space-y-2">
                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-900">Before & After.</p>
                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Authentic Cases.</p>
                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Proven Results.</p>
              </div>

              <div className="md:col-span-9 space-y-12">
                <div className="space-y-8">
                  <p className="text-[15px] md:text-lg leading-[1.8] text-gray-500 font-light max-w-4xl">
                    <span className="text-gray-900 font-medium italic block mb-2 text-xl">Beyond Beautiful</span>
                    Discover the remarkable results achieved by our clients through our comprehensive range of medical-grade aesthetic treatments.
                    Each transformation showcases the expertise and artistry that defines <span className="text-brand-tan font-semibold uppercase tracking-widest text-sm">Skin Essentials By Her</span>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-gray-100">
                  {[
                    { title: "28 Treatment Types", description: "Comprehensive range of aesthetic solutions" },
                    { title: "5 Service Categories", description: "Specialized care in every discipline" },
                    { title: "Real Client Results", description: "Authentic transformations from true stories" },
                  ].map((item, index) => (
                    <div key={index} className="space-y-4">
                      <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-900">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-gray-500 font-light">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-8 pt-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-tan"></div>
                    <span className="text-[10px] tracking-[0.2em] font-bold text-gray-900 uppercase">QUEZON CITY&rsquo;S PREMIER CLINIC</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-tan"></div>
                    <span className="text-[10px] tracking-[0.2em] font-bold text-gray-900 uppercase">REAL TRANSFORMATIONS</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-tan"></div>
                    <span className="text-[10px] tracking-[0.2em] font-bold text-gray-900 uppercase">ARTISTRY & PRECISION</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>





        {/* Portfolio Gallery Section */}
        <main className="relative z-10 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            {ageConfirmed ? (
              <PortfolioGallery />
            ) : (
              <div className="rounded-3xl border border-rose-200 bg-white/80 backdrop-blur-sm p-8 text-center shadow-sm">
                <Shield className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sensitive Content</h3>
                <p className="text-gray-600">This gallery contains medical before-and-after images. Please confirm your age to proceed.</p>
              </div>
            )}
          </div>
        </main>

        {/* Statistics Section */}
        <section className="relative z-10 py-16 px-4 bg-white/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-brand-tan font-serif italic">500+</div>
                <div className="text-gray-600 text-sm md:text-base font-medium">Happy Clients</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-brand-tan font-serif italic">28</div>
                <div className="text-gray-600 text-sm md:text-base font-medium">Treatment Types</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-brand-tan font-serif italic">98%</div>
                <div className="text-gray-600 text-sm md:text-base font-medium">Satisfaction Rate</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-brand-tan font-serif italic">15+</div>
                <div className="text-gray-600 text-sm md:text-base font-medium">Years Experience</div>
              </div>
            </div>
          </div>
        </section>

        {/* Editorial CTA Section */}
        <section className="py-32 px-4 relative z-10 bg-white border-t border-gray-100">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
              <div className="md:col-span-4 space-y-2">
                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-900">Next Steps.</p>
                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Join our Gallery.</p>
                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Real Transformations.</p>
              </div>

              <div className="md:col-span-8 space-y-12">
                <div className="space-y-8">
                  <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-none uppercase">
                    Ready to Transform<br />Your Look<span className="text-brand-tan">?</span>
                  </h2>
                  <p className="text-[15px] md:text-lg leading-[1.8] text-gray-500 font-light max-w-2xl">
                    <span className="text-gray-900 font-medium italic block mb-2 text-xl italic-serif">Proven Results.</span>
                    Book your consultation today and join our gallery of satisfied clients who have achieved their aesthetic goals with our specialized treatments.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  <button
                    className="text-[11px] font-bold tracking-[0.2em] text-white bg-gray-900 uppercase px-12 py-4 rounded-full hover:bg-gray-800 transition-all transform hover:scale-[1.02]"
                  >
                    Book Consultation
                  </button>
                  <Link href="/services">
                    <button
                      className="text-[11px] font-bold tracking-[0.2em] text-gray-900 border border-gray-200 uppercase px-12 py-4 rounded-full hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                      View Services
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <MobileNav />
      </div>

      {/* Age Gate Modal */}
      <Dialog open={ageGateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you 18 years or older?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              The portfolio may include sensitive medical imagery intended for adults. Please confirm your age to continue.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setAgeGateOpen(false)
                  setAgeConfirmed(false)
                }}
              >
                No
              </Button>
              <Button
                className="bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                onClick={() => {
                  try {
                    localStorage.setItem('age_gate_18_portfolio', 'true')
                  } catch { }
                  setAgeConfirmed(true)
                  setAgeGateOpen(false)
                }}
              >
                Yes, I am 18+
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PullToRefresh>
  )
}
