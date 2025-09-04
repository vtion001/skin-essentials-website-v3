"use client"

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
} from "lucide-react"
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

  const mainServices = [
    {
      name: "Thread Lifts",
      description: "Non-surgical face and nose lifting using PDO/PCL threads",
      image: "/placeholder.svg?height=300&width=400&text=Thread+Lift",
      treatments: ["Hiko Nose Lift", "Face Thread Lift", "Neck Thread Lift"],
      href: "/services#thread-lifts",
    },
    {
      name: "Dermal Fillers",
      description: "Hyaluronic acid fillers for face, lips, and body enhancement",
      image: "/placeholder.svg?height=300&width=400&text=Dermal+Fillers",
      treatments: ["Lip Fillers", "Cheek Fillers", "Butt Fillers"],
      href: "/services#dermal-fillers",
    },
    {
      name: "Laser Treatments",
      description: "Advanced laser technology for hair removal and skin rejuvenation",
      image: "/placeholder.svg?height=300&width=400&text=Laser+Treatment",
      treatments: ["Hair Removal", "Pico Laser", "Tattoo Removal"],
      href: "/services#laser-treatments",
    },
    {
      name: "Skin Rejuvenation",
      description: "Medical-grade treatments for youthful, glowing skin",
      image: "/placeholder.svg?height=300&width=400&text=Skin+Treatment",
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
      image: "/placeholder.svg?height=60&width=60&text=MS",
    },
    {
      name: "Jessica Cruz",
      treatment: "Thread Lift",
      rating: 5,
      text: "I love my new look! The face thread lift gave me the V-shape I always wanted. Highly recommend!",
      image: "/placeholder.svg?height=60&width=60&text=JC",
    },
    {
      name: "Ana Rodriguez",
      treatment: "Vampire Facial",
      rating: 5,
      text: "My skin has never looked better. The vampire facial really works! Thank you Skin Essentials!",
      image: "/placeholder.svg?height=60&width=60&text=AR",
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
      icon: Users,
      title: "10,000+ Satisfied Clients",
      description: "Join thousands of clients who have achieved their beauty goals with our expert treatments.",
    },
    {
      icon: CheckCircle,
      title: "Personalized Treatment Plans",
      description:
        "Every treatment is customized to your unique needs and aesthetic goals for natural-looking results.",
    },
  ]

  return (
    <PullToRefresh>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <SharedHeader variant="default" />

        {/* Hero Section */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#fbc6c5]/5 to-[#d09d80]/5"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white px-4 py-2">
                    Trusted by 10,000+ Clients
                  </Badge>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                    <span className="text-gray-900">Transform Your Beauty</span>
                    <br />
                    <span className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] bg-clip-text text-transparent">
                      Naturally & Safely
                    </span>
                  </h1>

                  <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                    Experience world-class non-surgical beauty enhancements with our team of licensed medical
                    professionals using FDA-approved materials.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Free Consultation
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-xl bg-transparent"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Watch Our Story
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center space-x-8 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">10,000+</div>
                    <div className="text-sm text-gray-600">Happy Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">28</div>
                    <div className="text-sm text-gray-600">Treatments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">5+</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Hero Image */}
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://res.cloudinary.com/dbviya1rj/image/upload/v1754329770/820be4e7-a6c7-46d4-b522-c9dc3e39f194.png"
                    alt="Skin Essentials Clinic Interior"
                    width={600}
                    height={700}
                    className="w-full h-[600px] object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">4.9/5</div>
                      <div className="text-sm text-gray-600">Client Rating</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">FDA Approved</div>
                      <div className="text-sm text-gray-600">Materials Only</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-[#fbc6c5]/10 text-[#d09d80] px-4 py-2 mb-4">Our Specialties</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Comprehensive Beauty Solutions</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From non-surgical face lifts to advanced laser treatments, we offer a complete range of medical-grade
                aesthetic services.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {mainServices.map((service, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-white rounded-2xl overflow-hidden"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={service.image || "/placeholder.svg"}
                      alt={service.name}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{service.name}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                    <div className="space-y-2 mb-4">
                      {service.treatments.map((treatment, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 text-[#d09d80] mr-2" />
                          {treatment}
                        </div>
                      ))}
                    </div>
                    <Link href={service.href}>
                      <Button
                        variant="outline"
                        className="w-full group-hover:bg-[#fbc6c5] group-hover:text-white group-hover:border-[#fbc6c5] transition-all duration-300 bg-transparent"
                      >
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <Badge className="bg-[#fbc6c5]/10 text-[#d09d80] px-4 py-2 mb-4">About Skin Essentials</Badge>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Your Trusted Partner in Beauty Enhancement
                  </h2>
                  <p className="text-xl text-gray-600 leading-relaxed mb-8">
                    At Skin Essentials by HER, we combine medical expertise with artistic vision to deliver
                    natural-looking results that enhance your unique beauty. Our state-of-the-art facility and
                    experienced team ensure the highest standards of safety and care.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {whyChooseUs.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/about">
                    <Button className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white px-8 py-3 rounded-xl">
                      Learn More About Us
                    </Button>
                  </Link>
                  <Link href="/portfolio">
                    <Button
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-xl bg-transparent"
                    >
                      View Our Work
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Image
                      src="/placeholder.svg?height=250&width=300&text=Clinic+1"
                      alt="Clinic Interior 1"
                      width={300}
                      height={250}
                      className="rounded-2xl shadow-lg"
                    />
                    <Image
                      src="/placeholder.svg?height=200&width=300&text=Team"
                      alt="Medical Team"
                      width={300}
                      height={200}
                      className="rounded-2xl shadow-lg"
                    />
                  </div>
                  <div className="space-y-4 pt-8">
                    <Image
                      src="/placeholder.svg?height=200&width=300&text=Clinic+2"
                      alt="Clinic Interior 2"
                      width={300}
                      height={200}
                      className="rounded-2xl shadow-lg"
                    />
                    <Image
                      src="/placeholder.svg?height=250&width=300&text=Equipment"
                      alt="Medical Equipment"
                      width={300}
                      height={250}
                      className="rounded-2xl shadow-lg"
                    />
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
              <Badge className="bg-[#fbc6c5]/10 text-[#d09d80] px-4 py-2 mb-4">Client Stories</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">What Our Clients Say</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Real stories from real clients who have transformed their confidence with our treatments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-white border-0 shadow-lg rounded-2xl p-6 relative">
                  <Quote className="w-8 h-8 text-[#fbc6c5] mb-4" />
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={60}
                      height={60}
                      className="rounded-full mr-4"
                    />
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.treatment}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Before/After Gallery Preview */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-[#fbc6c5]/10 text-[#d09d80] px-4 py-2 mb-4">Real Results</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">See the Transformation</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Browse our extensive portfolio of before and after photos showcasing natural, beautiful results.
              </p>
              <Link href="/portfolio">
                <Button className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white px-8 py-4 text-lg rounded-xl">
                  View Full Portfolio
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-gradient-to-br from-[#fbc6c5] to-[#d09d80] text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Begin Your Beauty Journey?</h2>
                <p className="text-xl mb-8 opacity-90 leading-relaxed">
                  Schedule your complimentary consultation today and discover how we can help you achieve your aesthetic
                  goals safely and naturally.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <Phone className="w-6 h-6 mr-4" />
                    <span className="text-lg">0995-260-3451</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-6 h-6 mr-4" />
                    <span className="text-lg">Granda Building, Road 8, Project 6, Quezon City</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 mr-4" />
                    <span className="text-lg">Monday - Sunday: 10:00 AM - 6:00 PM</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-[#d09d80] hover:bg-white/90 px-8 py-4 text-lg font-semibold rounded-xl"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Consultation
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-[#d09d80] bg-transparent px-8 py-4 text-lg font-semibold rounded-xl"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call Now
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold mb-6">Quick Contact Form</h3>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <select className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50">
                      <option value="">Select Treatment Interest</option>
                      <option value="thread-lift">Thread Lift</option>
                      <option value="dermal-fillers">Dermal Fillers</option>
                      <option value="laser-treatment">Laser Treatment</option>
                      <option value="skin-rejuvenation">Skin Rejuvenation</option>
                    </select>
                    <Button
                      type="submit"
                      className="w-full bg-white text-[#d09d80] hover:bg-white/90 py-3 text-lg font-semibold rounded-xl"
                    >
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <Image
                    src="/images/skinessentials-logo.png"
                    alt="Skin Essentials by HER"
                    width={120}
                    height={60}
                    className="h-10 w-auto object-contain brightness-0 invert"
                  />
                </div>
                <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                  Your trusted partner for non-surgical beauty enhancements and medical-grade skin solutions. Licensed
                  professionals, FDA-approved materials, personalized care.
                </p>
                <div className="flex space-x-4">{/* Social Media Icons */}</div>
              </div>

              <div>
                <h3 className="font-bold mb-6 text-lg">Services</h3>
                <div className="space-y-3 text-gray-300">
                  <Link href="/services#thread-lifts" className="block hover:text-white transition-colors">
                    Thread Lifts
                  </Link>
                  <Link href="/services#dermal-fillers" className="block hover:text-white transition-colors">
                    Dermal Fillers
                  </Link>
                  <Link href="/services#laser-treatments" className="block hover:text-white transition-colors">
                    Laser Treatments
                  </Link>
                  <Link href="/services#skin-treatments" className="block hover:text-white transition-colors">
                    Skin Rejuvenation
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-6 text-lg">Contact Info</h3>
                <div className="space-y-3 text-gray-300">
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-[#fbc6c5]" />
                    0995-260-3451
                  </p>
                  <p className="flex items-start">
                    <MapPin className="w-4 h-4 mr-2 text-[#fbc6c5] mt-1" />
                    Granda Building, Road 8<br />
                    Project 6, Quezon City
                  </p>
                  <p className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-[#fbc6c5]" />
                    Mon-Sun: 10AM-6PM
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} Skin Essentials by HER. All rights reserved.
              </p>
              <div className="flex space-x-6 text-gray-400">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </PullToRefresh>
  )
}
