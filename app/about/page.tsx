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
import { PullToRefresh } from "@/components/pull-to-refresh"
import { SharedHeader } from "@/components/shared-header"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Observer } from "gsap/dist/Observer"
import SplitType from "split-type"

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Observer)
}

export default function AboutPage() {
    const containerRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        if (!containerRef.current) return

        let sections = containerRef.current.querySelectorAll("section"),
            images = containerRef.current.querySelectorAll(".bg"),
            headings = gsap.utils.toArray(".section-heading"),
            outerWrappers = gsap.utils.toArray(".outer"),
            innerWrappers = gsap.utils.toArray(".inner"),
            splitHeadings = headings.map((heading: any) => new SplitText(heading, { type: "chars,words,lines", linesClass: "clip-text" })),
            currentIndex = -1,
            wrap = gsap.utils.wrap(0, sections.length),
            animating = false;

        gsap.set(outerWrappers, { yPercent: 100 });
        gsap.set(innerWrappers, { yPercent: -100 });

        function gotoSection(index: number, direction: number): void {
            index = wrap(index); // make sure it's valid
            animating = true;
            let fromTop = direction === -1,
                dFactor = fromTop ? -1 : 1,
                tl = gsap.timeline({
                    defaults: { duration: 1.25, ease: "power1.inOut" },
                    onComplete: () => { animating = false }
                });
            if (currentIndex >= 0) {
                // The first time this function runs, current is -1
                gsap.set(sections[currentIndex], { zIndex: 0 });
                tl.to(images[currentIndex], { yPercent: -15 * dFactor })
                    .set(sections[currentIndex], { autoAlpha: 0 });
            }
            gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });
            tl.fromTo([outerWrappers[index], innerWrappers[index]], { 
                    yPercent: (i: any) => i ? -100 * dFactor : 100 * dFactor
                }, { 
                    yPercent: 0 
                }, 0)
                .fromTo(images[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0)
                .fromTo(splitHeadings[index].chars, { 
                    autoAlpha: 0, 
                    yPercent: 150 * dFactor
                }, {
                    autoAlpha: 1,
                    yPercent: 0,
                    duration: 1,
                    ease: "power2",
                    stagger: {
                        each: 0.02,
                        from: "random"
                    }
                }, 0.2);

            currentIndex = index;
        }

        Observer.create({
            type: "wheel,touch,pointer",
            wheelSpeed: -1,
            onDown: () => { if (!animating) gotoSection(currentIndex - 1, -1) },
            onUp: () => { if (!animating) gotoSection(currentIndex + 1, 1) },
            tolerance: 10,
            preventDefault: true
        });

        gotoSection(0, 1);

        return () => {
            // Cleanup if needed
        }
    }, { scope: containerRef })

    const teamMembers = [
        {
            name: "JC Hers",
            role: "Medical Director & Founder",
            image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1767092187/da7cey9oa6v95obhtmqt.jpg",
        },
    ]

    const values = [
        {
            icon: <Shield className="w-8 h-8 text-[#d09d80]" />,
            title: "Safety First",
            description: "We prioritize your safety with FDA-approved materials and sterile procedures performed by licensed professionals.",
        },
        {
            icon: <Heart className="w-8 h-8 text-[#d09d80]" />,
            title: "Personalized Care",
            description: "Every treatment is customized to your unique needs and aesthetic goals for natural-looking results.",
        },
        {
            icon: <Award className="w-8 h-8 text-[#d09d80]" />,
            title: "Excellence",
            description: "We maintain the highest standards in medical aesthetics with continuous training and advanced techniques.",
        },
        {
            icon: <Users className="w-8 h-8 text-[#d09d80]" />,
            title: "Client-Centered",
            description: "Your comfort, satisfaction, and confidence are at the heart of everything we do.",
        },
    ]

    const achievements = [
        { number: "3000+", label: "Happy Clients" },
        { number: "15+", label: "Years Experience" },
        { number: "50+", label: "Procedures Mastered" },
        { number: "98%", label: "Satisfaction Rate" },
    ]

