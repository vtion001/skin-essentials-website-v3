'use client'

import { useState, useEffect } from 'react'
import { MobileNav } from '@/components/mobile-nav'
import { PullToRefresh } from '@/components/pull-to-refresh'
import { PortfolioGallery } from '@/components/portfolio-gallery'
import { SharedHeader } from '@/components/shared-header'
import { portfolioService, PortfolioItem } from '@/lib/portfolio-data'

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])

  useEffect(() => {
    // Reset to defaults to load updated Cloudinary URLs
    portfolioService.resetToDefaults()
    
    // Load portfolio items
    const items = portfolioService.getAllItems()
    setPortfolioItems(items)

    // Subscribe to updates
    const unsubscribe = portfolioService.subscribe((updatedItems) => {
      setPortfolioItems(updatedItems)
    })

    return unsubscribe
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
        <section className="relative z-10 pt-24 pb-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full text-rose-600 font-medium text-sm mb-6">
              <span className="w-2 h-2 bg-rose-400 rounded-full mr-2 animate-pulse"></span>
              Real Results Gallery
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Before & After
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">
                Transformations
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Discover the remarkable results achieved by our clients through our comprehensive range of aesthetic treatments. 
              Each transformation showcases the expertise and artistry that defines Skin Essentials By Her.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-rose-400 rounded-full mr-2"></div>
                28 Treatment Types
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-pink-400 rounded-full mr-2"></div>
                5 Service Categories
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
                Real Client Results
              </div>
            </div>
          </div>
        </section>
        




        {/* Portfolio Gallery Section */}
        <main className="relative z-10 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <PortfolioGallery />
          </div>
        </main>

        {/* Statistics Section */}
        <section className="relative z-10 py-16 px-4 bg-white/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-rose-500">500+</div>
                <div className="text-gray-600 text-sm md:text-base">Happy Clients</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-pink-500">28</div>
                <div className="text-gray-600 text-sm md:text-base">Treatment Types</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-purple-500">98%</div>
                <div className="text-gray-600 text-sm md:text-base">Satisfaction Rate</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-rose-500">5+</div>
                <div className="text-gray-600 text-sm md:text-base">Years Experience</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-20 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your Look?
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-rose-100 leading-relaxed">
              Book your consultation today and join our gallery of satisfied clients
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button className="bg-white text-rose-500 px-8 py-4 rounded-full font-semibold hover:bg-rose-50 transition-all duration-300 hover:scale-105 shadow-lg">
                Book Consultation
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-rose-500 transition-all duration-300 hover:scale-105">
                View Services
              </button>
            </div>
          </div>
        </section>

        <MobileNav />
      </div>
    </PullToRefresh>
  )
}
