"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Shield, Clock, CreditCard, Camera, AlertTriangle, Heart, Star, Award, Users, Search, TrendingUp, Briefcase, Zap, Filter, ArrowRight } from "lucide-react"
import { useState, useEffect, useMemo, useRef } from "react"
import { SharedHeader } from "@/components/shared-header"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Observer } from "gsap/Observer"
import SplitType from "split-type"
import Link from "next/link"

export default function FAQPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const generalFAQs = [
    {
      category: "General Information",
      id: "general",
      questions: [
        { q: "How long does a procedure take?", a: "Procedure times vary depending on the service, ranging from 30 minutes for quick treatments to 2-3 hours for more intensive procedures like thread lifts or fillers." },
        { q: "Is there any downtime?", a: "Most of our non-surgical treatments require minimal to no downtime. Clients often experience mild swelling or redness for 1-3 days but can typically resume daily activities immediately." },
        { q: "Are the materials and products FDA-approved?", a: "Yes. We prioritize your safety by exclusively using high-quality, medical-grade materials and products that are approved by the FDA." },
      ],
    },
    {
      category: "Pricing & Payment",
      id: "pricing",
      questions: [
        { q: "What payment methods do you accept?", a: "We accept GCash, Bank Transfers, and Cash payments. Unfortunately, we do not currently accept credit cards or offer installment plans." },
        { q: "Do you offer packages?", a: "Yes! We offer various package deals that combine multiple treatments for better value. Contact us to learn about current promotional packages." },
      ],
    },
    {
      category: "Before Your Visit",
      id: "preparation",
      questions: [
        { q: "How do I prepare for my procedure?", a: "Hydrate well, avoid alcohol for 24-48 hours prior, and arrive with clean skin. Please disclose any medical conditions or allergies during your consultation." },
        { q: "What should I bring?", a: "Please bring a valid ID and any relevant medical history or medication lists." },
      ],
    },
    {
      category: "Service Specifics",
      id: "services",
      questions: [
        { q: "What is a PDO thread lift?", a: "PDO thread lifts use biocompatible threads to lift and tighten sagging skin. The threads dissolve naturally while stimulating collagen production." },
        { q: "Can fillers be dissolved?", a: "Yes! Hyaluronic acid fillers can be dissolved using hyaluronidase enzyme if needed, allowing for adjustments to achieve your desired look." },
      ],
    }
  ]

  const allFAQs = generalFAQs

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
  }, { scope: containerRef })

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

      {/* Slide 1: Hero */}
      <section className="hero-slide" style={{ backgroundColor: '#fff' }}>
        <div className="outer">
          <div className="inner">
            <div className="bg bg-gradient-to-br from-white to-[#fbc6c5]/10" />
            <div className="relative z-10 flex h-full items-center justify-center px-4 pt-20">
              <div className="container mx-auto max-w-6xl text-center md:text-left">
                <div className="mb-12">
                  <h1 className="section-heading text-[clamp(3.75rem,10vw+1rem,7.5rem)] font-bold tracking-tight text-gray-900 leading-none uppercase">
                    FAQ<span className="text-[#d09d80]">.</span>
                  </h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                  <div className="md:col-span-3 space-y-2 hidden md:block">
                    <p className="text-[14px] tracking-[0.05em] font-medium text-gray-900">Your questions.</p>
                    <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Our protocols.</p>
                  </div>
                  <div className="md:col-span-9">
                    <p className="text-[15px] md:text-lg leading-[1.8] text-gray-500 font-light max-w-4xl">
                      <span className="text-gray-900 font-medium italic block mb-2 text-xl">Expert Guidance</span>
                      Find answers to common questions about our aesthetic treatments, safety protocols, and what to expect during your visit to Skin Essentials by HER.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic slides for each FAQ category */}
      {allFAQs.map((category, categoryIndex) => (
        <section key={category.id} style={{ backgroundColor: categoryIndex % 2 === 1 ? "#fdfbfb" : "#fff" }}>
          <div className="outer">
            <div className="inner">
              <div className="bg bg-gradient-to-br from-transparent to-[#d09d80]/5" />
              <div className="relative z-10 h-full slide-content-scroll px-4">
                <div className="container mx-auto max-w-4xl">
                  <div className="mb-16">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-gray-400 uppercase block mb-2">Category.</span>
                    <h2 className="section-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif italic">{category.category}</h2>
                  </div>

                  <div className="space-y-8">
                    {category.questions.map((faq, faqIndex) => (
                      <div key={faqIndex} className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex gap-6">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#fbc6c5]/20 flex items-center justify-center text-[#d09d80] font-bold text-xs">
                            {faqIndex + 1}
                          </div>
                          <div className="space-y-4">
                            <h3 className="text-xl md:text-2xl font-medium text-gray-900 leading-snug">{faq.q}</h3>
                            <p className="text-base md:text-lg leading-relaxed text-gray-500 font-light">{faq.a}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Slide N: Emergency/CTA */}
      <section className="cta-slide" style={{ backgroundColor: '#fff' }}>
        <div className="outer">
          <div className="inner">
            <div className="bg bg-gradient-to-tr from-white to-[#fbc6c5]/10" />
            <div className="relative z-10 flex h-full items-center justify-center px-4">
              <div className="container mx-auto max-w-6xl text-center md:text-left">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 items-center">
                  <div className="md:col-span-4 space-y-2 hidden md:block">
                    <p className="text-[14px] tracking-[0.05em] font-medium text-red-500 uppercase">Emergency Notice.</p>
                  </div>
                  <div className="md:col-span-8 space-y-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 text-red-500">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="text-[11px] tracking-[0.3em] font-bold uppercase">Urgent notice</span>
                        </div>
                        <h2 className="section-heading text-[clamp(2.25rem,5vw+1rem,3.75rem)] font-bold tracking-tight text-gray-900 leading-none uppercase">
                        Experiencing complications<br />or unusual symptoms?
                        </h2>
                        <p className="text-lg text-gray-500 font-light max-w-xl">
                        Safety is our priority. If you experience severe pain, excessive swelling, or any unusual reactions, contact our medical team immediately.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
                      <Link href="tel:09952603451" className="w-full sm:w-auto">
                        <button className="w-full flex items-center justify-center gap-3 text-[11px] font-bold tracking-[0.2em] text-white bg-red-500 uppercase px-12 py-5 rounded-full hover:bg-red-600 transition-all transform hover:scale-[1.02] shadow-xl shadow-red-200/50">
                          <Phone className="w-4 h-4" />
                          0995-260-3451
                        </button>
                      </Link>
                      <Link href="/" className="w-full sm:w-auto">
                        <button className="w-full text-[11px] font-bold tracking-[0.2em] text-gray-900 border border-gray-200 uppercase px-12 py-5 rounded-full hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
                          Back to Home
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
    </div>
  )
}