"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Phone, RefreshCw } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { PortfolioGallery } from "@/components/portfolio-gallery"
import { SharedHeader } from "@/components/shared-header"

export default function PortfolioPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Ensure portfolio data is fresh when page loads (client-side only)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    // Only run after component is mounted to avoid hydration mismatch
    if (mounted && typeof window !== "undefined") {
      const { PortfolioService } = require("@/lib/portfolio-data")
      PortfolioService.forceRefresh()
    }
  }, [mounted])

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Force refresh portfolio data
    if (mounted && typeof window !== "undefined") {
      window.location.reload()
    }
  }

  return (
    <PullToRefresh>
      <div className="min-h-screen bg-[#fffaff] pb-20 md:pb-0 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#fbc6c5]/20 to-[#d09d80]/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#d09d80]/30 to-[#fbc6c5]/30 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-[#fbc6c5]/10 to-[#d09d80]/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        {/* Shared Header */}
        <SharedHeader showBackButton={true} backHref="/" />
        
        {/* Refresh Button */}
        <div className="fixed top-24 right-4 z-50 md:hidden">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="bg-white/80 backdrop-blur-sm border-[#fbc6c5]/30 text-gray-700 hover:bg-[#fbc6c5]/10"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Main Content */}
        <main className="pt-24 pb-12 px-4 relative z-10">
          <div className="container mx-auto">
            <PortfolioGallery />
          </div>
        </main>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white relative">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready for Your Transformation?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of satisfied clients who have achieved their beauty goals with our expert treatments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-[#d09d80] hover:bg-white/90 px-8 py-3 text-lg font-semibold">
                <Phone className="w-5 h-5 mr-2" />
                Book Free Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#d09d80] bg-transparent px-8 py-3 text-lg font-semibold"
              >
                Call 0995-260-3451
              </Button>
            </div>
          </div>
        </section>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </PullToRefresh>
  )
}
