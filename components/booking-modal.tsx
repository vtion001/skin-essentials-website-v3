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
import { appointmentService } from "@/lib/admin-services"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  defaultServiceId?: string
}

export function BookingModal({ isOpen, onClose, defaultServiceId }: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedService, setSelectedService] = useState(defaultServiceId ?? "")
  const [serviceQuery, setServiceQuery] = useState("")
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", date: "", time: "", message: "" })
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (defaultServiceId) setSelectedService(defaultServiceId)
  }, [defaultServiceId, isOpen])

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }, [step])

  const toId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
  const services = useMemo(
    () => [
      { id: "consultation", name: "Free Consultation", price: "Free", duration: "30 mins", description: "Personalized assessment and treatment planning", popular: true },
      ...serviceCategories.flatMap((cat) => cat.services.map((s) => ({ id: toId(s.name), name: s.name, price: s.price, duration: s.duration ?? "", description: s.description }))),
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
      <DialogContent ref={contentRef} className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-0 shadow-2xl">
        <div>
          <div className="bg-brand-gradient p-5 rounded-t-2xl">
            <DialogHeader className="relative">
              <DialogTitle className="text-2xl font-bold text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                {step === 1 ? "Choose Your Service" : step === 2 ? "Your Details" : "Booking Confirmed"}
              </DialogTitle>
              <Button variant="ghost" size="sm" className="absolute right-0 top-0 text-white hover:bg-white/20" onClick={handleClose}>✕</Button>
            </DialogHeader>
          </div>

          <div className="p-5">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Input value={serviceQuery} onChange={(e) => setServiceQuery(e.target.value)} placeholder="Search treatments" className="rounded-xl pl-10" />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <Button variant="outline" onClick={() => setServiceQuery("")} className="rounded-xl">Clear</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredServices.map((service) => (
                    <Card key={service.id} className={`cursor-pointer ${selectedService === service.id ? "border-brand-rose" : "border-gray-200"} bg-white rounded-xl`} onClick={() => { setSelectedService(service.id); setStep(2) }}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-bold text-gray-800">{service.name}</CardTitle>
                          <div className="flex gap-2">
                            {service.popular && <Badge className="bg-green-500 text-white">Popular</Badge>}
                            {service.price === "Free" && <Badge className="bg-blue-500 text-white">Free</Badge>}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 text-sm text-gray-600">
                        <p className="mb-3">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800">{service.price}</span>
                          <span className="flex items-center text-gray-500"><Clock className="w-4 h-4 mr-1" />{service.duration}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button onClick={() => setStep(2)} disabled={!selectedService} variant="brand" className="w-full rounded-xl">Next: Your Details <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="mb-2 block">Full Name *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="rounded-xl" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="mb-2 block">Phone *</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="rounded-xl" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-2 block">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="rounded-xl" />
                  </div>
                  <div>
                    <Label htmlFor="date" className="mb-2 block">Preferred Date *</Label>
                    <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="rounded-xl" />
                  </div>
                  <div>
                    <Label htmlFor="time" className="mb-2 block">Preferred Time *</Label>
                    <Input id="time" type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="rounded-xl" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message" className="mb-2 block">Notes (optional)</Label>
                  <Textarea id="message" rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="rounded-xl" />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
                  <Button
                    onClick={() => {
                      const svc = services.find((s) => s.id === selectedService)
                      const priceStr = svc?.price ?? "0"
                      const price = /free/i.test(priceStr) ? 0 : parseFloat((priceStr.match(/[\d,.]+/g)?.[0] || "0").replace(/,/g, ""))
                      const durationStr = svc?.duration ?? "60"
                      const duration = parseInt((durationStr.match(/\d+/)?.[0] || "60"))
                      appointmentService.addAppointment({
                        clientId: `web-${Date.now()}`,
                        clientName: formData.name,
                        clientEmail: formData.email,
                        clientPhone: formData.phone,
                        service: svc?.name || selectedService,
                        date: formData.date,
                        time: formData.time,
                        status: "scheduled",
                        notes: formData.message,
                        duration,
                        price,
                      })
                      setStep(3)
                    }}
                    disabled={!formData.name || !formData.phone || !formData.date || !formData.time || !selectedService}
                    variant="brand"
                    className="rounded-xl"
                  >
                    Confirm Booking <CheckCircle className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center space-y-6 py-6">
                <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white">✓</div>
                <p className="text-lg text-gray-700">Thanks! We’ll contact you to confirm your appointment.</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="brand" onClick={handleClose} className="rounded-xl">Close</Button>
                  <Button variant="outline" onClick={() => { setStep(1); setFormData({ name: "", email: "", phone: "", date: "", time: "", message: "" }) }} className="rounded-xl">Book Another</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}