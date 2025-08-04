"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CalendarIcon,
  Clock,
  User,
  CheckCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, isToday, isBefore, startOfDay } from "date-fns"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const services = [
    {
      id: "consultation",
      name: "Free Consultation",
      price: "Free",
      duration: "30 mins",
      description: "Personalized assessment and treatment planning",
      popular: true,
    },
    // Face Enhancement
    {
      id: "nose-thread",
      name: "Nose Thread Lift (Hiko)",
      price: "₱9,999",
      duration: "1 hour",
      description: "Instantly lifts and defines the nose bridge and tip using dissolvable PDO/PCL threads",
    },
    {
      id: "face-thread",
      name: "Face Thread Lift",
      price: "₱1,000/thread",
      duration: "1-1.5 hours",
      description: "Lifts and tightens sagging skin in the cheeks, jowls, and neck for a rejuvenated, V-shaped contour",
    },
    {
      id: "botox",
      name: "Botox",
      price: "₱150/unit",
      duration: "15-30 minutes",
      description: "A neuromodulator injection that temporarily relaxes facial muscles to smooth dynamic wrinkles",
    },
    // Dermal Fillers
    {
      id: "face-fillers",
      name: "Face Fillers",
      price: "₱6,000/1mL",
      duration: "45 minutes - 1.5 hours",
      description: "Injectable hyaluronic acid (HA) gels for eyes, lips, cheeks, chin, and nose enhancement",
    },
    {
      id: "butt-hip-fillers",
      name: "Butt/Hip Fillers",
      price: "₱27,000/500cc",
      duration: "45 minutes - 1.5 hours",
      description: "Injectable HA gels to enhance curves and add volume to buttocks and hips",
    },
    {
      id: "breast-fillers",
      name: "Breast Fillers",
      price: "₱31,500/500cc",
      duration: "45 minutes - 1.5 hours",
      description: "Injectable HA gels for subtle breast enhancement",
    },
    // Skin Treatments
    {
      id: "vampire-facial",
      name: "Vampire Facial (PRP + Microneedling)",
      price: "₱3,500",
      duration: "1 hour",
      description: "A powerful anti-aging treatment that combines microneedling with Platelet-Rich Plasma (PRP)",
    },
    {
      id: "thermage",
      name: "Thermage (RF Skin Tightening)",
      price: "₱3,500/area",
      duration: "45-90 minutes",
      description: "A non-invasive treatment that uses radiofrequency (RF) energy to stimulate collagen",
    },
    {
      id: "face-stemcell",
      name: "Face Stemcell Boosters",
      price: "₱2,500-₱6,000",
      duration: "1 hour",
      description: "A rejuvenating treatment infusing skin with growth factors to repair damage and boost collagen",
    },
    {
      id: "luthillo",
      name: "Luthillo (Skin Booster)",
      price: "₱10,000/syringe",
      duration: "45-60 minutes",
      description: "An advanced injectable skin booster with hyaluronic acid that deeply hydrates and stimulates collagen",
    },
    // Laser Treatments
    {
      id: "diode-laser",
      name: "Diode Laser Hair Removal",
      price: "₱1,000-₱5,000",
      duration: "Varies",
      description: "Permanently reduces unwanted hair by targeting the hair follicle with concentrated light energy",
    },
    {
      id: "pico-laser",
      name: "Pico Laser",
      price: "₱1,000",
      duration: "30-45 minutes",
      description: "An advanced laser that delivers ultra-short energy pulses to shatter pigment",
    },
    {
      id: "tattoo-removal",
      name: "Tattoo Removal",
      price: "₱4,000-₱15,000",
      duration: "15-45 minutes",
      description: "Laser technology breaks down ink particles in the skin, allowing your body to naturally clear them",
    },
    {
      id: "melasma-removal",
      name: "Melasma Removal",
      price: "₱4,500",
      duration: "30-60 minutes",
      description: "Targeted treatments like Pico Laser or specialized chemical peels to reduce the appearance of melasma",
    },
    // Specialized Treatments
    {
      id: "orgasm-shot",
      name: "Orgasm Shot for Women",
      price: "₱5,000",
      duration: "45 minutes",
      description: "A treatment that uses PRP injected into specific areas to enhance sexual arousal, pleasure, and orgasm",
    },
    {
      id: "hair-growth",
      name: "Hair Growth Treatment",
      price: "₱4,500",
      duration: "1 hour",
      description: "A non-surgical treatment using growth factor serums with microneedling on the scalp",
    },
    {
      id: "nad-drip",
      name: "NAD+ Drip",
      price: "₱8,000",
      duration: "1-2 hours",
      description: "An IV therapy delivering Nicotinamide Adenine Dinucleotide (NAD+) to boost cellular metabolism",
    },
    {
      id: "glp1-shot",
      name: "GLP-1 (Weight Loss Shot)",
      price: "₱2,500",
      duration: "15-30 minutes",
      description: "Medically supervised injections of a GLP-1 receptor agonist that aids in weight loss",
    },
    // Additional Services (to reach 28 total)
    {
      id: "underarm-laser",
      name: "Underarm Laser Hair Removal",
      price: "₱1,000",
      duration: "15-30 minutes",
      description: "Permanent hair reduction for underarm area",
    },
    {
      id: "face-laser",
      name: "Face Laser Hair Removal",
      price: "₱2,500",
      duration: "30-45 minutes",
      description: "Permanent hair reduction for facial areas",
    },
    {
      id: "arm-laser",
      name: "Arm Laser Hair Removal",
      price: "₱3,000",
      duration: "45-60 minutes",
      description: "Permanent hair reduction for full arms",
    },
    {
      id: "legs-laser",
      name: "Legs Laser Hair Removal",
      price: "₱5,000",
      duration: "60-90 minutes",
      description: "Permanent hair reduction for full legs",
    },
    {
      id: "bikini-laser",
      name: "Bikini Laser Hair Removal",
      price: "₱5,000",
      duration: "30-45 minutes",
      description: "Permanent hair reduction for bikini area",
    },
    {
      id: "lip-fillers",
      name: "Lip Fillers",
      price: "₱6,000/1mL",
      duration: "30-45 minutes",
      description: "Injectable hyaluronic acid for lip enhancement and definition",
    },
    {
      id: "cheek-fillers",
      name: "Cheek Fillers",
      price: "₱6,000/1mL",
      duration: "45-60 minutes",
      description: "Injectable hyaluronic acid for cheek volume and contouring",
    },
    {
      id: "chin-fillers",
      name: "Chin Fillers",
      price: "₱6,000/1mL",
      duration: "30-45 minutes",
      description: "Injectable hyaluronic acid for chin enhancement and definition",
    },
    {
      id: "eye-fillers",
      name: "Eye/Under Eye Fillers",
      price: "₱6,000/1mL",
      duration: "30-45 minutes",
      description: "Injectable hyaluronic acid for under-eye hollows and tear troughs",
    },
    {
      id: "jawline-fillers",
      name: "Jawline Fillers",
      price: "₱6,000/1mL",
      duration: "45-60 minutes",
      description: "Injectable hyaluronic acid for jawline definition and contouring",
    },
  ]

  const timeSlots = [
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
  ]

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1))
  const prevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1))

  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfDay(new Date())) || date.getDay() === 0 // Disable past dates and Sundays
  }

  const handleSubmit = () => {
    console.log("Booking submitted:", {
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      ...formData,
    })
    setStep(4)
  }

  const resetForm = () => {
    setStep(1)
    setSelectedDate(undefined)
    setSelectedTime("")
    setSelectedService("")
    setCurrentWeek(new Date())
    setFormData({ name: "", email: "", phone: "", message: "" })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Choose Your Service"
      case 2:
        return "Select Date & Time"
      case 3:
        return "Your Information"
      case 4:
        return "Booking Confirmed!"
      default:
        return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-transparent border-none rounded-3xl p-0 shadow-2xl">
        <div className="bg-[#fffaff] rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center">
                <Sparkles className="w-6 h-6 mr-3" />
                {getStepTitle()}
              </DialogTitle>
              <p className="text-white/90 mt-2">
                {step === 1 && "Select the treatment you're interested in"}
                {step === 2 && "Pick your preferred date and time"}
                {step === 3 && "Tell us about yourself"}
                {step === 4 && "We'll contact you soon to confirm"}
              </p>
            </DialogHeader>
          </div>

          <div className="p-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                      step >= i
                        ? "bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white shadow-lg scale-110"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step > i ? <CheckCircle className="w-5 h-5" /> : i}
                  </div>
                  {i < 3 && (
                    <div
                      className={`w-16 h-1 mx-3 rounded-full transition-all duration-500 ${
                        step > i ? "bg-gradient-to-r from-[#fbc6c5] to-[#d09d80]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:scale-105 ${
                        selectedService === service.id
                          ? "border-[#fbc6c5] bg-gradient-to-br from-[#fbc6c5]/10 to-[#d09d80]/10 shadow-xl scale-105"
                          : "border-gray-200 hover:border-[#fbc6c5]/50 bg-white/60 backdrop-blur-sm"
                      } rounded-2xl overflow-hidden`}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-bold text-gray-800">{service.name}</CardTitle>
                          <div className="flex gap-2">
                            {service.popular && (
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                Popular
                              </Badge>
                            )}
                            {service.price === "Free" && (
                              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">Free</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xl bg-gradient-to-r from-[#d09d80] to-[#fbc6c5] bg-clip-text text-transparent">
                            {service.price}
                          </span>
                          <span className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {service.duration}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedService}
                    className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Next: Select Date & Time
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time Selection */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Full Calendar */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2 text-[#d09d80]" />
                      Select Date
                    </h3>
                    <Card className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20 rounded-2xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-[#fbc6c5]/10 to-[#d09d80]/10 pb-4">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            onClick={() => setCurrentWeek(subWeeks(currentWeek, 4))}
                            className="p-2 hover:bg-white/50 rounded-xl"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </Button>
                          <h4 className="font-bold text-xl text-gray-800">{format(currentWeek, "MMMM yyyy")}</h4>
                          <Button
                            variant="ghost"
                            onClick={() => setCurrentWeek(addWeeks(currentWeek, 4))}
                            className="p-2 hover:bg-white/50 rounded-xl"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        {/* Calendar Grid */}
                        <div className="p-4">
                          {/* Day Headers */}
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {dayNames.map((day, index) => (
                              <div
                                key={day}
                                className={`text-center text-sm font-bold py-3 ${
                                  index === 0 ? "text-red-500" : "text-gray-600"
                                }`}
                              >
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Calendar Days */}
                          <div className="grid grid-cols-7 gap-1">
                            {(() => {
                              const startOfMonth = new Date(currentWeek.getFullYear(), currentWeek.getMonth(), 1)
                              const endOfMonth = new Date(currentWeek.getFullYear(), currentWeek.getMonth() + 1, 0)
                              const startDate = startOfWeek(startOfMonth)
                              const endDate = new Date(startDate)
                              endDate.setDate(endDate.getDate() + 41) // 6 weeks

                              const days = []
                              const currentDate = new Date(startDate)

                              while (currentDate <= endDate) {
                                days.push(new Date(currentDate))
                                currentDate.setDate(currentDate.getDate() + 1)
                              }

                              return days.map((date) => {
                                const disabled = isDateDisabled(date)
                                const selected = selectedDate && isSameDay(date, selectedDate)
                                const today = isToday(date)
                                const isCurrentMonth = date.getMonth() === currentWeek.getMonth()
                                const isPastDate = isBefore(date, startOfDay(new Date()))

                                return (
                                  <button
                                    key={date.toISOString()}
                                    onClick={() => !disabled && setSelectedDate(date)}
                                    disabled={disabled}
                                    className={`
                                      aspect-square rounded-xl text-sm font-semibold transition-all duration-300 relative flex items-center justify-center
                                      ${!isCurrentMonth ? "text-gray-300" : ""}
                                      ${isPastDate ? "text-gray-300 cursor-not-allowed" : ""}
                                      ${date.getDay() === 0 && isCurrentMonth && !isPastDate ? "text-red-400 cursor-not-allowed" : ""}
                                      ${!disabled && isCurrentMonth && !isPastDate && date.getDay() !== 0 ? "hover:bg-[#fbc6c5]/20 hover:scale-110 cursor-pointer" : ""}
                                      ${selected ? "bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white shadow-lg scale-110 z-10" : ""}
                                      ${today && !selected ? "bg-blue-500 text-white font-bold shadow-md" : ""}
                                      ${!selected && !today && isCurrentMonth && !isPastDate && date.getDay() !== 0 ? "hover:bg-gray-100" : ""}
                                    `}
                                  >
                                    <span className="relative z-10">{format(date, "d")}</span>

                                    {/* Today indicator */}
                                    {today && !selected && (
                                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                                    )}

                                    {/* Selected date glow */}
                                    {selected && (
                                      <div className="absolute inset-0 bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] rounded-xl opacity-20 animate-pulse"></div>
                                    )}

                                    {/* Unavailable overlay for Sundays */}
                                    {date.getDay() === 0 && isCurrentMonth && !isPastDate && (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-0.5 h-6 bg-red-400 rotate-45 absolute"></div>
                                        <div className="w-0.5 h-6 bg-red-400 -rotate-45 absolute"></div>
                                      </div>
                                    )}
                                  </button>
                                )
                              })
                            })()}
                          </div>

                          {/* Legend */}
                          <div className="mt-4 pt-4 border-t border-[#fbc6c5]/20">
                            <div className="flex flex-wrap gap-4 text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-600">Today</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] rounded-full"></div>
                                <span className="text-gray-600">Selected</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                <span className="text-gray-600">Unavailable</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-[#d09d80]" />
                      Select Time
                    </h3>

                    {selectedDate ? (
                      <Card className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20 rounded-2xl">
                        <CardHeader className="bg-gradient-to-r from-[#fbc6c5]/10 to-[#d09d80]/10 pb-4">
                          <h4 className="font-semibold text-gray-800">
                            Available times for {format(selectedDate, "EEEE, MMMM d")}
                          </h4>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                            {timeSlots.map((time) => (
                              <Button
                                key={time}
                                variant={selectedTime === time ? "default" : "outline"}
                                onClick={() => setSelectedTime(time)}
                                className={`
                                  py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105
                                  ${
                                    selectedTime === time
                                      ? "bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white shadow-lg"
                                      : "border-[#fbc6c5]/30 text-gray-700 hover:bg-[#fbc6c5]/10 hover:border-[#fbc6c5]/50"
                                  }
                                `}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20 rounded-2xl">
                        <CardContent className="p-8 text-center">
                          <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">Please select a date first to see available times</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Selected Date & Time Display */}
                {selectedDate && selectedTime && (
                  <Card className="bg-gradient-to-r from-[#fbc6c5]/10 to-[#d09d80]/10 border border-[#fbc6c5]/20 rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center space-x-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] rounded-xl flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Selected Date</p>
                            <p className="font-bold text-gray-800">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                          </div>
                        </div>
                        <div className="w-px h-12 bg-[#fbc6c5]/30"></div>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-[#d09d80] to-[#fbc6c5] rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Selected Time</p>
                            <p className="font-bold text-gray-800">{selectedTime}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="border-[#fbc6c5]/30 text-gray-700 hover:bg-[#fbc6c5]/10 px-6 py-3 rounded-xl font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!selectedDate || !selectedTime}
                    className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Next: Your Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Personal Information */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Form */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                      <User className="w-5 h-5 mr-2 text-[#d09d80]" />
                      Your Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-700 font-semibold flex items-center mb-2">
                          <User className="w-4 h-4 mr-2 text-[#d09d80]" />
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="border-[#fbc6c5]/30 focus:border-[#d09d80] focus:ring-[#d09d80]/20 rounded-xl py-3 px-4 bg-white/60 backdrop-blur-sm"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-gray-700 font-semibold flex items-center mb-2">
                          <Phone className="w-4 h-4 mr-2 text-[#d09d80]" />
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="border-[#fbc6c5]/30 focus:border-[#d09d80] focus:ring-[#d09d80]/20 rounded-xl py-3 px-4 bg-white/60 backdrop-blur-sm"
                          placeholder="09XX-XXX-XXXX"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-gray-700 font-semibold flex items-center mb-2">
                          <Mail className="w-4 h-4 mr-2 text-[#d09d80]" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="border-[#fbc6c5]/30 focus:border-[#d09d80] focus:ring-[#d09d80]/20 rounded-xl py-3 px-4 bg-white/60 backdrop-blur-sm"
                          placeholder="your.email@example.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-gray-700 font-semibold flex items-center mb-2">
                          <MessageSquare className="w-4 h-4 mr-2 text-[#d09d80]" />
                          Additional Notes (Optional)
                        </Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="border-[#fbc6c5]/30 focus:border-[#d09d80] focus:ring-[#d09d80]/20 rounded-xl py-3 px-4 bg-white/60 backdrop-blur-sm"
                          placeholder="Any specific concerns or questions?"
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Booking Summary */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Booking Summary</h3>
                    <Card className="bg-gradient-to-br from-[#fbc6c5]/10 to-[#d09d80]/10 border border-[#fbc6c5]/20 rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-800 flex items-center">
                          <Sparkles className="w-5 h-5 mr-2 text-[#d09d80]" />
                          Appointment Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-start">
                          <span className="text-gray-600">Service:</span>
                          <div className="text-right">
                            <span className="font-semibold text-gray-800 block">
                              {services.find((s) => s.id === selectedService)?.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {services.find((s) => s.id === selectedService)?.duration}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-semibold text-gray-800">
                            {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-semibold text-gray-800">{selectedTime}</span>
                        </div>
                        <div className="border-t border-[#fbc6c5]/20 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-bold text-2xl bg-gradient-to-r from-[#d09d80] to-[#fbc6c5] bg-clip-text text-transparent">
                              {services.find((s) => s.id === selectedService)?.price}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="border-[#fbc6c5]/30 text-gray-700 hover:bg-[#fbc6c5]/10 px-6 py-3 rounded-xl font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.phone}
                    className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Confirm Booking
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Success Message */}
            {step === 4 && (
              <div className="text-center space-y-8 py-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">Booking Confirmed!</h3>
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Thank you for choosing Skin Essentials by HER! We've received your booking request and will contact
                    you within 24 hours to confirm your appointment details.
                  </p>

                  <Card className="bg-gradient-to-br from-[#fbc6c5]/10 to-[#d09d80]/10 border border-[#fbc6c5]/20 rounded-2xl max-w-md mx-auto">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center justify-center">
                        <Star className="w-5 h-5 mr-2 text-[#d09d80]" />
                        What's Next?
                      </h4>
                      <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          We'll call you within 24 hours
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Confirm your appointment details
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Send you preparation instructions
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Answer any questions you may have
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleClose}
                    className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="border-[#fbc6c5]/30 text-gray-700 hover:bg-[#fbc6c5]/10 px-8 py-3 rounded-xl font-semibold bg-transparent"
                  >
                    Book Another Appointment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
