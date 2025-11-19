"use client"

import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Phone,
  MapPin,
  Clock,
  Star,
  Shield,
  Award,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle,
  Play,
  Quote,
  Heart,
  Facebook,
  Instagram,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { SharedHeader } from "@/components/shared-header"
import { BookingModal } from "@/components/booking-modal"

export default function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false, false])
  const heroVideoUrl = "https://res.cloudinary.com/dbviya1rj/video/upload/v1763293241/qdrmjvsqv6hspdrhzrdf.mp4"
  const [heroVideoError, setHeroVideoError] = useState(false)

  

  // Intersection Observer for card animations
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    
    mainServices.forEach((_, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleCards(prev => {
                const newVisible = [...prev]
                newVisible[index] = true
                return newVisible
              })
            }
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      )
      
      const element = document.getElementById(`service-card-${index}`)
      if (element) {
        observer.observe(element)
        observers.push(observer)
      }
    })
    
    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [])

  const mainServices = [
    {
      name: "Thread Lifts",
      description: "Non-surgical face and nose lifting using PDO/PCL threads",
      image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758859267/bbecd5de-3bea-4490-8fef-144ca997ed41.png?height=300&width=400&text=Thread+Lift",
      treatments: ["Hiko Nose Lift", "Face Thread Lift", "Neck Thread Lift"],
      href: "/hiko-nose-lift",
    },
    {
      name: "Dermal Fillers",
      description: "Hyaluronic acid fillers for face, lips, and body enhancement",
      image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758859335/f380e512-53bd-4501-81e3-685818b51001.png?height=300&width=400&text=Dermal+Fillers",
      treatments: ["Lip Fillers", "Cheek Fillers", "Butt Fillers"],
      href: "/services#dermal-fillers",
    },
    {
      name: "Laser Treatments",
      description: "Advanced laser technology for hair removal and skin rejuvenation",
      image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758859399/31549a56-c2be-4517-81e3-9b866a9a1a23.png?height=300&width=400&text=Laser+Treatment",
      treatments: ["Hair Removal", "Pico Laser", "Tattoo Removal"],
      href: "/services#laser-treatments",
    },
    {
      name: "Skin Rejuvenation",
      description: "Medical-grade treatments for youthful, glowing skin",
      image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758859466/3ae3dd78-09b7-474a-86af-6ff7df610626.png?height=300&width=400&text=Skin+Treatment",
      treatments: ["Vampire Facial", "Thermage", "Stem Cell Boosters"],
      href: "/services#skin-treatments",
    },
  ]

  const testimonials = [
    {
      name: "Maria Santos",
      treatment: "Hiko Nose Lift",
      rating: 5,
      text: "Amazing results! My nose looks so much better and the procedure was comfortable. The team is very professional.",
    },
    {
      name: "Jessica Cruz",
      treatment: "Thread Lift",
      rating: 5,
      text: "I love my new look! The face thread lift gave me the V-shape I always wanted. Highly recommend!",
    },
    {
      name: "Ana Rodriguez",
      treatment: "Vampire Facial",
      rating: 5,
      text: "My skin has never looked better. The vampire facial really works! Thank you Skin Essentials!",
    },
  ]

  const whyChooseUs = [
    {
      icon: Shield,
      title: "FDA-Approved Materials",
      description:
        "We exclusively use premium, medical-grade products approved by the FDA for your safety and optimal results.",
    },
    {
      icon: Award,
      title: "Licensed Medical Professionals",
      description:
        "Our team consists of licensed medical professionals with extensive experience in aesthetic treatments.",
    },
    {
      icon: Heart,
      title: "Personalized Care",
      description:
        "Every treatment is tailored to your unique needs and goals, ensuring natural-looking results.",
    },
    {
      icon: MapPin,
      title: "Convenient Location",
      description: "Located in the heart of Quezon City, easily accessible with ample parking.",
    },
  ]

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <SharedHeader />

        {/* Booking Modal */}
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />

        {/* Main Content */}
        <main className="pt-20">
          {/* Hero Section */}
          <section className="relative pt-24 md:pt-28 lg:pt-32 pb-20 overflow-hidden">
            <div className="absolute inset-0 z-0">
              {heroVideoUrl && !heroVideoError ? (
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                  src={heroVideoUrl}
                  onError={() => setHeroVideoError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-rose/5 to-brand-tan/5"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent"></div>
            </div>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -left-24 w-48 h-48 bg-brand-rose/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-brand-tan/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.8s'}}></div>
              <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-gradient-to-r from-brand-rose to-brand-tan rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-gradient-to-r from-brand-tan to-brand-rose rounded-full animate-bounce" style={{animationDelay: '1.1s'}}></div>
            </div>
            <div className="container mx-auto px-4 relative z-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-8rem)]">
                {/* Left Content */}
                <div className="space-y-6 lg:space-y-8 order-2 lg:order-1 bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl">
                  <div className="space-y-4 lg:space-y-6">
                    <Badge className="bg-brand-gradient text-white px-4 py-2 text-sm hover-lift">
                      Trusted by 10,000+ Clients
                    </Badge>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                      <span className="text-gray-900">Quezon City's Premier</span>
                      <br />
                      <span className="text-brand-gradient">
                        Aesthetic Clinic
                      </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                      Experience world-class non-surgical beauty enhancements at the leading aesthetic clinic near Quezon City. Our team of licensed medical professionals uses FDA-approved materials for safe, natural results.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/contact">
                      <Button
                        size="xl"
                        variant="brand"
                        className="px-8 py-4 text-lg font-semibold rounded-xl"
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        Book Free Consultation
                      </Button>
                    </Link>
                    <Link href="/hiko-nose-lift">
                      <Button
                        size="xl"
                        variant="brand-outline"
                        className="px-8 py-4 text-lg font-semibold rounded-xl"
                      >
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Hiko Nose Lift
                      </Button>
                    </Link>
                  </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center sm:justify-start space-x-6 lg:space-x-8 pt-4">
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-gray-900">10,000+</div>
                    <div className="text-xs md:text-sm text-gray-600">Happy Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-gray-900">28</div>
                    <div className="text-xs md:text-sm text-gray-600">Treatments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-gray-900">5+</div>
                    <div className="text-xs md:text-sm text-gray-600">Years Experience</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Hero Image (hidden when video is present) */}
              {!heroVideoUrl && (
              <div className="relative order-1 lg:order-2">
                <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl lg:shadow-2xl">
                  <div className="aspect-[4/5] relative">
                    <Image
                      src="https://res.cloudinary.com/dbviya1rj/image/upload/v1758858583/n5uaxwv6udqpnut6fmot.jpg"
                      alt="Skin Essentials by HER Aesthetic Clinic Interior in Quezon City - Premier Hiko Nose Thread Lift and Beauty Treatments"
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </div>

                {/* Floating Elements - Hidden on mobile, visible on larger screens */}
                <div className="hidden md:block absolute -top-4 lg:-top-6 -right-4 lg:-right-6 bg-white rounded-xl lg:rounded-2xl p-3 lg:p-4 shadow-xl z-10">
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <div className="w-10 lg:w-12 h-10 lg:h-12 bg-brand-gradient rounded-full flex items-center justify-center">
                      <Star className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm lg:text-base">4.9/5</div>
                      <div className="text-xs lg:text-sm text-gray-600">Client Rating</div>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block absolute -bottom-4 lg:-bottom-6 -left-4 lg:-left-6 bg-white rounded-xl lg:rounded-2xl p-3 lg:p-4 shadow-xl z-10">
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <Shield className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm lg:text-base">FDA Approved</div>
                      <div className="text-xs lg:text-sm text-gray-600">Materials Only</div>
                    </div>
                  </div>
                </div>
              </div>
              )}
              </div>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-700 text-sm bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
              Scroll to explore
            </div>
          </section>

        {/* Services Overview - Enhanced Design */}
        <section className="py-32 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-brand-rose/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-tl from-brand-tan/20 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-brand-rose/10 to-brand-tan/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
            
            {/* Floating Elements */}
            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-gradient-to-r from-brand-rose to-brand-tan rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-gradient-to-r from-brand-tan to-brand-rose rounded-full animate-bounce" style={{animationDelay: '0.8s'}}></div>
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-gradient-to-r from-brand-rose to-brand-tan rounded-full animate-bounce" style={{animationDelay: '1.2s'}}></div>
            <div className="absolute bottom-1/3 right-1/3 w-5 h-5 bg-gradient-to-r from-brand-tan to-brand-rose rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Enhanced Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 mb-6 transform hover:scale-105 transition-transform duration-300">
                <div className="w-2 h-2 bg-gradient-to-r from-brand-rose to-brand-tan rounded-full animate-ping"></div>
                <Badge className="bg-gradient-to-r from-brand-rose/10 to-brand-tan/10 text-white border-0 px-6 py-3 rounded-full text-sm font-medium backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                  Quezon City's Top Aesthetic Services
                </Badge>
                <div className="w-2 h-2 bg-gradient-to-r from-brand-tan to-brand-rose rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent animate-gradient-shift" style={{backgroundSize: '200% 200%'}}>
                  Comprehensive Beauty Solutions
                </span>
                <span className="block bg-gradient-to-r from-brand-rose via-brand-tan to-brand-rose bg-clip-text text-transparent mt-3 animate-gradient-shift" style={{backgroundSize: '200% 200%', animationDelay: '0.5s'}}>
                  in Quezon City
                </span>
              </h2>
              
              <div className="relative max-w-4xl mx-auto">
                <p className="text-xl text-gray-600 leading-relaxed transform hover:scale-105 transition-transform duration-300">
                  From Hiko nose thread lifts to advanced laser treatments, our Quezon City aesthetic clinic offers a complete range of medical-grade beauty services. Trusted by thousands for safe, natural results.
                </p>
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-brand-rose/20 to-brand-tan/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-r from-brand-tan/20 to-brand-rose/20 rounded-full blur-xl"></div>
              </div>
            </div>

            {/* Enhanced Service Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {mainServices.map((service, index) => (
                <div
                  key={index}
                  id={`service-card-${index}`}
                  className={`group relative transform-gpu hover:-translate-y-2 transition-all duration-700 ease-out opacity-0 translate-y-8 ${
                    visibleCards[index] ? 'opacity-100 translate-y-0' : ''
                  }`}
                  style={{
                    transitionDelay: `${index * 150}ms`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="relative h-full bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-700">
                    {/* Card Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-rose/5 via-transparent to-brand-tan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    {/* Enhanced Image Container */}
                    <div className="relative h-64 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-rose/20 to-brand-tan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <Image
                        src={service.image || "/placeholder.svg"}
                        alt={service.name}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000 ease-out"
                      />
                      
                      {/* Floating Icon */}
                      <div className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500">
                        <div className="w-6 h-6 bg-gradient-to-br from-brand-rose to-brand-tan rounded-full"></div>
                      </div>
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    </div>

                    {/* Enhanced Content */}
                    <div className="relative p-8">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-rose transition-colors duration-300">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                          {service.description}
                        </p>
                      </div>

                      {/* Enhanced Treatments List */}
                      <div className="space-y-3 mb-8">
                        {service.treatments.map((treatment, idx) => (
                          <div key={idx} className="flex items-center group/treatment">
                            <div className="w-2 h-2 bg-gradient-to-r from-brand-rose to-brand-tan rounded-full mr-3 group-hover/treatment:scale-150 transition-transform duration-300"></div>
                            <span className="text-sm text-gray-700 group-hover/treatment:text-gray-900 transition-colors duration-300">
                              {treatment}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Enhanced CTA Button */}
                      <Link href={service.href} className="block">
                        <Button
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs hover:shadow-lg hover-lift transition-optimized h-9 bg-brand-gradient hover:bg-brand-gradient-reverse text-white px-8 py-3 rounded-xl w-full"
                        >
                          Learn More
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>

                    {/* Card Edge Glow */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-brand-rose/20 via-transparent to-brand-tan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ transform: 'scale(1.02)' }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Bottom CTA */}
            <div className="text-center mt-20">
              <div className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-xl border border-white/30">
                <div className="text-left">
                  <p className="text-gray-900 font-semibold mb-1">Ready to transform your beauty?</p>
                  <p className="text-gray-600 text-sm">Book your consultation today</p>
                </div>
                <Link href="/booking">
                  <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs hover:shadow-lg hover-lift transition-optimized h-9 bg-brand-gradient hover:bg-brand-gradient-reverse text-white px-8 py-3 rounded-xl">
                    Book Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-28 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-56 h-56 bg-brand-rose/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-tan/10 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <Badge className="bg-brand-gradient text-white px-4 py-2 mb-4">Quezon City's Trusted Aesthetic Clinic</Badge>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">Quezon City's Premier Beauty Enhancement Destination</span>
                  </h2>
                  <p className="text-xl text-gray-600 leading-relaxed mb-8">
                    Located in the heart of Quezon City, Skin Essentials by HER combines medical expertise with artistic vision to deliver natural-looking results. Our state-of-the-art aesthetic clinic serves clients throughout Metro Manila with the highest standards of safety and care, specializing in Hiko nose procedures and advanced beauty treatments.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {whyChooseUs.map((item, index) => (
                    <div key={index} className="group bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/about">
                    <Button className="bg-brand-gradient hover:bg-brand-gradient-reverse text-white px-8 py-3 rounded-xl">
                      Learn More About Us
                    </Button>
                  </Link>
                  <Link href="/portfolio">
                    <Button variant="brand-outline" className="px-8 py-3 rounded-xl">
                      View Our Work
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="group relative rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src="https://res.cloudinary.com/dbviya1rj/image/upload/v1758858851/zwivugqje2ejllji1xcn.jpg?height=250&width=300&text=Clinic+1"
                        alt="Modern Aesthetic Treatment Room at Skin Essentials Quezon City Clinic"
                        width={300}
                        height={250}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="group relative rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src="https://res.cloudinary.com/dbviya1rj/image/upload/v1758858517/hk0fop3vbxemv9wqcdxl.jpg"
                        alt="Licensed Medical Team at Skin Essentials by HER Quezon City - Hiko Nose Thread Lift Specialists"
                        width={300}
                        height={200}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="group relative rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src="https://res.cloudinary.com/dbviya1rj/image/upload/v1758858850/bbqjc0cv7ha2vt2lo4vv.jpg?height=200&width=300&text=Clinic+2"
                        alt="Skin Essentials by HER Reception Area - Premier Aesthetic Clinic in Quezon City"
                        width={300}
                        height={200}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="group relative rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src="https://res.cloudinary.com/dbviya1rj/image/upload/v1758858852/tlcvgu1xfqv6mmfcivre.jpg?height=250&width=300&text=Equipment"
                        alt="FDA-Approved Medical Equipment for Hiko Nose Thread Lifts and Aesthetic Treatments in Quezon City"
                        width={300}
                        height={250}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-brand-rose/10 text-brand-tan px-4 py-2 mb-4">Client Stories</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">What Our Clients Say</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Real stories from real clients who have transformed their confidence with our treatments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-white border-0 shadow-lg rounded-2xl p-6 relative">
                  <Quote className="w-8 h-8 text-brand-rose mb-4" />
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.treatment}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-28 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-28 -left-20 w-64 h-64 bg-brand-rose/15 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -right-24 w-72 h-72 bg-brand-tan/15 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 mb-4">
                <Badge className="bg-brand-rose/10 text-brand-tan px-4 py-2">Real Results</Badge>
                <div className="w-2 h-2 bg-gradient-to-r from-brand-rose to-brand-tan rounded-full animate-ping"></div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">See the Transformation</h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Explore before-and-after results from real clients. Natural enhancements with medical-grade precision.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  before: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758858517/hk0fop3vbxemv9wqcdxl.jpg",
                  after: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758859399/31549a56-c2be-4517-81e3-9b866a9a1a23.png",
                  label: "Thread Lift"
                },
                {
                  before: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758858851/zwivugqje2ejllji1xcn.jpg",
                  after: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758859466/3ae3dd78-09b7-474a-86af-6ff7df610626.png",
                  label: "Skin Rejuvenation"
                },
                {
                  before: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758858850/bbqjc0cv7ha2vt2lo4vv.jpg",
                  after: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758859335/f380e512-53bd-4501-81e3-685818b51001.png",
                  label: "Dermal Fillers"
                }
              ].map((item, i) => (
                <div key={i} className="group relative rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm border border-white/40 shadow-xl">
                  <div className="relative">
                    <Image src={item.after} alt={`${item.label} after`} width={600} height={400} className="w-full h-64 object-cover" />
                    <Image src={item.before} alt={`${item.label} before`} width={600} height={400} className="absolute inset-0 w-full h-64 object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-900">{item.label}</span>
                      <span className="text-xs text-white/90 bg-black/40 px-2 py-1 rounded-md">Hover to compare</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/portfolio">
                <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all cursor-pointer shadow-xs hover:shadow-lg hover-lift h-11 bg-brand-gradient hover:bg-brand-gradient-reverse text-white px-8 py-4 rounded-xl">
                  View Full Portfolio
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>


        

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </main>
    </div>
  </>
  )
}
