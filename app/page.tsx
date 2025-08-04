"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, MapPin, Clock, Star, Shield, Award, Users, Calendar, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { SharedHeader } from "@/components/shared-header"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const featuredServices = [
    {
      name: "Nose Thread Lift (Hiko)",
      price: "₱9,999",
      description: "Instantly lifts and defines the nose bridge and tip using dissolvable PDO/PCL threads.",
      duration: "~1 hour",
      results: "1-2 years",
      gradient: "from-[#fbc6c5] to-[#d09d80]",
    },
    {
      name: "Face Thread Lift",
      price: "₱1,000/thread",
      description: "Lifts and tightens sagging skin for a rejuvenated, V-shaped contour.",
      duration: "1-1.5 hours",
      badge: "PROMO",
      gradient: "from-[#d09d80] to-[#fbc6c5]",
    },
    {
      name: "Vampire Facial",
      price: "₱3,500",
      description: "PRP + Microneedling for powerful anti-aging skin regeneration.",
      duration: "~1 hour",
      sessions: "3-4 sessions",
      gradient: "from-[#fbc6c5]/80 to-[#d09d80]/80",
    },
    {
      name: "Diode Laser Hair Removal",
      price: "From ₱1,000",
      description: "Permanently reduces unwanted hair with comfortable diode laser technology.",
      duration: "Varies",
      sessions: "6-8 sessions",
      gradient: "from-[#d09d80]/70 to-[#fbc6c5]/70",
    },
  ]

  return (
    <PullToRefresh>
      <div className="min-h-screen bg-[#fffaff] pb-20 md:pb-0 relative overflow-hidden">
        {/* Glassmorphism Header */}
        <SharedHeader variant="transparent" />

        {/* Hero Section - Full Width Video Background */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 w-full h-full">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              poster="/placeholder.svg?height=1080&width=1920&text=Hiko+Nose+Lift+Demo"
            >
              <source src="https://res.cloudinary.com/dbviya1rj/video/upload/v1753675140/Hiko_Nose_Lift_Video_Ready_xgf2il.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Enhanced Overlay for Better Text Visibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
          </div>

          {/* Video Badge */}
          <div className="absolute top-24 right-6 z-20 md:top-32 md:right-12">
            <Badge className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur-sm">
              Hiko Nose Lift Demo
            </Badge>
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 container mx-auto px-4 py-32">
            <div className="max-w-4xl">
              {/* Floating Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-8 animate-fadeInUp">
                <Sparkles className="w-4 h-4 text-white mr-2" />
                <span className="text-sm font-medium text-white">Trusted by 10,000+ clients</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                <span className="text-white drop-shadow-2xl">Transform Your Beauty</span>
                <br />
                <span className="bg-gradient-to-r from-[#fbc6c5] via-[#d09d80] to-[#fbc6c5] bg-clip-text text-transparent drop-shadow-2xl">
                  Naturally & Safely
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white/95 mb-12 leading-relaxed max-w-3xl drop-shadow-lg">
                Experience world-class non-surgical beauty enhancements with our team of licensed professionals using{" "}
                <span className="font-bold text-[#fbc6c5] drop-shadow-md">FDA-approved materials</span> and cutting-edge
                techniques.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 mb-16">
                <Button
                  size="lg"
                  onClick={() => setIsBookingOpen(true)}
                  className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 rounded-2xl px-8 py-4 text-lg font-semibold group border-2 border-white/20"
                >
                  <Calendar className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  Book Free Consultation
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
                <Link href="/portfolio">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/80 text-white hover:bg-white hover:text-[#d09d80] backdrop-blur-sm rounded-2xl px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300 bg-white/10 hover:bg-white shadow-lg"
                  >
                    View Our Portfolio
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators - Enhanced for Video Background */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Shield,
                    title: "FDA-Approved Materials",
                    description: "Only premium, medical-grade products",
                    color: "from-[#fbc6c5] to-[#d09d80]",
                  },
                  {
                    icon: Award,
                    title: "Licensed Professionals",
                    description: "Expert medical team you can trust",
                    color: "from-[#d09d80] to-[#fbc6c5]",
                  },
                  {
                    icon: Users,
                    title: "Personalized Care",
                    description: "Tailored treatments for your goals",
                    color: "from-[#fbc6c5]/80 to-[#d09d80]/80",
                  },
                ].map((item, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="bg-white/15 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 hover:bg-white/25">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:rotate-6 transition-transform duration-300 shadow-lg`}
                      >
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-white mb-2 text-lg drop-shadow-md">{item.title}</h3>
                      <p className="text-white/90 leading-relaxed text-sm drop-shadow-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-1/4 right-12 w-16 h-16 bg-gradient-to-br from-[#fbc6c5]/30 to-[#d09d80]/30 rounded-full blur-xl animate-pulse hidden lg:block"></div>
          <div className="absolute bottom-1/4 left-12 w-20 h-20 bg-gradient-to-br from-[#d09d80]/20 to-[#fbc6c5]/20 rounded-full blur-2xl animate-bounce hidden lg:block"></div>
        </section>

        {/* Featured Services - Redesigned */}
        <section id="services" className="py-20 relative bg-[#fffaff]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#fbc6c5]/20 to-[#d09d80]/20 backdrop-blur-sm rounded-full border border-[#fbc6c5]/30 mb-6">
                <Star className="w-4 h-4 text-[#d09d80] mr-2" />
                <span className="text-sm font-medium text-gray-700">Most Popular Treatments</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Featured Services
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover our signature treatments designed to enhance your natural beauty with stunning results
              </p>
            </div>

            {/* Mobile: Horizontal Scroll, Desktop: Grid */}
            <div className="md:hidden">
              <div className="flex space-x-6 overflow-x-auto pb-6 px-4 -mx-4 scrollbar-hide">
                {featuredServices.map((service, index) => (
                  <Card
                    key={index}
                    className="flex-shrink-0 w-80 bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden group"
                  >
                    <div className={`h-2 bg-gradient-to-r ${service.gradient}`}></div>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <CardTitle className="text-lg font-bold text-gray-800 leading-tight">{service.name}</CardTitle>
                        {service.badge && (
                          <Badge className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white text-xs px-3 py-1 rounded-full">
                            {service.badge}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-2xl font-bold bg-gradient-to-r from-[#d09d80] to-[#fbc6c5] bg-clip-text text-transparent">
                        {service.price}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-[#d09d80]" />
                          {service.duration}
                        </div>
                        {service.results && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-2 text-[#d09d80]" />
                            Results: {service.results}
                          </div>
                        )}
                        {service.sessions && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-2 text-[#d09d80]" />
                            {service.sessions}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredServices.map((service, index) => (
                <Card
                  key={index}
                  className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden group hover:scale-105"
                >
                  <div className={`h-2 bg-gradient-to-r ${service.gradient}`}></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <CardTitle className="text-lg font-bold text-gray-800">{service.name}</CardTitle>
                      {service.badge && (
                        <Badge className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white">
                          {service.badge}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-2xl font-bold bg-gradient-to-r from-[#d09d80] to-[#fbc6c5] bg-clip-text text-transparent">
                      {service.price}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-[#d09d80]" />
                        {service.duration}
                      </div>
                      {service.results && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-2 text-[#d09d80]" />
                          Results: {service.results}
                        </div>
                      )}
                      {service.sessions && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-2 text-[#d09d80]" />
                          {service.sessions}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/services">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#fbc6c5] text-[#d09d80] hover:bg-gradient-to-r hover:from-[#fbc6c5]/10 hover:to-[#d09d80]/10 backdrop-blur-sm rounded-2xl px-8 py-3 font-semibold transform hover:scale-105 transition-all duration-300 bg-transparent"
                >
                  View All 28 Services
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* About Section - Enhanced */}
        <section
          id="about"
          className="py-20 bg-gradient-to-br from-[#fbc6c5]/10 via-[#fffaff] to-[#d09d80]/10 relative"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#fbc6c5]/20 to-[#d09d80]/20 backdrop-blur-sm rounded-full border border-[#fbc6c5]/30 mb-6">
                  <Award className="w-4 h-4 text-[#d09d80] mr-2" />
                  <span className="text-sm font-medium text-gray-700">Why Choose Us</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                  Your Beauty Journey
                  <br />
                  <span className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] bg-clip-text text-transparent">
                    Starts Here
                  </span>
                </h2>
                <div className="space-y-8">
                  {[
                    {
                      icon: Shield,
                      title: "Safety First",
                      description:
                        "All procedures performed by licensed medical professionals in sterile environments using FDA-approved materials and strict hygiene protocols.",
                      color: "from-[#fbc6c5] to-[#d09d80]",
                    },
                    {
                      icon: Award,
                      title: "Expert Team",
                      description:
                        "Our licensed professionals have extensive experience in non-surgical beauty enhancements and medical-grade treatments.",
                      color: "from-[#d09d80] to-[#fbc6c5]",
                    },
                    {
                      icon: Star,
                      title: "Premium Quality",
                      description:
                        "We exclusively use high-quality, medical-grade materials and products approved by the FDA for optimal safety and results.",
                      color: "from-[#fbc6c5]/80 to-[#d09d80]/80",
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 group">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative order-1 lg:order-2">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500">
                  <Image
                    src="https://res.cloudinary.com/dbviya1rj/image/upload/v1754329770/820be4e7-a6c7-46d4-b522-c9dc3e39f194.png?height=600&width=500"
                    alt="Modern medical spa interior"
                    width={500}
                    height={600}
                    className="w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#fbc6c5]/20 to-transparent"></div>
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-[#fbc6c5] to-[#d09d80] rounded-full flex items-center justify-center shadow-xl animate-bounce">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-[#d09d80]/20 to-[#fbc6c5]/20 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section - Enhanced */}
        <section id="contact" className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#fbc6c5]/20 to-[#d09d80]/20 backdrop-blur-sm rounded-full border border-[#fbc6c5]/30 mb-6">
                <Phone className="w-4 h-4 text-[#d09d80] mr-2" />
                <span className="text-sm font-medium text-gray-700">Get In Touch</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Book your consultation today and take the first step towards your beauty transformation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
              {[
                {
                  icon: Phone,
                  title: "Call or Message",
                  subtitle: "Viber and WhatsApp available",
                  content: "0995-260-3451",
                  color: "from-[#fbc6c5] to-[#d09d80]",
                },
                {
                  icon: MapPin,
                  title: "Visit Our Clinic",
                  subtitle: "Modern, comfortable facility",
                  content: "Granda Building, Road 8\nProject 6, Quezon City",
                  color: "from-[#d09d80] to-[#fbc6c5]",
                },
                {
                  icon: Clock,
                  title: "Business Hours",
                  subtitle: "7 days a week",
                  content: "Monday – Sunday\n10:00 AM – 6:00 PM",
                  color: "from-[#fbc6c5]/80 to-[#d09d80]/80",
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="text-center bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden group hover:scale-105"
                >
                  <CardHeader className="pb-4">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform duration-300`}
                    >
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">{item.title}</CardTitle>
                    <p className="text-sm text-gray-500">{item.subtitle}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-lg text-gray-800 whitespace-pre-line">{item.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                size="lg"
                onClick={() => setIsBookingOpen(true)}
                className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 rounded-2xl px-12 py-4 text-lg font-semibold group"
              >
                <Calendar className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                Book Your Consultation Now
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer - Enhanced */}
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#fbc6c5]/5 to-[#d09d80]/5"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="flex items-center space-x-3 mb-6">
                  <Image
                    src="/images/skinessentials-logo.png"
                    alt="Skin Essentials by HER"
                    width={120}
                    height={60}
                    className="h-10 w-auto object-contain brightness-0 invert"
                  />
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Your trusted partner for non-surgical beauty enhancements and medical-grade skin solutions.
                </p>
                <div className="flex space-x-4">{/* Social Media Icons would go here */}</div>
              </div>

              <div>
                <h3 className="font-bold mb-6 text-lg">Contact Info</h3>
                <div className="space-y-3 text-gray-300">
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-[#fbc6c5]" />
                    0995-260-3451
                  </p>
                  <p className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-[#fbc6c5]" />
                    Granda Building, Road 8<br />
                    Project 6, Quezon City
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-6 text-lg">Popular Services</h3>
                <div className="space-y-3 text-gray-300">
                  <p>Thread Lifts</p>
                  <p>Dermal Fillers</p>
                  <p>Laser Treatments</p>
                  <p>Skin Boosters</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-6 text-lg">Payment Methods</h3>
                <div className="space-y-3 text-gray-300">
                  <p>GCash</p>
                  <p>Bank Transfers</p>
                  <p>Cash Payments</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} Skin Essentials by HER. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </PullToRefresh>
  )
}
