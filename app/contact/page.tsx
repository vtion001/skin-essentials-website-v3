"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Phone,
    MapPin,
    Clock,
    Star,
    Shield,
    Award,
    Users,
    Heart,
    CheckCircle,
    ArrowRight,
    Stethoscope,
    GraduationCap,
    Target,
    Mail,
    Instagram,
    Facebook,
    MessageCircle,
    AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { SharedHeader } from "@/components/shared-header"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Observer } from "gsap/Observer"
import SplitType from "split-type"

export default function ContactPage() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: "",
        date: "",
        time: "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [errors, setErrors] = useState<{ [k: string]: string }>({})

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        const newErrors: { [k: string]: string } = {}
        if (!formData.name.trim()) newErrors.name = "Full name is required"
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Enter a valid email"
        setErrors(newErrors)
        
        if (Object.keys(newErrors).length > 0) {
            setIsSubmitting(false)
            return
        }

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    service: formData.service || 'Consultation',
                    notes: formData.message,
                    sourcePlatform: 'website'
                })
            })

            if (response.ok) {
                setIsSubmitted(true)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsSubmitting(false)
        }
    }

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
            <section className="hero-slide">
                <div className="outer">
                    <div className="inner">
                        <div className="bg bg-gradient-to-br from-[#fffaff] to-[#fbc6c5]/10" />
                        <div className="relative z-10 flex h-full items-center justify-center px-4 pt-20">
                            <div className="container mx-auto max-w-6xl">
                                <div className="mb-12 text-center md:text-left">
                                    <h1 className="section-heading text-7xl md:text-[120px] font-bold tracking-tight text-gray-900 leading-none">
                                        GET IN TOUCH<span className="text-brand-tan">.</span>
                                    </h1>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
                                    <div className="md:col-span-3 space-y-2 hidden md:block">
                                        <p className="text-[14px] tracking-[0.05em] font-medium text-gray-900">Communication.</p>
                                        <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Our location.</p>
                                    </div>

                                    <div className="md:col-span-9 space-y-12">
                                        <p className="text-[15px] md:text-lg leading-[1.8] text-gray-500 font-light max-w-4xl">
                                            <span className="text-gray-900 font-medium italic block mb-2 text-xl italic-serif">Start Your Transformation.</span>
                                            Ready to start your beauty journey? Contact us today to schedule your complimentary consultation and discover the perfect treatment for your aesthetic goals.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-gray-100">
                                            <div className="space-y-2">
                                                <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-900 flex items-center gap-2">
                                                    <Phone className="w-3 h-3 text-[#d09d80]" /> Phone
                                                </h3>
                                                <p className="text-sm text-gray-500 font-light">0995-260-3451</p>
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-900 flex items-center gap-2">
                                                    <MapPin className="w-3 h-3 text-[#d09d80]" /> Location
                                                </h3>
                                                <p className="text-sm text-gray-500 font-light">Quezon City, Manila</p>
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-900 flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-[#d09d80]" /> Hours
                                                </h3>
                                                <p className="text-sm text-gray-500 font-light">Mon-Sat: 9AM - 5PM</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Slide 2: Contact Form */}
            <section className="form-slide">
                <div className="outer">
                    <div className="inner">
                        <div className="bg bg-white" />
                        <div className="relative z-10 h-full slide-content-scroll flex items-center px-4">
                            <div className="container mx-auto max-w-6xl py-20">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                                    <div className="lg:col-span-7 space-y-12">
                                        <div className="space-y-4">
                                            <h2 className="section-heading text-4xl md:text-5xl font-serif text-gray-900 italic-serif">Contact form.</h2>
                                            <p className="text-[15px] text-gray-400 font-light">Fill this out so we can learn more about your aesthetic needs.</p>
                                        </div>

                                        {isSubmitted ? (
                                            <div className="bg-[#fdf8f5] p-12 rounded-[2rem] text-center space-y-6 shadow-sm">
                                                <CheckCircle className="w-16 h-16 text-brand-tan mx-auto" />
                                                <h3 className="text-2xl font-serif text-gray-900">Message Received.</h3>
                                                <p className="text-gray-500 font-light">Thank you. Our medical team will contact you shortly.</p>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmit} className="space-y-10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <input
                                                        name="name"
                                                        placeholder="Full Name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-transparent border-b border-gray-200 py-4 text-lg font-light focus:outline-none focus:border-brand-tan transition-all"
                                                    />
                                                    <input
                                                        name="email"
                                                        placeholder="Email Address"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-transparent border-b border-gray-200 py-4 text-lg font-light focus:outline-none focus:border-brand-tan transition-all"
                                                    />
                                                </div>
                                                <textarea
                                                    name="message"
                                                    placeholder="Tell us about your aesthetic goals..."
                                                    rows={4}
                                                    value={formData.message}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-transparent border-b border-gray-200 py-4 text-lg font-light focus:outline-none focus:border-brand-tan transition-all resize-none"
                                                />
                                                <div className="flex justify-end">
                                                    <button type="submit" disabled={isSubmitting} className="text-[11px] font-bold tracking-[0.2em] text-white bg-gray-900 uppercase px-12 py-4 rounded-full hover:bg-gray-800 transition-all">
                                                        {isSubmitting ? "Sending..." : "Send Message"}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>

                                    <div className="lg:col-span-5 flex flex-col justify-center space-y-12">
                                        <div className="space-y-8">
                                            <h2 className="text-3xl font-serif text-gray-900">Skin Essentials.</h2>
                                            <div className="space-y-6">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold tracking-[0.2em] text-gray-900 uppercase">Email us</p>
                                                    <p className="text-gray-500 font-light">ceo.jchers@gmail.com</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold tracking-[0.2em] text-gray-900 uppercase">Call us</p>
                                                    <p className="text-gray-500 font-light">0995-260-3451</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <Link href="https://www.instagram.com/skin_essentials_by_hers/" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-tan hover:text-white transition-all"><Instagram className="w-4 h-4" /></Link>
                                            <Link href="https://www.facebook.com/SkinessentialsbyHER" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-tan hover:text-white transition-all"><Facebook className="w-4 h-4" /></Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Slide 3: Emergency */}
            <section className="cta-slide">
                <div className="outer">
                    <div className="inner">
                        <div className="bg bg-gradient-to-tr from-white to-[#fbc6c5]/10" />
                        <div className="relative z-10 flex h-full items-center justify-center px-4">
                            <div className="container mx-auto max-w-6xl text-center md:text-left">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 items-center">
                                    <div className="md:col-span-3 hidden md:block">
                                        <p className="text-[11px] tracking-[0.3em] font-bold text-red-500 uppercase">Urgent notice.</p>
                                    </div>
                                    <div className="md:col-span-9 space-y-12">
                                        <div className="space-y-6">
                                            <div className="inline-flex items-center gap-2 text-red-500">
                                                <AlertTriangle className="w-5 h-5" />
                                                <span className="text-[11px] tracking-[0.3em] font-bold uppercase">Urgent notice</span>
                                            </div>
                                            <h2 className="section-heading text-[clamp(2.25rem,5vw+1rem,3.75rem)] font-bold tracking-tight text-gray-900 leading-none uppercase">
                                                Experiencing complications<br />or unusual symptoms?
                                            </h2>
                                            <p className="text-lg text-gray-500 font-light max-w-xl">
                                                Safety is our priority. If you experience severe pain or any unusual reactions, contact our medical team immediately.
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
                                            <Link href="tel:09952603451" className="w-full sm:w-auto">
                                                <button className="w-full flex items-center justify-center gap-3 text-[11px] font-bold tracking-[0.2em] text-white bg-red-500 uppercase px-12 py-5 rounded-full hover:bg-red-600 transition-all shadow-xl shadow-red-200/50">
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
