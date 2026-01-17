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
      const response = await fetch('/api/bookings', {
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
          // Tag it as from contact page
          sourcePlatform: 'website'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || "Failed to send message"
        const { toast } = await import('sonner')
        toast.error(errorMsg)
        const { reportError } = await import('@/lib/client-logger')
        reportError(new Error(`Contact Form API Error: ${errorMsg}`), {
          context: 'contact_form_submit',
          meta: { status: response.status, data, formData }
        })
        return
      }

      const { toast } = await import('sonner')
      toast.success("Message sent! We'll contact you soon.")
      setFormData({ name: "", email: "", phone: "", service: "", message: "", date: "", time: "" })
    } catch (err) {
      const { toast } = await import('sonner')
      toast.error("Network error. Please try again.")
      const { reportError } = await import('@/lib/client-logger')
      reportError(err, {
        context: 'contact_form_network_error',
        meta: { formData }
      })
    } finally {
      setIsSubmitting(false)
    }
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
      href: "https://www.instagram.com/skin_essentials_by_hers/",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      icon: <Facebook className="w-6 h-6" />,
      name: "Facebook",
      handle: "Skin Essentials by HER",
      href: "https://www.facebook.com/SkinessentialsbyHER",
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

        <main className="container mx-auto max-w-6xl px-4 pt-40 pb-32">
          {/* Editorial Header Section */}
          <div className="mb-24 text-center md:text-left">
            <h1 className="text-7xl md:text-[120px] font-bold tracking-tight text-gray-900 leading-none">
              GET IN TOUCH<span className="text-brand-tan">.</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
            {/* Left Column: Sidebar Labels */}
            <div className="md:col-span-3 space-y-2">
              <p className="text-[14px] tracking-[0.05em] font-medium text-gray-900">Communication.</p>
              <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Our location.</p>
              <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Join us.</p>
            </div>

            {/* Right Column: Hero Content + Actions */}
            <div className="md:col-span-9 space-y-20">
              <div className="space-y-8">
                <p className="text-[15px] md:text-lg leading-[1.8] text-gray-500 font-light max-w-4xl">
                  <span className="text-gray-900 font-medium italic block mb-2 text-xl italic-serif">Start Your Transformation.</span>
                  Ready to start your beauty journey? Contact us today to schedule your complimentary consultation and discover the perfect treatment for your aesthetic goals. Our expert team is here to guide you through every step of your <span className="text-brand-tan font-semibold uppercase tracking-widest text-sm">aesthetic evolution</span>.
                </p>
              </div>

              {/* Editorial Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-gray-100">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-900 flex items-center gap-2">
                      <Phone className="w-3 h-3 text-[#d09d80]" /> Phone
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm leading-relaxed text-gray-500 font-light">0995-260-3451</p>
                      <p className="text-sm leading-relaxed text-gray-500 font-light">+63 2 8123 4567</p>
                    </div>
                  </div>
                  <Link href="tel:+639952603451" className="inline-block text-[10px] font-bold tracking-[0.2em] text-[#d09d80] uppercase border-b border-[#d09d80] pb-0.5 hover:text-gray-900 hover:border-gray-900 transition-all">
                    Call Now
                  </Link>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-[#d09d80]" /> Address
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-500 font-light">
                      Granda Building, Road 8 Project 6<br />Quezon City, Manila
                    </p>
                  </div>
                  <Link href="https://maps.app.goo.gl/5KJSiPVRd49m7DbY8" className="inline-block text-[10px] font-bold tracking-[0.2em] text-[#d09d80] uppercase border-b border-[#d09d80] pb-0.5 hover:text-gray-900 hover:border-gray-900 transition-all">
                    Directions
                  </Link>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-900 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-[#d09d80]" /> Hours
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm leading-relaxed text-gray-500 font-light">Mon-Sat: 9AM - 5PM</p>
                      <p className="text-sm leading-relaxed text-gray-500 font-light">Sun: 10AM - 5PM</p>
                    </div>
                  </div>
                  <Link href="/services" className="inline-block text-[10px] font-bold tracking-[0.2em] text-[#d09d80] uppercase border-b border-[#d09d80] pb-0.5 hover:text-gray-900 hover:border-gray-900 transition-all">
                    Book Visit
                  </Link>
                </div>
              </div>

              {/* Modern Trust Indicators */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-tan"></div>
                  <span className="text-[10px] tracking-[0.2em] font-bold text-gray-900 uppercase">FDA-APPROVED</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-tan"></div>
                  <span className="text-[10px] tracking-[0.2em] font-bold text-gray-900 uppercase">LICENSED PROFESSIONALS</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-tan"></div>
                  <span className="text-[10px] tracking-[0.2em] font-bold text-gray-900 uppercase">PERSONALIZED CARE</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Editorial Form & Information Section */}
        <section className="py-24 px-4 bg-[#fdfaf9]/30 border-t border-gray-100">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

              {/* Left Side: Editorial Contact Form */}
              <div className="lg:col-span-7 space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-serif text-gray-900 italic-serif">Contact form.</h2>
                  <p className="text-[15px] text-gray-400 font-light max-w-md">
                    Fill this out so we can learn more about you and your aesthetic needs.
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="bg-white p-12 rounded-[2rem] text-center space-y-6 shadow-sm border border-[#fbc6c5]/10">
                    <CheckCircle className="w-16 h-16 text-brand-tan mx-auto" />
                    <h3 className="text-2xl font-serif text-gray-900">Message Received.</h3>
                    <p className="text-gray-500 font-light">Thank you for reaching out. Our medical team will contact you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-8">
                      <div className="relative group">
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full bg-transparent border-b border-gray-200 py-4 text-lg font-light focus:outline-none focus:border-brand-tan transition-all placeholder:text-gray-300 peer"
                          placeholder="Name and Surname"
                        />
                        {errors.name && <p className="text-[10px] text-red-500 mt-1 uppercase tracking-widest">{errors.name}</p>}
                      </div>

                      <div className="relative group">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-transparent border-b border-gray-200 py-4 text-lg font-light focus:outline-none focus:border-brand-tan transition-all placeholder:text-gray-300"
                          placeholder="Email address"
                        />
                        {errors.email && <p className="text-[10px] text-red-500 mt-1 uppercase tracking-widest">{errors.email}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative">
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full bg-transparent border-b border-gray-200 py-4 text-lg font-light focus:outline-none focus:border-brand-tan transition-all placeholder:text-gray-300"
                            placeholder="Phone Number"
                          />
                        </div>
                        <div className="relative">
                          <select
                            id="service"
                            name="service"
                            value={formData.service}
                            onChange={handleInputChange}
                            className="w-full bg-transparent border-b border-gray-200 py-4 text-lg font-light focus:outline-none focus:border-brand-tan transition-all text-gray-400 appearance-none"
                          >
                            <option value="">Subject / Service</option>
                            {services.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="relative group">
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={4}
                          value={formData.message}
                          onChange={handleInputChange}
                          className="w-full bg-transparent border-b border-gray-200 py-4 text-lg font-light focus:outline-none focus:border-brand-tan transition-all placeholder:text-gray-300 resize-none"
                          placeholder="Tell us about your aesthetic goals..."
                        />
                        {errors.message && <p className="text-[10px] text-red-500 mt-1 uppercase tracking-widest">{errors.message}</p>}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="text-[11px] font-bold tracking-[0.2em] text-gray-900 border border-gray-900 uppercase px-12 py-4 hover:bg-gray-900 hover:text-white transition-all transform hover:scale-[1.02]"
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Right Side: Editorial Information */}
              <div className="lg:col-span-5 flex flex-col justify-center space-y-16 lg:pl-12 lg:border-l border-gray-100">
                <div className="space-y-12">
                  <div className="space-y-4 text-center lg:text-left">
                    <h2 className="text-4xl font-serif text-gray-900">Skin Essentials.</h2>
                    <div className="space-y-6 pt-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-900 uppercase">Address</p>
                        <p className="text-gray-500 font-light leading-relaxed">
                          Granda Building, Road 8 Project 6<br />Quezon City, Metro Manila<br />Philippines 1100
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-900 uppercase">Email us</p>
                        <p className="text-gray-500 font-light">ceo.jchers@gmail.com</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-900 uppercase">Call us</p>
                        <p className="text-gray-500 font-light">0995-260-3451</p>
                        <p className="text-[11px] text-gray-400 italic">Monday — Saturday: 9:00 AM to 5:00 PM</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Icons - Styled minimal */}
                  <div className="flex justify-center lg:justify-start gap-4 pt-4">
                    {socialMedia.map((social, i) => (
                      <Link
                        key={i}
                        href={social.href}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-tan hover:text-white transition-all"
                      >
                        {social.icon && <social.icon.type className="w-4 h-4" />}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Map Mini-View */}
                <div className="relative h-48 rounded-[2rem] overflow-hidden group shadow-sm border border-gray-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#fbc6c5]/10 to-[#d09d80]/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                    <MapPin className="w-8 h-8 text-brand-tan" />
                  </div>
                  <Link href="https://maps.app.goo.gl/5KJSiPVRd49m7DbY8" target="_blank" className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-white/90 to-transparent">
                    <span className="text-[10px] font-bold tracking-[0.1em] text-gray-900 uppercase border-b border-gray-900">Open in Maps &reg;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Contact - Editorial Refactor */}
        <section className="py-24 px-4 border-t border-gray-100">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 items-center">

              {/* Left Side: Status Label */}
              <div className="md:col-span-3">
                <p className="text-[11px] tracking-[0.3em] font-bold text-red-500 uppercase">Urgent notice.</p>
              </div>

              {/* Right Side: Emergency Messaging */}
              <div className="md:col-span-9 flex flex-col md:flex-row items-center justify-between gap-12 bg-red-50/30 p-12 rounded-[3rem] border border-red-100/50">
                <div className="max-w-xl text-center md:text-left space-y-4">
                  <h3 className="text-2xl md:text-3xl font-serif text-gray-900 leading-tight">
                    Experiencing complications or unusual symptoms?
                  </h3>
                  <p className="text-gray-600 font-light leading-relaxed">
                    Safety is our priority. If you experience severe pain, excessive swelling, or any unusual reactions, contact our medical team immediately.
                  </p>
                </div>

                <Link href="tel:+639952603451">
                  <button className="whitespace-nowrap bg-red-500 text-white px-10 py-5 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-red-600 transition-all transform hover:scale-[1.02] shadow-xl shadow-red-200/50 flex items-center gap-3">
                    <Phone className="w-4 h-4" /> 0995-260-3451
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Modal */}
        <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />

        {/* Mobile Bottom Navigation */}
      </div>
    </PullToRefresh>
  )
}