return (
        <PullToRefresh>
            <div className="relative overflow-hidden">
                {/* Shared Header */}
                <SharedHeader />
                
                {/* Fullscreen Sections Container */}
                <div ref={containerRef} className="relative h-screen overflow-hidden">
                    
                    {/* Section 1: Hero/About Introduction */}
                    <section className="absolute inset-0 flex items-center justify-center bg-[#fffaff]">
                        <div className="bg absolute inset-0 opacity-30" 
                            style={{ 
                                backgroundImage: 'linear-gradient(45deg, #fbc6c5 0%, #d09d80 100%)',
                                transform: 'scale(1.1)'
                            }}>
                        </div>
                        <div className="outer absolute inset-0 flex items-center justify-center">
                            <div className="inner w-full h-full bg-[#fffaff]"></div>
                        </div>
                        <div className="relative z-10 container mx-auto max-w-6xl px-4">
                            <h1 className="section-heading text-[clamp(4rem,10vw+1rem,8rem)] font-bold tracking-tight text-gray-900 leading-none text-center">
                                ABOUT US.
                            </h1>
                            <div className="mt-16 text-center max-w-4xl mx-auto">
                                <p className="text-xl md:text-2xl leading-relaxed text-gray-600 font-light">
                                    Founded with a passion for helping people achieve their aesthetic goals, <span className="text-gray-900 font-medium italic">Skin Essentials by HER</span> has been at the forefront of non-surgical beauty enhancements in <span className="text-brand-tan font-semibold uppercase tracking-widest text-sm">Quezon City</span>.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Mission & Vision */}
                    <section className="absolute inset-0 flex items-center justify-center bg-white">
                        <div className="bg absolute inset-0 opacity-20" 
                            style={{ 
                                backgroundImage: 'linear-gradient(135deg, #d09d80 0%, #fbc6c5 100%)',
                                transform: 'scale(1.2)'
                            }}>
                        </div>
                        <div className="outer absolute inset-0 flex items-center justify-center">
                            <div className="inner w-full h-full bg-white"></div>
                        </div>
                        <div className="relative z-10 container mx-auto max-w-5xl px-4">
                            <h2 className="section-heading text-[clamp(3rem,8vw+1rem,6rem)] font-bold tracking-tighter text-gray-900 mb-20 text-center uppercase">
                                Our Purpose.
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div className="space-y-6">
                                    <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-900">Our Mission</h3>
                                    <p className="text-lg leading-relaxed text-gray-600 font-light">
                                        To empower individuals to feel confident and beautiful through safe, effective, and personalized aesthetic treatments that enhance their natural beauty.
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-900">Our Vision</h3>
                                    <p className="text-lg leading-relaxed text-gray-600 font-light">
                                        To be the leading provider of non-surgical aesthetic treatments, setting the standard for safety, quality, and client satisfaction in the Philippines.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Quote & Values */}
                    <section className="absolute inset-0 flex items-center justify-center bg-[#fffaff]">
                        <div className="bg absolute inset-0 opacity-15" 
                            style={{ 
                                backgroundImage: 'radial-gradient(circle at center, #fbc6c5 0%, #d09d80 100%)',
                                transform: 'scale(1.3)'
                            }}>
                        </div>
                        <div className="outer absolute inset-0 flex items-center justify-center">
                            <div className="inner w-full h-full bg-[#fffaff]"></div>
                        </div>
                        <div className="relative z-10 container mx-auto max-w-6xl px-4">
                            <div className="text-center space-y-16">
                                <h2 className="section-heading text-[clamp(3rem,8vw+1rem,6rem)] font-bold tracking-tighter text-gray-900 uppercase">
                                    Our Philosophy.
                                </h2>
                                <blockquote className="text-3xl md:text-5xl font-serif italic text-gray-900 leading-tight max-w-4xl mx-auto">
                                    Our work does make sense only if it is a faithful witness of his time.
                                </blockquote>
                                <div className="space-y-8">
                                    <div className="flex flex-wrap justify-center gap-12">
                                        {values.map((value, index) => (
                                            <div key={index} className="flex flex-col items-center space-y-4 max-w-xs">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                    {value.icon}
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{value.title}</h3>
                                                <p className="text-sm text-gray-600 font-light text-center leading-relaxed">
                                                    {value.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Team & Achievements */}
                    <section className="absolute inset-0 flex items-center justify-center bg-white">
                        <div className="bg absolute inset-0 opacity-25" 
                            style={{ 
                                backgroundImage: 'linear-gradient(90deg, #d09d80 0%, #fbc6c5 50%, #d09d80 100%)',
                                transform: 'scale(1.1) rotate(2deg)'
                            }}>
                        </div>
                        <div className="outer absolute inset-0 flex items-center justify-center">
                            <div className="inner w-full h-full bg-white"></div>
                        </div>
                        <div className="relative z-10 container mx-auto max-w-7xl px-4">
                            <h2 className="section-heading text-[clamp(3rem,8vw+1rem,6rem)] font-bold tracking-tighter text-gray-900 mb-20 text-center uppercase">
                                The Team.
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                                <div className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-2xl">
                                    <Image
                                        src={teamMembers[0].image}
                                        alt={teamMembers[0].name}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-8 left-8 text-white">
                                        <p className="text-lg tracking-widest font-bold uppercase mb-2">{teamMembers[0].name}</p>
                                        <p className="text-xs tracking-[0.2em] font-medium opacity-90">{teamMembers[0].role}</p>
                                    </div>
                                </div>
                                <div className="space-y-12">
                                    <p className="text-xl text-gray-600 font-light leading-relaxed">
                                        Every practitioner at Skin Essentials by HER is handpicked for their expertise, medical precision, and eye for natural aesthetics.
                                    </p>
                                    <div className="grid grid-cols-2 gap-8">
                                        {achievements.map((achievement, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="text-5xl font-bold text-gray-900 tracking-tighter">
                                                    {achievement.number}
                                                </div>
                                                <div className="text-xs tracking-[0.3em] uppercase font-bold text-gray-400">
                                                    {achievement.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </PullToRefresh>
    )
}