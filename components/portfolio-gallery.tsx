"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookingModal } from "@/components/booking-modal"
import { Clock, Star, RefreshCw, Filter, Grid, List, Eye, EyeOff, Calendar, Search, ChevronDown, CheckCircle } from "lucide-react"
import { OptimizedImage } from "@/components/optimized-image"
import type { PortfolioItem } from "@/lib/portfolio-data"
import { serviceCategories } from "@/lib/services-data"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function PortfolioGallery() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedDuration, setSelectedDuration] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [revealedMap, setRevealedMap] = useState<Record<string, boolean>>({})
  const [showSimilar, setShowSimilar] = useState<boolean>(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string>("")
  const [query, setQuery] = useState("")
  const searchParams = useSearchParams()
  const similarSectionRef = useRef<HTMLDivElement | null>(null)

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
    if (e) {
      e.stopPropagation()
    }
    const serviceId = toId(treatmentName)
    setSelectedServiceId(serviceId)
    setIsBookingOpen(true)
    setSelectedItem(null) // Automatically close the detail modal
  }

  const toggleReveal = (id: string) => {
    setRevealedMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => {
    ; (async () => {
      try {
        const res = await fetch('/api/portfolio', { cache: 'no-store' })
        const j = await res.json()
        if (j?.ok && Array.isArray(j.data)) setPortfolioItems(j.data)
      } catch { }
    })()
  }, [])

  useEffect(() => {
    const svc = searchParams?.get('service') || searchParams?.get('treatment') || ''
    const similar = (searchParams?.get('similar') || '').toLowerCase() === 'true'
    if (!svc || !similar || portfolioItems.length === 0) return
    const match = portfolioItems.find((i) => toId(i.treatment) === svc || toId(i.title) === svc)
    if (match) {
      setSelectedItem(match)
      setShowSimilar(true)
    }
  }, [portfolioItems, searchParams])

  useEffect(() => {
    const id = searchParams?.get('id') || ''
    if (!id || portfolioItems.length === 0) return
    const match = portfolioItems.find((i) => i.id === id)
    if (match) setSelectedItem(match)
  }, [portfolioItems, searchParams])

  useEffect(() => {
    if (showSimilar) {
      setTimeout(() => { similarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 0)
    }
  }, [showSimilar])

  const categories = ["all", ...Array.from(new Set(portfolioItems.map((item) => item.category)))]

  const filteredItems = portfolioItems.filter((item) => {
    const categoryMatch = selectedCategory === "all" || item.category === selectedCategory

    // Duration Logic
    let durationMatch = true
    if (selectedDuration !== "all") {
      const mins = parseInt(item.duration) || 0
      if (selectedDuration === "Under 1 hour") durationMatch = mins < 60
      else if (selectedDuration === "Over 1 hour") durationMatch = mins >= 60
    }

    const q = query.toLowerCase().trim()
    const searchMatch = !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.treatment.toLowerCase().includes(q)
    return categoryMatch && durationMatch && searchMatch
  })

  const breastItems = filteredItems.filter((i) => i.treatment === "Non-Surgical Breast Lift")
  const primaryBreastItemId = breastItems.length > 0 ? breastItems[0].id : undefined
  const displayItems = filteredItems.filter(
    (i) => i.treatment !== "Non-Surgical Breast Lift" || i.id === primaryBreastItemId
  )

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/portfolio', { cache: 'no-store' })
      const j = await res.json()
      if (j?.ok && Array.isArray(j.data)) setPortfolioItems(j.data)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#d09d80] mx-auto mb-4" />
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-12">
        {/* Search & Categories Section (Source Design Applied) */}
        <div className="bg-[#f8f9fc] border-y border-gray-200 -mx-4 px-4 py-12 mb-12">
          <div className="max-w-7xl mx-auto">
            {/* Category Header */}
            <div className="mb-6">
              <h2 className="text-[#1a3a6d] font-bold text-sm tracking-wider uppercase mb-6">Category</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {categories.map((catName) => {
                  const metadata = serviceCategories.find(c => c.category === catName)
                  const img = catName === 'all'
                    ? "https://res.cloudinary.com/dbviya1rj/image/upload/v1766245996/futnzy0heyku2jrffxy4.jpg"
                    : (metadata?.image || `/placeholder.svg?height=100&width=180&text=${encodeURIComponent(catName)}`)
                  const isActive = selectedCategory === catName

                  return (
                    <motion.button
                      key={catName}
                      onClick={() => setSelectedCategory(catName)}
                      className="flex-shrink-0 w-48 group relative"
                      whileHover={{ y: -4 }}
                    >
                      <div className={cn(
                        "bg-white rounded-lg overflow-hidden shadow-sm border transition-all duration-300",
                        isActive ? "border-[#d09d80] ring-1 ring-[#d09d80]" : "border-gray-100"
                      )}>
                        {/* Category Image */}
                        <div className="relative aspect-[16/9] w-full bg-gray-100">
                          <img
                            src={img}
                            alt={catName}
                            className="w-full h-full object-cover"
                          />
                          {/* Green Checkmark for Active State */}
                          {isActive && (
                            <div className="absolute top-2 right-2 bg-[#76bc5c] text-white p-0.5 rounded shadow-sm">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        {/* Category Name */}
                        <div className="py-3 px-2 text-center">
                          <span className={cn(
                            "text-xs font-bold tracking-tight block truncate",
                            isActive ? "text-[#1a3a6d]" : "text-gray-500"
                          )}>
                            {catName === "all" ? "All Treatments" : catName}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Filter & Search Header */}
            <div className="mt-10">
              <h2 className="text-[#1a3a6d] font-bold text-sm tracking-wider uppercase mb-6">Filter By & Search</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {/* Select Category */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Select Category</label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-md px-4 py-2.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#d09d80] pr-10"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Select Duration */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Select Duration</label>
                  <div className="relative">
                    <select
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-md px-4 py-2.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#d09d80] pr-10"
                    >
                      <option value="all">All Durations</option>
                      <option value="Under 1 hour">Under 1 hour</option>
                      <option value="Over 1 hour">Over 1 hour</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Results View Toggle */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">View Mode</label>
                  <div className="flex border border-gray-200 rounded-md p-0.5 bg-white h-[38px] items-center">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "flex-1 flex items-center justify-center py-1.5 rounded-sm transition-all",
                        viewMode === "grid" ? "bg-gray-100 text-[#1a3a6d]" : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      <Grid className="w-4 h-4 mr-2" />
                      <span className="text-[10px] font-bold uppercase">Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "flex-1 flex items-center justify-center py-1.5 rounded-sm transition-all",
                        viewMode === "list" ? "bg-gray-100 text-[#1a3a6d]" : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      <List className="w-4 h-4 mr-2" />
                      <span className="text-[10px] font-bold uppercase">List</span>
                    </button>
                  </div>
                </div>

                {/* Utility Button */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Actions</label>
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="w-full bg-white border border-gray-200 rounded-md px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                    REFRESH
                  </button>
                </div>

                {/* Search */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Search Cases</label>
                  <div className="relative">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search transformations..."
                      className="w-full bg-white border border-gray-200 rounded-md px-4 py-2.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#d09d80] pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
          <p className="text-gray-700 font-medium">
            Showing <span className="font-bold text-rose-600">{displayItems.length}</span>
            {displayItems.length === 1 ? ' result' : ' results'}
            {selectedCategory !== "all" && (
              <span>
                {" "}in <span className="font-semibold text-pink-600">{selectedCategory}</span>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Gallery */}
      {displayItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto border border-gray-200 shadow-sm">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 mb-3">No results found</h3>
            <p className="text-gray-500 leading-relaxed">Try selecting a different category or refresh the page to see all available treatments.</p>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
              : "space-y-6"
          }
        >
          {displayItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group flex flex-col items-center text-center w-full h-full cursor-pointer transition-all duration-500",
                viewMode === "list" ? "md:flex-row md:text-left md:items-start" : ""
              )}
              onClick={() => setSelectedItem(item)}
            >
              {/* Image Container with specific rounding */}
              <div className={cn(
                "w-full aspect-[4/3] bg-gray-100 mb-6 overflow-hidden rounded-[2rem] rounded-bl-[3rem] shadow-sm relative",
                viewMode === "list" ? "md:mb-0 md:mr-8 md:max-w-[400px]" : ""
              )}>
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
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
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
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                        After
                      </Badge>
                    </div>
                  </div>
                </div>


                {/* Sensitive Reveal Overlay */}
                {isSensitive(item) && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/90 text-gray-900 backdrop-blur-sm hover:bg-white rounded-full px-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleReveal(item.id)
                      }}
                    >
                      {revealedMap[item.id] ? (
                        <span className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"><EyeOff className="w-3.5 h-3.5" /> Hide</span>
                      ) : (
                        <span className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"><Eye className="w-3.5 h-3.5" /> View</span>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Content Container */}
              <div className={cn(
                "flex flex-col flex-grow w-full px-2",
                viewMode === "list" ? "md:justify-center" : ""
              )}>
                <div className="mb-2">
                  <span className="text-[10px] tracking-[0.2em] font-bold text-[#d09d80] uppercase block mb-2">{item.category}</span>
                  <h3 className="font-serif text-lg tracking-widest text-gray-900 uppercase mb-3 line-clamp-1 group-hover:text-[#d09d80] transition-colors">
                    {item.title}
                  </h3>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed mb-6 line-clamp-3 min-h-[4.5em]">
                  {item.description}
                </p>

                {/* Editorial Footer Meta */}
                <div className={cn(
                  "mt-auto pt-4 border-t border-gray-100 w-full flex items-center gap-4 text-[10px] tracking-wider text-gray-400 uppercase font-medium",
                  viewMode === "list" ? "justify-start" : "justify-center"
                )}>
                  <span>Duration: {item.duration}</span>
                  <span className="w-px h-3 bg-gray-300"></span>
                  <span className="text-[#d09d80] font-bold">Results: {item.results}</span>
                </div>

                <button
                  className="mt-6 w-full text-[11px] font-bold tracking-[0.2em] text-gray-900 uppercase py-3 border border-gray-900 rounded-full hover:bg-gray-900 hover:text-white transition-all transform hover:scale-[1.02]"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBookingClick(item.treatment)
                  }}
                >
                  Book Consultation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={(v) => { if (!v) setSelectedItem(null) }}>
        <DialogContent className="!w-[95vw] sm:!max-w-5xl !max-h-[85vh] sm:!max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl !p-0" onInteractOutside={(e) => e.preventDefault()}>
          {selectedItem && (
            <div className="flex flex-col">
              {/* Header Image Header / Title */}
              <div className="p-8 pb-0">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-gray-100 pb-8">
                  <div className="space-y-4">
                    <span className="text-[10px] tracking-[0.3em] font-bold text-[#d09d80] uppercase block">
                      {selectedItem.category}
                    </span>
                    <h2 className="font-serif text-3xl lg:text-5xl tracking-[0.05em] text-gray-900 uppercase leading-none">
                      {selectedItem.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      className="text-[11px] font-bold tracking-[0.2em] text-white bg-gray-900 uppercase px-8 py-3 rounded-full hover:bg-gray-800 transition-all transform hover:scale-[1.02]"
                      onClick={() => handleBookingClick(selectedItem.treatment)}
                    >
                      Book Consultation
                    </button>
                    <button
                      className="text-[11px] font-bold tracking-[0.2em] text-gray-900 border border-gray-200 uppercase px-8 py-3 rounded-full hover:bg-gray-50 transition-all"
                      onClick={() => setShowSimilar((v) => !v)}
                    >
                      {showSimilar ? "Close Gallery" : "More Cases"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-8 pb-12 space-y-12">
                {/* Before/After Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="relative aspect-[3/4] rounded-[2rem] rounded-bl-[3rem] overflow-hidden shadow-sm shadow-gray-200">
                      <OptimizedImage
                        src={selectedItem.beforeImage || "/placeholder.svg"}
                        alt={`Before ${selectedItem.title}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full">
                          Before
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative aspect-[3/4] rounded-[2rem] rounded-tr-[3rem] overflow-hidden shadow-sm shadow-gray-200">
                      <OptimizedImage
                        src={selectedItem.afterImage || "/placeholder.svg"}
                        alt={`After ${selectedItem.title}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full">
                          After
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Treatment Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-gray-100">
                  <div className="lg:col-span-4 space-y-6">
                    <div className="space-y-2">
                      <p className="text-[11px] tracking-[0.2em] font-bold text-gray-900 uppercase">Treatment Details.</p>
                      <p className="text-[14px] leading-relaxed text-gray-500 font-light italic-serif transition-colors">
                        Authentic transformation achieved with {selectedItem.treatment}.
                      </p>
                    </div>

                    <div className="space-y-4 pt-6">
                      <div className="flex items-center justify-between text-[11px] tracking-widest uppercase font-bold text-gray-900">
                        <span>Duration</span>
                        <span className="text-gray-400 font-medium">{selectedItem.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] tracking-widest uppercase font-bold text-gray-900">
                        <span>Expected Results</span>
                        <span className="text-gray-400 font-medium">{selectedItem.results}</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-8">
                    <p className="text-base md:text-lg leading-[1.8] text-gray-500 font-light">
                      {selectedItem.description}
                    </p>
                  </div>
                </div>

                {/* Similar Results Gallery */}
                {showSimilar && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8 pt-12 border-t border-gray-100"
                    ref={similarSectionRef}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-2xl tracking-widest text-gray-900 uppercase">More {selectedItem.treatment} Cases</h4>
                    </div>

                    {portfolioItems.filter(i => i.treatment === selectedItem.treatment && i.id !== selectedItem.id).length === 0 ? (
                      <div className="text-center py-10 rounded-[2rem] border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm italic">Additional cases are being processed and will be added soon.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {portfolioItems
                          .filter(i => i.treatment === selectedItem.treatment && i.id !== selectedItem.id)
                          .map((i) => (
                            <div
                              key={i.id}
                              className="group flex flex-col cursor-pointer"
                              onClick={() => setSelectedItem(i)}
                            >
                              <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                                <div className="grid grid-cols-2 h-full">
                                  <div className="relative h-full">
                                    <OptimizedImage
                                      src={i.beforeImage || "/placeholder.svg"}
                                      alt="Before"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="relative h-full">
                                    <OptimizedImage
                                      src={i.afterImage || "/placeholder.svg"}
                                      alt="After"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                </div>
                              </div>
                              <h5 className="text-[10px] tracking-widest font-bold uppercase text-gray-900 truncate">
                                {i.title}
                              </h5>
                            </div>
                          ))}
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="pt-12 border-t border-gray-100">
                  <p className="text-center text-gray-400 text-[10px] tracking-[0.2em] font-medium uppercase leading-relaxed max-w-2xl mx-auto">
                    Individual results may vary. Consult with our specialists for a personalized assessment and treatment plan based on your unique skin profile.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        defaultServiceId={selectedServiceId}
      />
    </div>
  )
}
// Force recompile: v1.1
