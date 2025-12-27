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
import { useState, useEffect } from "react"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { SharedHeader } from "@/components/shared-header"

export default function AboutPage() {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const teamMembers = [
        {
            name: "JC Hers",
            role: "Medical Director & Founder",
            image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1754329770/820be4e7-a6c7-46d4-b522-c9dc3e39f194.png",
        },
        {
            name: "Maria Santos",
            role: "Senior Aesthetic Practitioner",
            image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758859267/bbecd5de-3bea-4490-8fef-144ca997ed41.png",
        },
        {
            name: "Elena Cruz",
            role: "Dermatology Specialist",
            image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1754329770/820be4e7-a6c7-46d4-b522-c9dc3e39f194.png",
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
            <div className="min-h-screen bg-[#fffaff] dark:bg-gray-950 pb-20 md:pb-0 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-16 left-10 w-32 h-32 bg-gradient-to-br from-[#fbc6c5]/20 to-[#d09d80]/20 dark:from-[#fbc6c5]/10 dark:to-[#d09d80]/10 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#d09d80]/30 to-[#fbc6c5]/30 dark:from-[#d09d80]/20 dark:to-[#fbc6c5]/20 rounded-full blur-lg animate-bounce"></div>
                    <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-[#fbc6c5]/10 to-[#d09d80]/10 dark:from-[#fbc6c5]/5 dark:to-[#d09d80]/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
                </div>

                {/* Shared Header */}
                <SharedHeader />


                {/* Content Section (Inspired by Reference) */}
                <section className="pt-40 pb-32 px-4 relative z-10">
                    <div className="container mx-auto max-w-6xl">
                        {/* Huge Editorial Title */}
                        <div className="mb-24 text-center md:text-left">
                            <h1 className="text-7xl md:text-[120px] font-bold tracking-tight text-gray-900 leading-none">
                                ABOUT US.
                            </h1>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
                            {/* Left Sidebar Identifiers */}
                            <div className="md:col-span-3 space-y-2">
                                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-900">Our story.</p>
                                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Our mission.</p>
                                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Our vision.</p>
                            </div>

                            {/* Main Narrative Content */}
                            <div className="md:col-span-9 space-y-12">
                                <div className="space-y-8">
                                    <p className="text-[15px] md:text-lg leading-[1.8] text-gray-500 font-light max-w-4xl">
                                        Founded with a passion for helping people achieve their aesthetic goals, <span className="text-gray-900 font-medium italic">Skin Essentials by HER</span> has been at the forefront of non-surgical beauty enhancements in <span className="text-brand-tan font-semibold uppercase tracking-widest text-sm">Quezon City</span> since its inception. Our journey began with a simple mission: to provide safe, effective, and affordable aesthetic treatments that enhance natural beauty.
                                    </p>

                                    <p className="text-[15px] md:text-lg leading-[1.8] text-gray-500 font-light max-w-4xl">
                                        After years of dedication to medical excellence, our clinic has gained a reputation for being the go-to destination for <span className="text-gray-900 font-medium">Hiko Nose Lifts</span>, <span className="text-gray-900 font-medium">Thread Lifts</span>, and <span className="text-gray-900 font-medium">Dermal Fillers</span>. Our state-of-the-art facility and experienced team ensure that every client receives the highest quality treatment in a comfortable and professional environment.
                                    </p>
                                </div>

                                {/* Goals & Missions - Minimalist Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-12 border-t border-gray-100">
                                    <div className="space-y-4">
                                        <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-900">Our Mission</h3>
                                        <p className="text-sm leading-relaxed text-gray-500 font-light">
                                            To empower individuals to feel confident and beautiful through safe, effective, and personalized aesthetic treatments that enhance their natural beauty.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-900">Our Vision</h3>
                                        <p className="text-sm leading-relaxed text-gray-500 font-light">
                                            To be the leading provider of non-surgical aesthetic treatments, setting the standard for safety, quality, and client satisfaction in the Philippines.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-8 pt-8">
                                    {['FDA-APPROVED', 'LICENSED PROFESSIONALS', 'PERSONALIZED CARE'].map((label) => (
                                        <div key={label} className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-tan"></div>
                                            <span className="text-[10px] tracking-[0.2em] font-bold text-gray-900 uppercase">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values & Vision (Editorial Layout) */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-4 max-w-6xl">
                        {/* Large Featured Image */}
                        <div className="relative aspect-[21/9] w-full overflow-hidden mb-24 rounded-sm shadow-sm">
                            <Image
                                src="https://res.cloudinary.com/dbviya1rj/image/upload/v1766188665/k455iex0ft2a6bxoabsl.png"
                                alt="Skin Essentials Team"
                                fill
                                className="object-cover grayscale-[0.2] contrast-[1.1]"
                            />
                        </div>

                        {/* Quote and Sub-image Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
                            {/* Left: Quote */}
                            <div className="relative py-12 px-2 md:px-12">
                                <span className="absolute top-0 left-0 text-7xl text-gray-100 font-serif leading-none select-none">“</span>
                                <blockquote className="text-3xl md:text-[42px] font-serif italic text-gray-900 leading-[1.2] mb-10 relative z-10">
                                    Our work does make sense only if it is a faithful witness of his time.
                                </blockquote>
                                <div className="flex flex-col space-y-1 relative z-10">
                                    <cite className="text-sm font-bold text-gray-900 not-italic uppercase tracking-wider">JC Hers</cite>
                                    <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-bold">Medical Director, Founder</span>
                                </div>
                                <span className="absolute bottom-0 right-0 md:right-12 text-7xl text-gray-100 font-serif leading-none select-none rotate-180">“</span>
                            </div>

                            {/* Right: Detailed Work Image */}
                            <div className="relative aspect-[4/3] overflow-hidden rounded-sm shadow-sm group">
                                <Image
                                    src="https://res.cloudinary.com/dbviya1rj/image/upload/v1766188559/klqudyl0mga7nnwgvquj.jpg"
                                    alt="Precision in Aesthetics"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* The Team & Stats Section (Combined Editorial Layout) */}
                <section className="py-40 px-4 bg-white overflow-hidden">
                    <div className="container mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-32 items-start">

                            {/* Left: Staggered Image Grid */}
                            {/* Left: Single Feature Image */}
                            <div className="lg:col-span-6 relative h-[600px] md:h-[800px] shadow-2xl rounded-sm overflow-hidden group bg-gray-100">
                                <Image
                                    src={teamMembers[0].image}
                                    alt={teamMembers[0].name}
                                    fill
                                    className="object-contain transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                                <div className="absolute bottom-8 left-8 text-white z-30">
                                    <p className="text-lg tracking-widest font-bold uppercase mb-2">{teamMembers[0].name}</p>
                                    <p className="text-xs tracking-[0.2em] font-medium opacity-90">{teamMembers[0].role}</p>
                                </div>
                            </div>

                            {/* Right: Content & Counters */}
                            <div className="lg:col-span-6 pt-12">
                                <div className="max-w-xl">
                                    <h2 className="text-7xl md:text-8xl font-bold tracking-tighter text-gray-900 mb-12 uppercase leading-none">
                                        THE TEAM.
                                    </h2>

                                    <div className="space-y-8 mb-20 text-gray-500 text-sm md:text-base leading-relaxed font-light">
                                        <p>
                                            Every practitioner at Skin Essentials by HER is handpicked for their expertise, medical precision, and eye for natural aesthetics. We believe that non-surgical enhancement is an art form—one that requires a deep understanding of facial anatomy and a commitment to safe, medical-grade results.
                                        </p>
                                        <p>
                                            Our team consists of board-certified professionals who undergo continuous training in the latest global techniques, ensuring that every Hiko Nose Lift, Thread Lift, and filler treatment we perform is a faithful witness to our commitment to excellence and safety.
                                        </p>
                                    </div>

                                    {/* Integrated Achievements Counter Row */}
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-16 border-t border-gray-100 pt-16">
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
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


            </div>
        </PullToRefresh>
    )
}