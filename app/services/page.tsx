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
import { useState, useEffect, Suspense, useRef } from "react"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { SharedHeader } from "@/components/shared-header"
import { cn } from "@/lib/utils"
import { BookingModal } from "@/components/booking-modal"
import { serviceCategories as localServiceCategories, type Service, type ServiceCategory } from "@/lib/services-data"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Observer } from "gsap/Observer"
import SplitType from "split-type"

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string>("")
  const [activeCategoryId, setActiveCategoryId] = useState<string>("")
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

  const toId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

  useGSAP(() => {
    if (typeof window === "undefined" || !containerRef.current) return
    gsap.registerPlugin(Observer)

    const sections = gsap.utils.toArray<HTMLElement>("section", containerRef.current)
    const images = gsap.utils.toArray<HTMLElement>(".bg", containerRef.current)
    const headings = gsap.utils.toArray<HTMLElement>(".section-heading", containerRef.current)
    const outerWrappers = gsap.utils.toArray<HTMLElement>(".outer", containerRef.current)
    const innerWrappers = gsap.utils.toArray<HTMLElement>(".inner", containerRef.current)
    
    const splitHeadings = headings.map(heading => 
        new SplitType(heading, { types: "chars,words,lines" })
    )

    headings.forEach(heading => {
        const lines = heading.querySelectorAll('.line')
        lines.forEach(line => { (line as HTMLElement).style.overflow = 'hidden' })
    })

    let currentIndex = -1
    const wrap = gsap.utils.wrap(0, sections.length)
    let animating = false

    gsap.set(outerWrappers, { yPercent: 100 })
    gsap.set(innerWrappers, { yPercent: -100 })
    gsap.set(sections, { autoAlpha: 0, zIndex: 10 })

    function gotoSection(index: number, direction: number) {
        if (animating || index === currentIndex) return
        index = wrap(index)
        animating = true
        
        const fromTop = direction === -1
        const dFactor = fromTop ? -1 : 1
        const tl = gsap.timeline({
            defaults: { duration: 1.25, ease: "power2.inOut" },
            onComplete: () => { animating = false }
        })

        if (currentIndex >= 0) {
            gsap.set(sections[currentIndex], { zIndex: 10 })
            tl.to(images[currentIndex], { yPercent: -15 * dFactor })
              .set(sections[currentIndex], { autoAlpha: 0 })
        }

        gsap.set(sections[index], { autoAlpha: 1, zIndex: 20 })
        
        tl.fromTo([outerWrappers[index], innerWrappers[index]], { 
            yPercent: i => i ? -100 * dFactor : 100 * dFactor
        }, { 
            yPercent: 0 
        }, 0)
        .fromTo(images[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0)
        
        if (splitHeadings[index] && splitHeadings[index].chars) {
            tl.fromTo(splitHeadings[index].chars, { 
                autoAlpha: 0, 
                yPercent: 150 * dFactor
            }, {
                autoAlpha: 1,
                yPercent: 0,
                duration: 1,
                ease: "power4.out",
                stagger: { each: 0.02, from: "random" }
            }, 0.2)
        }

        currentIndex = index
        // Update active category tracking based on slide index
        // Slides: 0=Hero, 1 to categories.length=Categories, Last=CTA
        if (index >= 1 && index < sections.length - 1) {
            setActiveCategoryId(categories[index - 1].id)
        }
    }

    const observer = Observer.create({
        type: "wheel,touch,pointer",
        wheelSpeed: -1,
        onDown: () => !animating && gotoSection(currentIndex - 1, -1),
        onUp: () => !animating && gotoSection(currentIndex + 1, 1),
        tolerance: 10,
        preventDefault: true
    })

    gotoSection(0, 1)

    return () => {
        observer.kill()
        splitHeadings.forEach(s => s.revert())
    }
  }, { scope: containerRef, dependencies: [categories] })

  return (
    <div ref={containerRef} className="h-screen w-full overflow-hidden bg-white dark:bg-gray-950">
      <style jsx global>{`
        .clip-text, .line { overflow: hidden; }
        section {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            visibility: hidden;
            overflow: hidden;
            background-color: #fff;
        }
        .dark section { background-color: #030712; }
        .outer, .inner { width: 100%; height: 100%; overflow: hidden; }
        .bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
        }
        .slide-content-scroll {
            height: 100%;
            overflow-y: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
            padding-top: 120px;
            padding-bottom: 60px;
        }
        .slide-content-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
        <div className="pointer-events-auto">
          <SharedHeader showBackButton={true} backHref="/" />
        </div>
      </div>

      <BookingQueryEffect setSelectedServiceId={setSelectedServiceId} setIsBookingOpen={setIsBookingOpen} />

      {/* Slide 1: Hero */}
      <section className="hero-slide" style={{ backgroundColor: '#fff' }}>
        <div className="outer">
          <div className="inner">
            <div className="bg bg-gradient-to-br from-white to-[#fbc6c5]/10" />
            <div className="relative z-10 flex h-full items-center justify-center px-4 pt-20">
              <div className="container mx-auto max-w-6xl text-center md:text-left">
                <div className="mb-12">
                  <h1 className="section-heading text-[clamp(3rem,8vw+1rem,6.25rem)] font-bold tracking-tight text-gray-900 leading-none uppercase">
                    Aesthetic<br />Services<span className="text-brand-tan">.</span>
                  </h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                  <div className="md:col-span-3 space-y-2 hidden md:block">
                    <p className="text-[14px] tracking-[0.05em] font-medium text-gray-900">Complete Range.</p>
                    <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Expert Care.</p>
                  </div>
                  <div className="md:col-span-9">
                    <p className="text-[15px] md:text-lg leading-[1.8] text-gray-500 font-light max-w-4xl">
                      <span className="text-gray-900 font-medium italic block mb-2 text-xl">Beyond Beautiful</span>
                      Discover Quezon City&rsquo;s most comprehensive collection of medical-grade aesthetic treatments, including our signature
                      <span className="text-gray-900 font-medium italic"> Hiko Nose Thread Lifts</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic slides for each category */}
      {categories.map((category, categoryIndex) => (
        <section key={category.id} style={{ backgroundColor: categoryIndex % 2 === 1 ? "#fdfbfb" : "#fff" }}>
          <div className="outer">
            <div className="inner">
              <div className="bg bg-gradient-to-br from-transparent to-[#d09d80]/5" />
              <div className="relative z-10 h-full slide-content-scroll px-4">
                <div className="container mx-auto max-w-6xl">
                  <div className="text-center mb-16">
                    <h2 className="section-heading text-[clamp(2.25rem,5vw+1rem,3.75rem)] font-bold text-gray-900 mb-6 font-serif italic">{category.category}</h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">{category.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {category.services.map((service, serviceIndex) => (
                        <motion.button
                          key={serviceIndex}
                          className="group flex flex-col items-center text-center w-full focus:outline-none bg-white p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
                          onClick={() => { setPreview({ service, category }); setIsPreviewOpen(true) }}
                        >
                          <div className="w-full aspect-[4/3] bg-gray-100 mb-6 overflow-hidden rounded-[2rem]">
                            <img
                              src={service.image || `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(service.name)}`}
                              alt={service.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          </div>
                          <h3 className="font-serif text-lg tracking-widest text-gray-900 uppercase mb-3 line-clamp-1">{service.name}</h3>
                          <div className="mt-auto text-[#d09d80] font-bold text-xs tracking-widest uppercase">{service.price}</div>
                        </motion.button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Slide N: CTA */}
      <section className="cta-slide" style={{ backgroundColor: '#fff' }}>
        <div className="outer">
          <div className="inner">
            <div className="bg bg-gradient-to-tr from-white to-[#fbc6c5]/10" />
            <div className="relative z-10 flex h-full items-center justify-center px-4">
              <div className="container mx-auto max-w-6xl text-center md:text-left">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
                  <div className="md:col-span-4 space-y-2 hidden md:block">
                    <p className="text-[14px] tracking-[0.05em] font-medium text-gray-900">Next Steps.</p>
                    <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Consultation.</p>
                  </div>
                  <div className="md:col-span-8 space-y-12">
                    <h2 className="section-heading text-[clamp(2.25rem,5vw+1rem,3.75rem)] font-bold tracking-tight text-gray-900 leading-none uppercase">
                      Ready to Transform<br />Your Look<span className="text-brand-tan">?</span>
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
                      <Link href="tel:09952603451" className="w-full sm:w-auto">
                        <button className="w-full text-[11px] font-bold tracking-[0.2em] text-white bg-gray-900 uppercase px-12 py-4 rounded-full hover:bg-gray-800 transition-all transform hover:scale-[1.02]">
                          Call 0995-260-3451
                        </button>
                      </Link>
                      <Link href="/portfolio" className="w-full sm:w-auto">
                        <button className="w-full text-[11px] font-bold tracking-[0.2em] text-gray-900 border border-gray-200 uppercase px-12 py-4 rounded-full hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
                          View Our Portfolio
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overlays (Modals & Dialogs) */}
      <Dialog open={isPreviewOpen} onOpenChange={(v) => { if (!v) { setIsPreviewOpen(false); setPreview(null) } }}>
        <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl rounded-2xl max-h-[85vh] overflow-y-auto z-[200]">
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
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6">
                  <Button
                    variant="brand"
                    className="rounded-xl w-full h-11 sm:h-9"
                    onClick={() => {
                      setSelectedServiceId(toId(preview.service.name));
                      setIsBookingOpen(true);
                      setIsPreviewOpen(false)
                    }}
                  >
                    Book Now
                    <Calendar className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} defaultServiceId={selectedServiceId} />
    </div>
  )
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <ServicesContent />
    </Suspense>
  )
}
