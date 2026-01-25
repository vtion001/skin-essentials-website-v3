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
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { SharedHeader } from "@/components/shared-header"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Observer } from "gsap/Observer"
import SplitType from "split-type"

export default function AboutPage() {
    const containerRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        if (typeof window === "undefined" || !containerRef.current) return
        gsap.registerPlugin(Observer)

        // Scope selectors to this component to avoid picking up layout elements
        const sections = gsap.utils.toArray<HTMLElement>("section", containerRef.current)
        const images = gsap.utils.toArray<HTMLElement>(".bg", containerRef.current)
        const headings = gsap.utils.toArray<HTMLElement>(".section-heading", containerRef.current)
        const outerWrappers = gsap.utils.toArray<HTMLElement>(".outer", containerRef.current)
        const innerWrappers = gsap.utils.toArray<HTMLElement>(".inner", containerRef.current)

        // Split Headings for animation
        const splitHeadings = headings.map(heading =>
            new SplitType(heading, { types: "chars,words,lines" })
        )

        // Add overflow hidden to lines for masking entry
        headings.forEach(heading => {
            const lines = heading.querySelectorAll('.line');
            lines.forEach(line => {
                (line as HTMLElement).style.overflow = 'hidden';
            });
        });

        let currentIndex = -1
        const wrap = gsap.utils.wrap(0, sections.length)
        let animating = false

        // Initial setup: hide everything
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
                // Move current section to back layer
                gsap.set(sections[currentIndex], { zIndex: 10 })

                // Animate current section out slightly
                tl.to(images[currentIndex], { yPercent: -15 * dFactor })
                    .set(sections[currentIndex], { autoAlpha: 0 })
            }

            // Bring new section to front and make it visible
            // The section background will now block the previous one
            gsap.set(sections[index], { autoAlpha: 1, zIndex: 20 })

            // Core sliding transition
            tl.fromTo([outerWrappers[index], innerWrappers[index]], {
                yPercent: i => i ? -100 * dFactor : 100 * dFactor
            }, {
                yPercent: 0
            }, 0)
                .fromTo(images[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0)

            // Heading character animation
            if (splitHeadings[index] && splitHeadings[index].chars) {
                tl.fromTo(splitHeadings[index].chars, {
                    autoAlpha: 0,
                    yPercent: 150 * dFactor
                }, {
                    autoAlpha: 1,
                    yPercent: 0,
                    duration: 1,
                    ease: "power4.out",
                    stagger: {
                        each: 0.02,
                        from: "random"
                    }
                }, 0.2)
            }

            currentIndex = index
        }

        // Initialize scroll/touch observer
        const observer = Observer.create({
            type: "wheel,touch,pointer",
            wheelSpeed: -1,
            onDown: () => !animating && gotoSection(currentIndex - 1, -1),
            onUp: () => !animating && gotoSection(currentIndex + 1, 1),
            tolerance: 10,
            preventDefault: true
        })

        // Show first slide
        gotoSection(0, 1)

        return () => {
            observer.kill()
            splitHeadings.forEach(s => s.revert())
        }
    }, { scope: containerRef })

    const teamMembers = [
        {
            name: "JC Hers",
            role: "Medical Director & Founder",
            image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1767092187/da7cey9oa6v95obhtmqt.jpg",
        },
    ]

    const achievements = [
        { number: "3000+", label: "Happy Clients" },
        { number: "15+", label: "Years Experience" },
        { number: "50+", label: "Procedures Mastered" },
        { number: "98%", label: "Satisfaction Rate" },
    ]

    return (
        <div ref={containerRef} className="h-screen w-full overflow-hidden bg-white dark:bg-gray-950">
            <style jsx global>{`
                .clip-text, .line {
                    overflow: hidden;
                }
                section {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    visibility: hidden;
                    overflow: hidden;
                    /* Ensure sections are opaque to prevent background bleed */
                    background-color: #fff;
                }
                .dark section {
                    background-color: #030712;
                }
                .outer, .inner {
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                .bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                }
            `}</style>

            <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
                <div className="pointer-events-auto">
                    <SharedHeader />
                </div>
            </div>

            {/* Slide 1: Introduction */}
            <section className="first" style={{ backgroundColor: '#fffaff' }}>
                <div className="outer">
                    <div className="inner">
                        <div className="bg bg-gradient-to-br from-[#fffaff] to-[#fbc6c5]/10 dark:from-gray-950 dark:to-gray-900" />
                        <div className="relative z-10 flex h-full items-center justify-center px-4 pt-20">
                            <div className="container mx-auto max-w-6xl">
                                <div className="mb-12 text-center md:text-left">
                                    <h1 className="section-heading text-[clamp(3.75rem,10vw+1rem,7.5rem)] font-bold tracking-tight text-gray-900 leading-none uppercase">
                                        ABOUT US.
                                    </h1>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
                                    <div className="md:col-span-3 space-y-2 hidden md:block">
                                        <p className="text-[14px] tracking-[0.05em] font-medium text-gray-900">Our story.</p>
                                        <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Our mission.</p>
                                        <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Our vision.</p>
                                    </div>

                                    <div className="md:col-span-9 space-y-8">
                                        <div className="space-y-6">
                                            <p className="text-[15px] md:text-lg leading-[1.8] text-gray-500 font-light max-w-4xl">
                                                Founded with a passion for helping people achieve their aesthetic goals, <span className="text-gray-900 font-medium italic">Skin Essentials by HER</span> has been at the forefront of non-surgical beauty enhancements in <span className="text-brand-tan font-semibold uppercase tracking-widest text-sm">Quezon City</span>.
                                            </p>
                                            <p className="text-[15px] md:text-lg leading-[1.8] text-gray-500 font-light max-w-4xl">
                                                After years of dedication to medical excellence, our clinic has gained a reputation for being the go-to destination for <span className="text-gray-900 font-medium">Hiko Nose Lifts</span> and <span className="text-gray-900 font-medium">Dermal Fillers</span>.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-gray-100">
                                            <div className="space-y-2">
                                                <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-900">Our Mission</h3>
                                                <p className="text-xs leading-relaxed text-gray-500 font-light">
                                                    To empower individuals to feel confident and beautiful through safe, effective, and personalized aesthetic treatments.
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-900">Our Vision</h3>
                                                <p className="text-xs leading-relaxed text-gray-500 font-light">
                                                    To be the leading provider of non-surgical aesthetic treatments, setting the standard for safety and quality.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Slide 2: Values & Image */}
            <section className="second" style={{ backgroundColor: '#fff' }}>
                <div className="outer">
                    <div className="inner">
                        <div className="bg bg-gradient-to-tr from-white to-[#d09d80]/10 dark:from-gray-900 dark:to-gray-800" />
                        <div className="relative z-10 flex h-full items-center justify-center px-4 pt-20">
                            <div className="container mx-auto max-w-6xl">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm shadow-2xl">
                                        <Image
                                            src="https://res.cloudinary.com/dbviya1rj/image/upload/v1766188665/k455iex0ft2a6bxoabsl.png"
                                            alt="Skin Essentials Team"
                                            fill
                                            className="object-cover grayscale-[0.2] contrast-[1.1]"
                                        />
                                    </div>
                                    <div className="space-y-12">
                                        <h2 className="section-heading text-4xl md:text-6xl font-bold tracking-tight text-gray-900 uppercase">
                                            OUR CORE<br />VALUES.
                                        </h2>
                                        <div className="relative py-8 px-2 md:px-12">
                                            <span className="absolute top-0 left-0 text-7xl text-gray-100 font-serif leading-none select-none">“</span>
                                            <blockquote className="text-2xl md:text-3xl font-serif italic text-gray-900 leading-[1.2] mb-6 relative z-10">
                                                Our work does make sense only if it is a faithful witness of his time.
                                            </blockquote>
                                            <cite className="text-sm font-bold text-gray-900 not-italic uppercase tracking-wider block">JC Hers</cite>
                                            <span className="absolute bottom-0 right-0 text-7xl text-gray-100 font-serif leading-none select-none rotate-180">“</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Slide 3: Team & Stats */}
            <section className="third" style={{ backgroundColor: '#fff' }}>
                <div className="outer">
                    <div className="inner">
                        <div className="bg bg-gradient-to-bl from-white to-[#fbc6c5]/10 dark:from-gray-950 dark:to-gray-900" />
                        <div className="relative z-10 flex h-full items-center justify-center px-4 pt-20">
                            <div className="container mx-auto max-w-7xl">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
                                    <div className="lg:col-span-5 relative aspect-[852/1280] max-h-[70vh] shadow-2xl rounded-sm overflow-hidden group mx-auto w-full">
                                        <Image
                                            src={teamMembers[0].image}
                                            alt={teamMembers[0].name}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                                        <div className="absolute bottom-8 left-8 text-white z-30">
                                            <p className="text-lg tracking-widest font-bold uppercase mb-2">{teamMembers[0].name}</p>
                                            <p className="text-xs tracking-[0.2em] font-medium opacity-90">{teamMembers[0].role}</p>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-7 space-y-12">
                                        <h2 className="section-heading text-[clamp(3rem,6vw+1rem,6rem)] font-bold tracking-tighter text-gray-900 leading-none uppercase">
                                            THE FOUNDER.
                                        </h2>
                                        <p className="text-gray-500 text-sm md:text-base leading-relaxed font-light max-w-xl">
                                            Every practitioner at Skin Essentials by HER is handpicked for their expertise, medical precision, and eye for natural aesthetics.
                                        </p>
                                        <div className="grid grid-cols-2 gap-x-12 gap-y-8 border-t border-gray-100 pt-8">
                                            {achievements.map((achievement, index) => (
                                                <div key={index} className="space-y-1">
                                                    <div className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tighter">
                                                        {achievement.number}
                                                    </div>
                                                    <div className="text-[9px] tracking-[0.3em] uppercase font-bold text-gray-400">
                                                        {achievement.label}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-8">
                                            <Link href="/contact">
                                                <Button variant="brand" size="lg" className="rounded-full px-12 group">
                                                    Book Consultation
                                                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                                </Button>
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