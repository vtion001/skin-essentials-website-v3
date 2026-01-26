"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookingModal } from "@/components/booking-modal"
import { Clock, Star, RefreshCw, Filter, Eye, EyeOff, Calendar } from "lucide-react"
import { OptimizedImage } from "@/components/optimized-image"
import type { PortfolioItem } from "@/lib/portfolio-data"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PortfolioGalleryProps {
  items: PortfolioItem[]
  isLoading?: boolean
}

export function PortfolioGallery({ items, isLoading = false }: PortfolioGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [revealedMap, setRevealedMap] = useState<Record<string, boolean>>({})
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string>("")
  const searchParams = useSearchParams()

  const isSensitive = (item: PortfolioItem) => {
    const title = item.title.toLowerCase()
    return (
      title.includes("feminine") ||
      title.includes("intimate") ||
      title.includes("butt") ||
      title.includes("breast")
    )
  }

  const toId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

  const handleBookingClick = (treatmentName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const serviceId = toId(treatmentName)
    setSelectedServiceId(serviceId)
    setIsBookingOpen(true)
    setSelectedItem(null) 
  }

  const toggleReveal = (id: string) => {
    setRevealedMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#d09d80] mx-auto mb-4" />
          <p className="text-gray-600">Loading transformations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Optimized Grid: More columns on large screens, more compact gap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 pb-8">
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="group flex flex-col items-center text-center w-full h-full cursor-pointer transition-all duration-500"
            whileHover={{ y: -5 }}
            onClick={() => setSelectedItem(item)}
          >
            {/* Optimized Card: Aspect 16/9 and tighter rounding */}
            <div className="w-full aspect-video bg-gray-100 mb-4 overflow-hidden rounded-[1.5rem] rounded-bl-[2.5rem] shadow-sm relative border border-gray-100">
              <div className="grid grid-cols-2 h-full">
                <div className="relative">
                  <OptimizedImage
                    src={item.beforeImage || "/placeholder.svg"}
                    alt={`Before ${item.title}`}
                    fill
                    className={cn(
                      "object-cover transition-transform duration-700 group-hover:scale-110",
                      isSensitive(item) && !revealedMap[item.id] ? "filter blur-xl" : ""
                    )}
                  />
                  <div className="absolute top-2 left-2 scale-90">
                    <Badge className="bg-red-500/90 text-white text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-full">
                      Before
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <OptimizedImage
                    src={item.afterImage || "/placeholder.svg"}
                    alt={`After ${item.title}`}
                    fill
                    className={cn(
                      "object-cover transition-transform duration-700 group-hover:scale-110",
                      isSensitive(item) && !revealedMap[item.id] ? "filter blur-xl" : ""
                    )}
                  />
                  <div className="absolute top-2 right-2 scale-90">
                    <Badge className="bg-green-500/90 text-white text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-full">
                      After
                    </Badge>
                  </div>
                </div>
              </div>

              {isSensitive(item) && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 backdrop-blur-[1px]">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 bg-white/90 text-gray-900 text-[9px] rounded-full px-4 shadow-xl"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleReveal(item.id)
                    }}
                  >
                    {revealedMap[item.id] ? "Hide" : "View"}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col flex-grow w-full px-2">
              <div className="mb-1">
                <span className="text-[8px] tracking-[0.2em] font-bold text-[#d09d80] uppercase block mb-1">{item.category}</span>
                <h3 className="font-serif text-sm tracking-widest text-gray-900 uppercase mb-2 line-clamp-1 group-hover:text-[#d09d80] transition-colors">
                  {item.title}
                </h3>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed mb-4 line-clamp-2 min-h-[2.5em]">
                {item.description}
              </p>
              <div className="mt-auto pt-2 border-t border-gray-100 w-full flex items-center justify-center gap-3 text-[8px] tracking-wider text-gray-400 uppercase font-medium">
                <span>{item.duration}</span>
                <span className="text-[#d09d80] font-bold">Results: {item.results}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(v) => { if (!v) setSelectedItem(null) }}>
        <DialogContent 
          data-lenis-prevent
          className="w-full max-w-[calc(100vw-1rem)] sm:max-w-5xl max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl p-0 z-[250]" 
          onInteractOutside={(e) => e.preventDefault()}
        >
          {selectedItem && (
            <div className="flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] tracking-[0.3em] font-bold text-[#d09d80] uppercase block">
                      {selectedItem.category}
                    </span>
                    <DialogTitle className="font-serif text-2xl sm:text-3xl tracking-[0.05em] text-gray-900 uppercase leading-tight">
                      {selectedItem.title}
                    </DialogTitle>
                  </div>
                  <button
                    className="w-full sm:w-auto text-[11px] font-bold tracking-[0.2em] text-white bg-gray-900 uppercase px-10 py-4 rounded-full hover:bg-gray-800 transition-all shadow-xl"
                    onClick={() => handleBookingClick(selectedItem.treatment)}
                  >
                    Book Consultation
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative aspect-[3/4] rounded-[2rem] rounded-bl-[3rem] overflow-hidden shadow-lg border border-gray-100">
                    <OptimizedImage src={selectedItem.beforeImage} alt="Before" fill className="object-cover" />
                    <Badge className="absolute top-4 left-4 bg-red-500/90 text-white text-[10px] font-bold tracking-widest uppercase">Before</Badge>
                  </div>
                  <div className="relative aspect-[3/4] rounded-[2rem] rounded-tr-[3rem] overflow-hidden shadow-lg border border-gray-100">
                    <OptimizedImage src={selectedItem.afterImage} alt="After" fill className="object-cover" />
                    <Badge className="absolute top-4 right-4 bg-green-500/90 text-white text-[10px] font-bold tracking-widest uppercase">After</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-10 border-t border-gray-100">
                  <div className="lg:col-span-4 space-y-6">
                    <p className="text-[11px] tracking-[0.2em] font-bold text-gray-900 uppercase">Insights.</p>
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Duration</span>
                        <span className="text-[10px] uppercase font-bold text-gray-900">{selectedItem.duration}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Results</span>
                        <span className="text-[10px] uppercase font-bold text-gray-900">{selectedItem.results}</span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-8">
                    <p className="text-base text-gray-500 font-light leading-relaxed">
                      {selectedItem.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} defaultServiceId={selectedServiceId} />
    </div>
  )
}