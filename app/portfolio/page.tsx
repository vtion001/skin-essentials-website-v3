"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useRef } from "react"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { PortfolioGallery } from "@/components/portfolio-gallery"
import { SharedHeader } from "@/components/shared-header"
import type { PortfolioItem } from "@/lib/portfolio-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Shield, ArrowRight, RefreshCw } from "lucide-react"
import Link from "next/link"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Observer } from "gsap/Observer"
import SplitType from "split-type"

export default function PortfolioPage() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [ageConfirmed, setAgeConfirmed] = useState<boolean>(false)
    const [ageGateOpen, setAgeGateOpen] = useState<boolean>(false)
    const [hasMounted, setHasMounted] = useState(false)
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setHasMounted(true)
        try {
            const confirmed = localStorage.getItem("age_gate_18_portfolio") === "true"
            setAgeConfirmed(confirmed)
            if (!confirmed) {
                setAgeGateOpen(true)
            }
        } catch {
            setAgeGateOpen(true)
        }

        const fetchPortfolio = async () => {
            try {
                const res = await fetch('/api/portfolio', { cache: 'no-store' })
                const j = await res.json()
                if (j?.ok && Array.isArray(j.data)) {
                    setPortfolioItems(j.data)
                }
            } catch (err) {
                console.error("Failed to fetch portfolio:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPortfolio()
    }, [])

    useGSAP(() => {
        if (typeof window === "undefined" || !containerRef.current || !hasMounted || isLoading) return
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
    }, { scope: containerRef, dependencies: [hasMounted, isLoading] })

    if (!hasMounted) return null

    // Split items into 2 sections
    const midIndex = Math.ceil(portfolioItems.length / 2)
    const galleryPart1 = portfolioItems.slice(0, midIndex)
    const galleryPart2 = portfolioItems.slice(midIndex)

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
                    padding-top: 100px;
                    padding-bottom: 40px;
                }
                .slide-content-scroll::-webkit-scrollbar { display: none; }
            `}</style>

            <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
                <div className="pointer-events-auto">
                    <SharedHeader />
                </div>
            </div>

            {isLoading && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-white dark:bg-gray-950">
                    <RefreshCw className="w-10 h-10 animate-spin text-brand-tan" />
                </div>
            )}

            {/* Slide 1: Hero */}
            <section className="hero-slide">
                <div className="outer">
                    <div className="inner">
                        <div className="bg bg-gradient-to-br from-rose-50 to-white dark:from-gray-950 dark:to-gray-900" />
                        <div className="relative z-10 flex h-full items-center justify-center px-4 pt-20">
                            <div className="container mx-auto max-w-6xl">
                                <div className="mb-8 text-center md:text-left">
                                    <h1 className="section-heading text-5xl md:text-[80px] lg:text-[100px] font-bold tracking-tight text-gray-900 leading-none uppercase">
                                        Real Results<br />Gallery<span className="text-brand-tan">.</span>
                                    </h1>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
                                    <div className="md:col-span-3 space-y-2 hidden md:block">
                                        <p className="text-[14px] tracking-[0.05em] font-medium text-gray-900">Before & After.</p>
                                        <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Authentic Cases.</p>
                                    </div>

                                    <div className="md:col-span-9 space-y-6">
                                        <p className="text-[15px] md:text-lg leading-[1.8] text-gray-500 font-light max-w-4xl">
                                            <span className="text-gray-900 font-medium italic block mb-2 text-xl">Beyond Beautiful</span>
                                            Discover the remarkable results achieved by our clients through our comprehensive range of medical-grade aesthetic treatments.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                                            <div className="space-y-1">
                                                <h3 className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-900">28 Treatments</h3>
                                                <p className="text-xs text-gray-400">Specialized medical care</p>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-900">Proven Results</h3>
                                                <p className="text-xs text-gray-400">Real client transformations</p>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-900">Expert Artistry</h3>
                                                <p className="text-xs text-gray-400">Precision in every detail</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Slide 2: Gallery Part 1 */}
            <section className="gallery-slide-1">
                <div className="outer">
                    <div className="inner">
                        <div className="bg bg-white dark:bg-gray-950" />
                        <div className="relative z-10 h-full slide-content-scroll px-4">
                            <div className="container mx-auto max-w-7xl">
                                <div className="mb-8 text-center">
                                    <h2 className="section-heading text-3xl md:text-5xl font-serif italic text-gray-900">Clinical Excellence</h2>
                                </div>
                                {ageConfirmed ? (
                                    <PortfolioGallery items={galleryPart1} />
                                ) : (
                                    <div className="max-w-2xl mx-auto rounded-[3rem] border border-rose-100 bg-[#fdf8f5] p-12 text-center shadow-sm">
                                        <Shield className="w-16 h-16 text-[#d09d80] mx-auto mb-6" />
                                        <h3 className="text-2xl font-serif text-gray-900 mb-4">Age Restricted Content</h3>
                                        <p className="text-gray-500 font-light mb-8">Confirm age to view clinical results.</p>
                                        <Button onClick={() => setAgeGateOpen(true)} variant="brand" className="rounded-full px-12">Verify Age</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Slide 3: Gallery Part 2 */}
            <section className="gallery-slide-2">
                <div className="outer">
                    <div className="inner">
                        <div className="bg bg-white dark:bg-gray-950" />
                        <div className="relative z-10 h-full slide-content-scroll px-4">
                            <div className="container mx-auto max-w-7xl">
                                <div className="mb-8 text-center">
                                    <h2 className="section-heading text-3xl md:text-5xl font-serif italic text-gray-900">Aesthetic Evolution</h2>
                                </div>
                                {ageConfirmed ? (
                                    <PortfolioGallery items={galleryPart2} />
                                ) : (
                                    <div className="max-w-2xl mx-auto rounded-[3rem] border border-rose-100 bg-[#fdf8f5] p-12 text-center shadow-sm">
                                        <Shield className="w-16 h-16 text-[#d09d80] mx-auto mb-6" />
                                        <h3 className="text-2xl font-serif text-gray-900 mb-4">Age Restricted Content</h3>
                                        <p className="text-gray-500 font-light mb-8">Confirm age to view clinical results.</p>
                                        <Button onClick={() => setAgeGateOpen(true)} variant="brand" className="rounded-full px-12">Verify Age</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Slide 4: Stats & CTA */}
            <section className="cta-slide">
                <div className="outer">
                    <div className="inner">
                        <div className="bg bg-gradient-to-tr from-white to-[#fbc6c5]/10 dark:from-gray-950 dark:to-gray-900" />
                        <div className="relative z-10 flex h-full items-center justify-center px-4">
                            <div className="container mx-auto max-w-6xl">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 items-center">
                                    <div className="md:col-span-4 space-y-8 hidden md:block">
                                        <div className="space-y-4">
                                            <p className="text-[14px] tracking-[0.05em] font-medium text-gray-900">Performance.</p>
                                            <div className="grid grid-cols-1 gap-6 pt-4">
                                                <div className="space-y-1">
                                                    <div className="text-3xl font-bold text-brand-tan font-serif italic">3000+</div>
                                                    <div className="text-[10px] tracking-widest text-gray-400 uppercase font-bold">Happy Clients</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-3xl font-bold text-brand-tan font-serif italic">98%</div>
                                                    <div className="text-[10px] tracking-widest text-gray-400 uppercase font-bold">Satisfaction</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-8 space-y-12">
                                        <div className="space-y-8">
                                            <h2 className="section-heading text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-none uppercase">
                                                Ready to Transform<br />Your Look<span className="text-brand-tan">?</span>
                                            </h2>
                                            <p className="text-[15px] md:text-lg leading-[1.8] text-gray-500 font-light max-w-2xl">
                                                <span className="text-gray-900 font-medium italic block mb-2 text-xl italic-serif">Proven Results.</span>
                                                Book your consultation today and join our gallery of satisfied clients who have achieved their aesthetic goals with our specialized treatments.
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-6">
                                            <Link href="/contact" className="w-full sm:w-auto">
                                                <button className="w-full text-[11px] font-bold tracking-[0.2em] text-white bg-gray-900 uppercase px-12 py-4 rounded-full hover:bg-gray-800 transition-all transform hover:scale-[1.02]">
                                                    Book Consultation
                                                </button>
                                            </Link>
                                            <Link href="/services" className="w-full sm:w-auto">
                                                <button className="w-full text-[11px] font-bold tracking-[0.2em] text-gray-900 border border-gray-200 uppercase px-12 py-4 rounded-full hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                                    View Services
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

            {/* Age Gate Modal */}
            <Dialog open={ageGateOpen} onOpenChange={setAgeGateOpen}>
                <DialogContent className="sm:max-w-md z-[200]">
                    <DialogHeader>
                        <DialogTitle>Are you 18 years or older?</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            The portfolio includes sensitive medical imagery intended for adults. Please confirm your age to continue.
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
                                        localStorage.setItem("age_gate_18_portfolio", "true")
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
        </div>
    )
}