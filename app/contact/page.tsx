"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  Instagram,
  Facebook,
  Calendar,
  Navigation,
  Star,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { SharedHeader } from "@/components/shared-header"
import { BookingModal } from "@/components/booking-modal"

export default function ContactPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
    if (!formData.message.trim()) newErrors.message = "Message is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"
    if (!formData.service.trim()) newErrors.service = "Please select a service"
    if (!formData.date.trim()) newErrors.date = "Preferred date is required"
    if (!formData.time.trim()) newErrors.time = "Preferred time is required"
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      setIsSubmitting(false)
      return
    }
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service || 'Consultation',
          date: formData.date,
          time: formData.time,
          notes: formData.message,
          duration: 60,
          price: 0,
          sourcePlatform: 'website'
        })
      })
      if (res.ok) {
        setIsSubmitted(true)
        setFormData({ name: "", email: "", phone: "", service: "", message: "", date: "", time: "" })
        setTimeout(() => setIsSubmitted(false), 5000)
      }
    } catch {}
    setIsSubmitting(false)
  }

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6 text-[#d09d80]" />,
      title: "Phone",
      details: ["0995-260-3451", "+63 2 8123 4567"],
      action: "Call Now",
      href: "tel:+639952603451",
    },
    {
      icon: <MapPin className="w-6 h-6 text-[#d09d80]" />,
      title: "Address",
      details: ["Granda Building, Road 8 Project 6", "Quezon City, Metro Manila", "Philippines 1100"],
      action: "Get Directions",
      href: "https://maps.app.goo.gl/5KJSiPVRd49m7DbY8",
    },
    {
      icon: <Clock className="w-6 h-6 text-[#d09d80]" />,
      title: "Business Hours",
      details: ["Mon - Sat: 9:00 AM - 7:00 PM", "Sunday: 10:00 AM - 5:00 PM", "Holidays: By Appointment"],
      action: "Book Appointment",
      href: "/services",
    },
    
  ]

  const socialMedia = [
    {
      icon: <Instagram className="w-6 h-6" />,
      name: "Instagram",
      handle: "@skinessentialsbyher",
      href: "https://instagram.com/skinessentialsbyher",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      icon: <Facebook className="w-6 h-6" />,
      name: "Facebook",
      handle: "Skin Essentials by HER",
      href: "https://facebook.com/skinessentialsbyher",
      color: "bg-blue-600",
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      name: "WhatsApp",
      handle: "+63 917 123 4567",
      href: "https://wa.me/639171234567",
      color: "bg-green-500",
    },
  ]

  const services = [
    "Thread Lifts",
    "Dermal Fillers",
    "Botox",
    "Skin Rejuvenation",
    "Laser Treatments",
    "Chemical Peels",
    "Consultation",
    "Other",
  ]

  return (
    <PullToRefresh>
      <div className="min-h-screen bg-[#fffaff] dark:bg-gray-950 pb-20 md:pb-0 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#fbc6c5]/20 to-[#d09d80]/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#d09d80]/30 to-[#fbc6c5]/30 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-[#fbc6c5]/10 to-[#d09d80]/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        {/* Shared Header */}
        <SharedHeader showBackButton={true} backHref="/" />

        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 relative z-10">
          <div className="container mx-auto text-center">
            <Badge className="bg-brand-gradient text-white mb-6 px-6 py-2 text-sm font-semibold hover-lift">
              Contact Us
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Get in Touch with
              <span className="text-brand-gradient block">
                Our Expert Team
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Ready to start your beauty journey? Contact us today to schedule your complimentary consultation and discover the perfect treatment for your aesthetic goals.
            </p>
          </div>
        </section>

        {/* Contact Information Cards */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 justify-items-center">
              {contactInfo.map((info, index) => (
                <Card key={index} className="border-[#fbc6c5]/20 hover:shadow-lg transition-all duration-300 group dark:bg-gray-900/60 dark:border-gray-800">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#fbc6c5]/20 to-[#d09d80]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      {info.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{info.title}</h3>
                    <div className="space-y-1 mb-4">
                      {info.details.map((detail, detailIndex) => (
                        <p key={detailIndex} className="text-gray-600 dark:text-gray-300 text-sm">{detail}</p>
                      ))}
                    </div>
                    <Link href={info.href}>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white text-xs font-semibold"
                      >
                        {info.action}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form and Map Section */}
        <section className="py-16 px-4 bg-white/50">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="border-[#fbc6c5]/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Send className="w-6 h-6 text-[#d09d80] mr-3" />
                    Send us a Message
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8" role="status" aria-live="polite">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Message Sent Successfully!</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Thank you for contacting us. We'll get back to you within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Name *
                          </label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            aria-invalid={!!errors.name}
                            aria-describedby="name-error"
                            className="border-[#fbc6c5]/30 focus:border-[#d09d80]"
                          />
                          {errors.name && (
                            <p id="name-error" className="mt-1 text-sm text-red-600">{errors.name}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address *
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            aria-invalid={!!errors.email}
                            aria-describedby="email-error"
                            className="border-[#fbc6c5]/30 focus:border-[#d09d80]"
                          />
                          {errors.email && (
                            <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number
                          </label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+63 917 123 4567"
                            className="border-[#fbc6c5]/30 focus:border-[#d09d80]"
                          />
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Service of Interest
                          </label>
                          <select
                            id="service"
                            name="service"
                            value={formData.service}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-[#fbc6c5]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d09d80] focus:border-[#d09d80]"
                          >
                            <option value="">Select a service</option>
                            {services.map((service) => (
                              <option key={service} value={service}>
                                {service}
                              </option>
                            ))}
                          </select>
                          {errors.service && (
                            <p className="mt-1 text-sm text-red-600">{errors.service}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Preferred Date *
                          </label>
                          <Input
                            id="date"
                            name="date"
                            type="date"
                            required
                            value={formData.date}
                            onChange={handleInputChange}
                            className="border-[#fbc6c5]/30 focus:border-[#d09d80]"
                          />
                          {errors.date && (
                            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Preferred Time *
                          </label>
                          <Input
                            id="time"
                            name="time"
                            type="time"
                            required
                            value={formData.time}
                            onChange={handleInputChange}
                            className="border-[#fbc6c5]/30 focus:border-[#d09d80]"
                          />
                          {errors.time && (
                            <p className="mt-1 text-sm text-red-600">{errors.time}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Message *
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Tell us about your aesthetic goals or any questions you have..."
                          rows={5}
                          aria-invalid={!!errors.message}
                          aria-describedby="message-error"
                          className="border-[#fbc6c5]/30 focus:border-[#d09d80]"
                        />
                        {errors.message && (
                          <p id="message-error" className="mt-1 text-sm text-red-600">{errors.message}</p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        variant="brand"
                        size="lg"
                        className="w-full py-3 text-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Sending Message...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-3" />
                            Send Message 
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Map and Additional Info */}
              <div className="space-y-6">
                {/* Map Placeholder */}
                <Card className="border-[#fbc6c5]/20 shadow-lg dark:bg-gray-900/60 dark:border-gray-800">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-[#fbc6c5]/20 to-[#d09d80]/20 h-64 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-[#d09d80] mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Clinic</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">Granda Building Road 8 Project 6<br />Quezon City, Metro Manila</p>

                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Social Media */}
                <Card className="border-[#fbc6c5]/20 shadow-lg dark:bg-gray-900/60 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Follow Us</CardTitle>
                    <p className="text-gray-600 dark:text-gray-300">Stay updated with our latest treatments and results</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {socialMedia.map((social, index) => (
                        <Link key={index} href={social.href} target="_blank" rel="noopener noreferrer">
                          <div className="flex items-center p-4 rounded-xl border border-[#fbc6c5]/20 hover:shadow-md transition-all duration-300 group">
                            <div className={`w-12 h-12 ${social.color} rounded-xl flex items-center justify-center text-white mr-4 group-hover:scale-110 transition-transform duration-300`}>
                              {social.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{social.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{social.handle}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-[#fbc6c5]/20 shadow-lg dark:bg-gray-900/60 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        onClick={() => setIsBookingOpen(true)}
                        variant="brand"
                        className="w-full justify-start"
                      >
                        <Calendar className="w-4 h-4 mr-3" />
                        Book Appointment
                      </Button>
                      <Link href="/portfolio">
                        <Button variant="brand-outline" className="w-full justify-start">
                          <Star className="w-4 h-4 mr-3" />
                          View Portfolio
                        </Button>
                      </Link>
                      <Link href="tel:+639171234567">
                        <Button variant="brand-outline" className="w-full justify-start">
                          <Phone className="w-4 h-4 mr-3" />
                          Call Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-red-800 mb-4">Emergency Contact</h3>
                <p className="text-red-700 mb-6">
                  If you're experiencing any complications or urgent concerns related to your treatment, please contact us immediately.
                </p>
                <Link href="tel:+639952603451">
                  <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold">
                    <Phone className="w-5 h-5 mr-3" />
                    Emergency Hotline: 0995-260-3451
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Booking Modal */}
        <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </PullToRefresh>
  )
}