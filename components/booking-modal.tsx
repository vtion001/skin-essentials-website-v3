"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { serviceCategories } from "@/lib/services-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, CheckCircle, Sparkles, ArrowRight, ArrowLeft, Search } from "lucide-react"
import { appointmentService, influencerService, type Influencer } from "@/lib/admin-services"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  defaultServiceId?: string
}

export function BookingModal({ isOpen, onClose, defaultServiceId }: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(() => (isOpen && defaultServiceId ? 2 : 1))
  const [selectedService, setSelectedService] = useState(defaultServiceId ?? "")
  const [serviceQuery, setServiceQuery] = useState("")
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", date: "", time: "", message: "" })
  const contentRef = useRef<HTMLDivElement>(null)
  const [sourcePlatform, setSourcePlatform] = useState<string>("")
  const [useInfluencer, setUseInfluencer] = useState<boolean>(false)
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string>("")
  const [referralCode, setReferralCode] = useState<string>("")

  useEffect(() => {
    if (isOpen) {
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [isOpen])

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }, [step])

  const [influencers, setInfluencers] = useState<Influencer[]>(() => {
    try { return influencerService.getAllInfluencers() } catch { return [] }
  })

  const toId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
  const services = useMemo(
    () => [
      { id: "consultation", name: "Free Consultation", price: "Free", duration: "30 mins", description: "Personalized assessment and treatment planning", popular: true },
      ...serviceCategories.flatMap((cat) => cat.services.map((s) => ({ id: toId(s.name), name: s.name, price: s.price, duration: s.duration ?? "", description: s.description, popular: false }))),
    ],
    [serviceCategories]
  )

  const filteredServices = useMemo(() => services.filter((s) => s.name.toLowerCase().includes(serviceQuery.toLowerCase())), [services, serviceQuery])

  const handleClose = () => {
    setStep(1)
    setSelectedService("")
    setServiceQuery("")
    setFormData({ name: "", email: "", phone: "", date: "", time: "", message: "" })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) handleClose() }} modal={false}>
      <DialogContent
        ref={contentRef}
        className="!w-[92vw] sm:!max-w-5xl !max-h-[85vh] sm:!max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl !p-0 !rounded-[2rem] sm:!rounded-3xl"
      >
        <div className="flex flex-col">
          {/* Editorial Header Section */}
          <div className="p-5 sm:p-8 pb-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 sm:mb-8 border-b border-gray-100 pb-6 sm:pb-8">
              <div className="space-y-4">
                <span className="text-[10px] tracking-[0.3em] font-bold text-[#d09d80] uppercase block">
                  {step === 1 ? "Service Selection" : step === 2 ? "Appointment Details" : "Success"}
                </span>
                <DialogHeader className="p-0 space-y-0">
                  <DialogTitle className="font-serif text-[clamp(1.25rem,6vw,3rem)] tracking-[0.02em] text-gray-900 uppercase leading-[1.1] text-left">
                    {step === 1 ? "Choose Your Service" : step === 2 ? "Your Information" : "Booking Confirmed"}
                  </DialogTitle>
                </DialogHeader>
              </div>

              {step === 2 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="text-[11px] font-bold tracking-[0.2em] text-gray-900 border border-gray-200 uppercase px-8 py-3 rounded-full hover:bg-gray-50 transition-all font-sans"
                  >
                    Change Service
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-5 sm:px-8 pb-8 sm:pb-12">
            {step === 1 && (
              <div className="space-y-12">
                {/* Search & Filter Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                  <div className="space-y-4">
                    <p className="text-[11px] tracking-[0.2em] font-bold text-gray-900 uppercase">Treatment Search.</p>
                    <div className="relative group">
                      <Search className="w-5 h-5 text-gray-400 absolute left-0 top-1/2 -translate-y-1/2 group-focus-within:text-[#d09d80] transition-colors" />
                      <input
                        value={serviceQuery}
                        onChange={(e) => setServiceQuery(e.target.value)}
                        placeholder="Search treatments..."
                        className="w-full bg-transparent border-b border-gray-200 py-3 pl-8 text-base sm:text-xl font-light focus:outline-none focus:border-[#d09d80] transition-all placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    {serviceQuery && (
                      <button
                        onClick={() => setServiceQuery("")}
                        className="text-[10px] tracking-widest font-bold text-gray-400 uppercase hover:text-gray-900 transition-colors"
                      >
                        Clear Search &times;
                      </button>
                    )}
                  </div>
                </div>

                {/* Service Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-10 sm:pt-12 border-t border-gray-100">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className={`group cursor-pointer p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border transition-all duration-300 ${selectedService === service.id
                        ? "border-[#d09d80] bg-[#fdf9f7]"
                        : "border-gray-100 bg-white hover:border-[#d09d80]/30 hover:shadow-xl hover:shadow-[#fbc6c5]/10"
                        }`}
                      onClick={() => { setSelectedService(service.id); setStep(2) }}
                    >
                      <div className="space-y-6">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-serif text-xl text-gray-900 group-hover:text-[#d09d80] transition-colors leading-tight">
                            {service.name}
                          </h3>
                          <div className="flex gap-2 shrink-0">
                            {service.popular && (
                              <span className="text-[8px] font-bold tracking-widest uppercase bg-green-500/10 text-green-600 px-2 py-1 rounded">Popular</span>
                            )}
                            {service.price === "Free" && (
                              <span className="text-[8px] font-bold tracking-widest uppercase bg-blue-500/10 text-blue-600 px-2 py-1 rounded">Free</span>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 font-light leading-relaxed line-clamp-2 italic-serif">
                          {service.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                          <div className="flex flex-col">
                            <span className="text-[10px] tracking-widest text-gray-400 uppercase font-bold">Investment</span>
                            <span className="text-sm font-bold text-gray-900">{service.price}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] tracking-widest text-gray-400 uppercase font-bold">Time</span>
                            <span className="text-sm text-gray-500 flex items-center font-light">
                              <Clock className="w-3 h-3 mr-1" /> {service.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 text-center">
                  <p className="text-[10px] tracking-[0.2em] font-medium text-gray-400 uppercase">
                    Select a service above to continue your booking journey.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 sm:space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
                  {/* Left Column: Form Section */}
                  <div className="lg:col-span-8 space-y-8 sm:space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="relative group">
                        <label htmlFor="name" className="text-[10px] tracking-widest font-bold text-gray-400 uppercase block mb-1">Full Name</label>
                        <input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-transparent border-b border-gray-200 py-3 text-base sm:text-lg font-light focus:outline-none focus:border-[#d09d80] transition-all placeholder:text-gray-300"
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="relative group">
                        <label htmlFor="phone" className="text-[10px] tracking-widest font-bold text-gray-400 uppercase block mb-1">Phone Number</label>
                        <input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-transparent border-b border-gray-200 py-3 text-base sm:text-lg font-light focus:outline-none focus:border-[#d09d80] transition-all placeholder:text-gray-300"
                          placeholder="+63"
                        />
                      </div>
                      <div className="relative group">
                        <label htmlFor="email" className="text-[10px] tracking-widest font-bold text-gray-400 uppercase block mb-1">Email Address</label>
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-transparent border-b border-gray-200 py-3 text-base sm:text-lg font-light focus:outline-none focus:border-[#d09d80] transition-all placeholder:text-gray-300"
                          placeholder="hello@example.com"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="date" className="text-[10px] tracking-widest font-bold text-gray-400 uppercase block mb-1">Date</label>
                          <input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full bg-transparent border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-[#d09d80] transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="time" className="text-[10px] tracking-widest font-bold text-gray-400 uppercase block mb-1">Time</label>
                          <input
                            id="time"
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="w-full bg-transparent border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-[#d09d80] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="text-[10px] tracking-widest font-bold text-gray-400 uppercase block mb-3">Discovery Platform</label>
                          <Select value={sourcePlatform} onValueChange={setSourcePlatform}>
                            <SelectTrigger className="h-10 rounded-xl border-gray-200">
                              <SelectValue placeholder="How did you hear about us?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="website">Website</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end pb-2">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={useInfluencer}
                              onChange={(e) => setUseInfluencer(e.target.checked)}
                              className="w-5 h-5 rounded border-gray-300 text-[#d09d80] focus:ring-[#d09d80]"
                            />
                            <span className="text-[11px] font-bold tracking-widest text-gray-900 group-hover:text-[#d09d80] transition-colors">INFLUENCER REFERRAL?</span>
                          </label>
                        </div>
                      </div>

                      {useInfluencer && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div>
                            <label className="text-[10px] tracking-widest font-bold text-gray-400 uppercase block mb-3">Influencer Name</label>
                            <Select value={selectedInfluencerId} onValueChange={setSelectedInfluencerId}>
                              <SelectTrigger className="h-10 rounded-xl border-gray-200">
                                <SelectValue placeholder="Select influencer" />
                              </SelectTrigger>
                              <SelectContent>
                                {influencers.map((inf) => (
                                  <SelectItem key={inf.id} value={inf.id}>{inf.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="relative group">
                            <label htmlFor="referralCode" className="text-[10px] tracking-widest font-bold text-gray-400 uppercase block mb-1">Promo Code</label>
                            <input
                              id="referralCode"
                              value={referralCode}
                              onChange={(e) => setReferralCode(e.target.value)}
                              className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-light focus:outline-none focus:border-[#d09d80] transition-all placeholder:text-gray-300"
                              placeholder="Enter code"
                            />
                          </div>
                        </div>
                      )}

                      <div className="relative group">
                        <label htmlFor="message" className="text-[10px] tracking-widest font-bold text-gray-400 uppercase block mb-1">Additional Notes</label>
                        <textarea
                          id="message"
                          rows={3}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full bg-transparent border-b border-gray-200 py-4 text-lg font-light focus:outline-none focus:border-[#d09d80] transition-all placeholder:text-gray-300 resize-none"
                          placeholder="Aesthetic goals or medical considerations..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Case Summary (Sidebar style) */}
                  <div className="lg:col-span-4 space-y-6 sm:space-y-8 bg-[#fdf9f7] rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 h-fit">
                    <div className="space-y-2">
                      <p className="text-[11px] tracking-[0.2em] font-bold text-gray-900 uppercase">Selected Treatment.</p>
                      <p className="text-[14px] leading-relaxed text-gray-500 font-light italic-serif">
                        {services.find(s => s.id === selectedService)?.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-[#d09d80]/20">
                      <div className="flex items-center justify-between text-[11px] tracking-widest uppercase font-bold text-gray-900">
                        <span>Base Cost</span>
                        <span className="text-[#d09d80]">{services.find(s => s.id === selectedService)?.price}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] tracking-widest uppercase font-bold text-gray-900">
                        <span>Est. Duration</span>
                        <span className="text-gray-400 font-medium">{services.find(s => s.id === selectedService)?.duration}</span>
                      </div>
                    </div>

                    <div className="pt-8">
                      <button
                        onClick={async () => {
                          const svc = services.find((s) => s.id === selectedService)
                          const priceStr = svc?.price ?? "0"
                          const price = /free/i.test(priceStr) ? 0 : parseFloat((priceStr.match(/[\d,.]+/g)?.[0] || "0").replace(/,/g, ""))
                          const durationStr = svc?.duration ?? "60"
                          const duration = parseInt((durationStr.match(/\d+/)?.[0] || "60"))
                          let finalPrice = price
                          let discountApplied = false
                          if (useInfluencer && selectedInfluencerId && referralCode) {
                            const inf = influencers.find(i => i.id === selectedInfluencerId)
                            if (inf && String(inf.referralCode || '').trim().toLowerCase() === referralCode.trim().toLowerCase()) {
                              finalPrice = Math.round((price * 0.9) * 100) / 100
                              discountApplied = true
                            }
                          }
                          try {
                            const res = await fetch('/api/bookings', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: formData.name, email: formData.email, phone: formData.phone,
                                service: svc?.name || selectedService, date: formData.date, time: formData.time,
                                notes: formData.message, duration, price: finalPrice, sourcePlatform,
                                influencerId: selectedInfluencerId || undefined,
                                influencerName: (influencers.find(i => i.id === selectedInfluencerId)?.name) || undefined,
                                referralCode: referralCode || undefined, discountApplied,
                              })
                            })
                            if (res.ok) setStep(3)
                          } catch { }
                        }}
                        disabled={!formData.name || !formData.phone || !formData.date || !formData.time || !selectedService || !sourcePlatform}
                        className="w-full text-[11px] font-bold tracking-[0.2em] text-white bg-gray-900 uppercase px-8 py-4 rounded-full hover:bg-gray-800 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirm Booking
                      </button>
                      <p className="mt-4 text-[9px] text-center text-gray-400 uppercase tracking-widest">
                        Individual results may vary.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="py-20 text-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-[#d09d80]/10 rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-[#d09d80]" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-serif text-3xl text-gray-900">Appointment Request Sent.</h3>
                  <p className="text-gray-500 font-light max-w-md mx-auto italic-serif">
                    Thank you, <span className="text-gray-900 font-medium">{formData.name}</span>. Our specialist team will call you at <span className="text-gray-900 font-medium">{formData.phone}</span> shortly to finalize your transformation session.
                  </p>
                </div>
                <div className="flex gap-4 justify-center pt-8">
                  <button
                    onClick={() => { setStep(1); setFormData({ name: "", email: "", phone: "", date: "", time: "", message: "" }) }}
                    className="text-[11px] font-bold tracking-[0.2em] text-gray-900 border border-gray-900 uppercase px-12 py-4 rounded-full hover:bg-gray-900 hover:text-white transition-all transform hover:scale-[1.02]"
                  >
                    Book Another
                  </button>
                  <button
                    onClick={handleClose}
                    className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase px-8 py-4 hover:text-gray-900 transition-all"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Clause */}
          <div className="px-5 sm:px-8 pb-8 sm:pb-12 border-t border-gray-100 mt-8 sm:mt-12 pt-8 sm:pt-12">
            <p className="text-center text-gray-400 text-[10px] tracking-[0.2em] font-medium uppercase leading-relaxed max-w-2xl mx-auto">
              By requesting an appointment, you agree to our terms of service and clinical protocols. Consult with our specialists for a personalized assessment based on your unique profile.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
