"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Clock, Star, Phone, Award, Shield, Users, CheckCircle, ArrowRight, Calendar, Search, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { SharedHeader } from "@/components/shared-header"
import { cn } from "@/lib/utils"
import { BookingModal } from "@/components/booking-modal"
import { serviceCategories as localServiceCategories, type Service, type ServiceCategory } from "@/lib/services-data"


function BookingQueryEffect({ setSelectedServiceId, setIsBookingOpen }: { setSelectedServiceId: (v: string) => void, setIsBookingOpen: (v: boolean) => void }) {
  const searchParams = useSearchParams()
  useEffect(() => {
    const open = searchParams?.get('book') === 'true'
    const svc = searchParams?.get('service') || ''
    if (open) {
      setSelectedServiceId(svc)
      setIsBookingOpen(true)
    }
  }, [searchParams, setSelectedServiceId, setIsBookingOpen])
  return null
}

function ServicesContent() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string>("")
  const [activeCategoryId, setActiveCategoryId] = useState<string>("")
  const [query, setQuery] = useState<string>("")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [preview, setPreview] = useState<{ service: Service; category: ServiceCategory } | null>(null)
  const reduceMotion = useReducedMotion()
  const [categories, setCategories] = useState<ServiceCategory[]>(localServiceCategories)
  const searchParams = useSearchParams()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/services')
        const j = await res.json()
        if (j?.ok && Array.isArray(j?.data)) {
          setCategories(j.data)
          if (!activeCategoryId && j.data.length) setActiveCategoryId(j.data[0].id)
        }
      } catch { }
    }
    load()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])



  const toId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")


  useEffect(() => {
    const list = categories.length ? categories : localServiceCategories
    if (list.length && !activeCategoryId) setTimeout(() => setActiveCategoryId(list[0].id), 0)
    const observers: IntersectionObserver[] = []
    list.forEach((cat) => {
      const el = document.getElementById(cat.id)
      if (!el) return
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveCategoryId(cat.id)
          })
        },
        { rootMargin: "-40% 0px -50% 0px", threshold: 0.1 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [categories])

  useEffect(() => {
    const slug = searchParams?.get('preview') || ''
    if (!slug) return
    const list = categories.length ? categories : localServiceCategories
    for (const category of list) {
      const svc = category.services.find((s) => toId(s.name) === slug)
      if (svc) {
        setTimeout(() => { setPreview({ service: svc, category }); setIsPreviewOpen(true) }, 0)
        break
      }
    }
  }, [categories, searchParams])

  const matchesQuery = (s: Service) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      (s.benefits || []).some((b) => b.toLowerCase().includes(q))
    )
  }

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <PullToRefresh>
      <div className="min-h-screen bg-white pb-24 lg:pb-0">
        {/* Header */}
        <SharedHeader showBackButton={true} backHref="/" />

        {/* Hero Section */}
        <section className="pt-40 pb-32 px-4 relative z-10 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-24 text-center md:text-left">
              <h1 className="text-[clamp(3rem,8vw+1rem,6.25rem)] font-bold tracking-tight text-gray-900 leading-none uppercase">
                Aesthetic<br />Services<span className="text-brand-tan">.</span>
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
              <div className="md:col-span-3 space-y-2">
                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-900">Complete Range.</p>
                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Expert Care.</p>
                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Premium Clinic.</p>
              </div>

              <div className="md:col-span-9 space-y-12">
                <div className="space-y-8">
                  <p className="text-[15px] md:text-lg leading-[1.8] text-gray-500 font-light max-w-4xl">
                    <span className="text-gray-900 font-medium italic block mb-2 text-xl">Beyond Beautiful</span>
                    Discover Quezon City&rsquo;s most comprehensive collection of medical-grade aesthetic treatments, including our signature
                    <span className="text-gray-900 font-medium italic"> Hiko Nose Thread Lifts</span>, designed to enhance your
                    natural beauty with <span className="text-brand-tan font-semibold uppercase tracking-widest text-sm">FDA-approved materials</span> and expert care.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-gray-100">
                  {[
                    {
                      title: "FDA-Approved Materials",
                      description: "Only premium, medical-grade products",
                    },
                    {
                      title: "Licensed Professionals",
                      description: "Expert medical team you can trust",
                    },
                    {
                      title: "3,000+ Happy Clients",
                      description: "Proven track record of excellence",
                    },
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
                    <span className="text-[10px] tracking-[0.2em] font-bold text-gray-900 uppercase">FDA-APPROVED</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-tan"></div>
                    <span className="text-[10px] tracking-[0.2em] font-bold text-gray-900 uppercase">LICENSED PROFESSIONALS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category & Filter Section */}
        <section className="py-12 bg-[#f8f9fc] border-b border-gray-200 overflow-hidden">
          <div className="container mx-auto px-4 max-w-full">
            {/* Category Header */}
            <div className="mb-6">
              <h2 className="text-[#1a3a6d] font-bold text-sm tracking-wider uppercase mb-6">Category</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategoryId(cat.id)
                      const el = document.getElementById(cat.id)
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
                    }}
                    className="flex-shrink-0 w-48 group relative"
                    whileHover={{ y: -4 }}
                  >
                    <div className={cn(
                      "bg-white rounded-lg overflow-hidden shadow-sm border transition-all duration-300",
                      activeCategoryId === cat.id ? "border-[#d09d80] ring-1 ring-[#d09d80]" : "border-gray-100"
                    )}>
                      {/* Category Image */}
                      <div className="relative aspect-[16/9] w-full bg-gray-100">
                        <img
                          src={cat.image || `https://res.cloudinary.com/dbviya1rj/image/upload/v1766221339/zbuimximnplv1zcnm7id.jpg`}
                          alt={cat.category}
                          className="w-full h-full object-cover"
                        />
                        {/* Green Checkmark for Active State */}
                        {activeCategoryId === cat.id && (
                          <div className="absolute top-2 right-2 bg-[#76bc5c] text-white p-0.5 rounded shadow-sm">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      {/* Category Name */}
                      <div className="py-3 px-2 text-center">
                        <span className={cn(
                          "text-xs font-bold tracking-tight block truncate",
                          activeCategoryId === cat.id ? "text-[#1a3a6d]" : "text-gray-500"
                        )}>
                          {cat.category}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Filter & Search Header */}
            <div className="mt-10">
              <h2 className="text-[#1a3a6d] font-bold text-sm tracking-wider uppercase mb-6">Filter By & Search</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {/* Company Name / Primary Category Select */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Select Category</label>
                  <div className="relative">
                    <select
                      value={activeCategoryId}
                      onChange={(e) => {
                        const id = e.target.value
                        setActiveCategoryId(id)
                        const el = document.getElementById(id)
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
                      }}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-md px-4 py-2.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#d09d80] pr-10"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.category}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Duration Filter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Select Duration</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-white border border-gray-200 rounded-md px-4 py-2.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#d09d80] pr-10">
                      <option>All Durations</option>
                      <option>Under 30 mins</option>
                      <option>30-60 mins</option>
                      <option>Over 1 hour</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Select Price Range</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-white border border-gray-200 rounded-md px-4 py-2.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#d09d80] pr-10">
                      <option>All Prices</option>
                      <option>Below ₱5,000</option>
                      <option>₱5,000 - ₱10,000</option>
                      <option>Above ₱10,000</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Select Status</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-white border border-gray-200 rounded-md px-4 py-2.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#d09d80] pr-10">
                      <option>All Status</option>
                      <option>Available</option>
                      <option>Promo</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Search */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Search</label>
                  <div className="relative">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Type to search..."
                      className="w-full bg-white border border-gray-200 rounded-md px-4 py-2.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#d09d80] pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services by Category */}
        {categories.map((category, categoryIndex) => (
          <section
            key={category.id}
            id={category.id}
            className={`py-20 ${categoryIndex % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
          >
            <div className="container mx-auto px-4">
              {/* Category Header */}
              <div className="text-center mb-12">
                <h2 className="text-[clamp(2.25rem,5vw+1rem,3.75rem)] font-bold text-gray-900 mb-6 font-serif italic text-gradient-lux">{category.category}</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 opacity-80">{category.description}</p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="brand-outline"
                    className="rounded-xl active:scale-[0.98] transition-transform"
                    onClick={() => toggleCategory(category.id)}
                    aria-expanded={!!expandedCategories[category.id]}
                  >
                    {expandedCategories[category.id] ? (
                      <>
                        Show Less
                        <ChevronUp className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        View All Services
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8" role="list">
                {category.services
                  .filter(matchesQuery)
                  .slice(0, expandedCategories[category.id] ? category.services.length : 6)
                  .map((service, serviceIndex) => (
                    <motion.button
                      key={serviceIndex}
                      className="group flex flex-col items-center text-center w-full h-full focus:outline-none"
                      onClick={() => { setPreview({ service, category }); setIsPreviewOpen(true) }}
                      whileHover={reduceMotion ? undefined : { y: -5 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                      role="listitem"
                      aria-label={`${service.name}, ${service.price}`}
                    >
                      {/* Card Image */}
                      <div className="w-full aspect-[4/3] bg-gray-100 mb-6 overflow-hidden rounded-[2rem] rounded-bl-[3rem] shadow-sm relative">
                        <img
                          src={service.image || `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(service.name)}`}
                          alt={service.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                      </div>

                      {/* Content */}
                      <div className="flex flex-col flex-grow w-full px-2">
                        <h3 className="font-serif text-lg tracking-widest text-gray-900 uppercase mb-3 line-clamp-1 group-hover:text-[#d09d80] transition-colors">{service.name}</h3>

                        <p className="text-sm text-gray-500 leading-relaxed mb-6 line-clamp-3 min-h-[4.5em]">
                          {service.description}
                        </p>

                        <div className="mt-auto pt-4 border-t border-gray-100 w-full flex items-center justify-center gap-4 text-[10px] sm:text-xs tracking-wider text-gray-400 uppercase font-medium">
                          {service.duration && (
                            <>
                              <span>Duration: {service.duration.replace(/minutes|mins/i, 'MINS').replace(/hour/i, 'HR')}</span>
                              {service.price && <span className="w-px h-3 bg-gray-300" />}
                            </>
                          )}
                          <span className="text-[#d09d80] font-semibold">Price: {service.price}</span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
              </div>
              {category.services.filter(matchesQuery).length === 0 && (
                <div className="text-center text-gray-600">No services match your search.</div>
              )}
            </div>
          </section>
        ))}

        {/* Editorial CTA Section */}
        <section className="py-32 px-4 relative z-10 bg-white border-t border-gray-100">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
              <div className="md:col-span-4 space-y-2">
                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-900">Next Steps.</p>
                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Complimentary Consultation.</p>
                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Professional Assessment.</p>
              </div>

              <div className="md:col-span-8 space-y-12">
                <div className="space-y-8">
                  <h2 className="text-[clamp(2.25rem,5vw+1rem,3.75rem)] font-bold tracking-tight text-gray-900 leading-none uppercase">
                    Ready to Transform<br />Your Look<span className="text-brand-tan">?</span>
                  </h2>
                  <p className="text-[15px] md:text-lg leading-[1.8] text-gray-500 font-light max-w-2xl">
                    <span className="text-gray-900 font-medium italic block mb-2 text-xl italic-serif">Tailored Precision.</span>
                    Schedule your complimentary consultation today and let our experts create a personalized treatment plan for your aesthetic goals.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  <button
                    className="text-[11px] font-bold tracking-[0.2em] text-white bg-gray-900 uppercase px-12 py-4 rounded-full hover:bg-gray-800 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
                  >
                    <Phone className="w-4 h-4" />
                    Call 0995-260-3451
                  </button>
                  <Link href="/portfolio">
                    <button
                      className="text-[11px] font-bold tracking-[0.2em] text-gray-900 border border-gray-200 uppercase px-12 py-4 rounded-full hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                    >
                      View Our Portfolio
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
      <Dialog open={isPreviewOpen} onOpenChange={(v) => { if (!v) { setIsPreviewOpen(false); setPreview(null) } }}>
        <DialogContent className="!w-[92vw] sm:!max-w-2xl !rounded-2xl !max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">{preview?.service.name}</DialogTitle>
          </DialogHeader>
          <AnimatePresence>
            {preview && (
              <motion.div
                className="space-y-4"
                initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {preview.service.duration && (<span className="mr-3 flex items-center"><Clock className="w-4 h-4 mr-1 text-[#d09d80]" />{preview.service.duration}</span>)}{preview.service.results && (<span className="flex items-center"><Star className="w-4 h-4 mr-1 text-[#d09d80]" />{preview.service.results}</span>)}
                  </div>
                  <div className="text-xl font-bold bg-gradient-to-r from-[#d09d80] to-[#fbc6c5] bg-clip-text text-transparent">{preview.service.price}</div>
                </div>
                <p className="text-gray-700 leading-relaxed">{preview.service.description}</p>
                {preview.service.includes && (
                  <div className="bg-green-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-green-800 mb-2">Package Includes</h4>
                    <p className="text-sm text-green-700">{preview.service.includes}</p>
                  </div>
                )}
                {preview.service.benefits && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Key Benefits</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {preview.service.benefits.map((b, i) => (
                        <div key={i} className="flex items-center text-sm text-gray-700"><CheckCircle className="w-4 h-4 mr-2 text-[#d09d80]" />{b}</div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <Link href={`/portfolio?service=${toId(preview.service.name)}&similar=true`}>
                    <Button variant="outline" className="rounded-xl">
                      View More Results
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  {preview.service.name === 'Hiko Nose Thread Lift' ? (
                    <Link href="/hiko-nose-lift">
                      <Button variant="brand" className="rounded-xl">
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="brand" className="rounded-xl" onClick={() => { setSelectedServiceId(toId(preview.service.name)); setIsBookingOpen(true); setIsPreviewOpen(false) }}>
                      Book Now
                      <Calendar className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} defaultServiceId={selectedServiceId} />
    </PullToRefresh>
  )
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <ServicesContent />
    </Suspense>
  )
}
