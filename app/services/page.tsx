"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Clock, Star, Phone, Award, Shield, Users, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { SharedHeader } from "@/components/shared-header"

interface ServiceFAQ {
  q: string
  a: string
}

interface Service {
  name: string
  price: string
  description: string
  duration?: string
  results?: string
  sessions?: string
  includes?: string
  benefits?: string[]
  faqs?: ServiceFAQ[]
  originalPrice?: string
  badge?: string
  pricing?: string
}

interface ServiceCategory {
  id: string
  category: string
  description: string
  image: string
  color: string
  services: Service[]
}

export default function ServicesPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const serviceCategories: ServiceCategory[] = [
    {
      id: "thread-lifts",
      category: "Thread Lifts & Face Contouring",
      description: "Non-surgical lifting and contouring using advanced PDO/PCL threads",
      image: "/placeholder.svg?height=300&width=400&text=Thread+Lifts",
      color: "from-[#fbc6c5] to-[#d09d80]",
      services: [
        {
          name: "Hiko Nose Thread Lift",
          price: "₱9,999",
          description: "Instantly lifts and defines the nose bridge and tip using dissolvable PDO/PCL threads for a more refined profile.",
          duration: "~1 hour",
          results: "1-2 years",
          includes: "Unlimited PCL threads, free consultation, and post-care kit",
          benefits: [
            "Immediate nose bridge enhancement",
            "No surgery or downtime required",
            "Natural-looking results",
            "Stimulates collagen production",
          ],
          faqs: [
            {
              q: "Does it hurt?",
              a: "A topical anesthetic is applied to ensure comfort. Most clients report feeling only minimal pressure during the procedure.",
            },
            {
              q: "How long do results last?",
              a: "Results typically last 1-2 years as the threads stimulate your own collagen production for lasting improvement.",
            },
          ],
        },
        {
          name: "Face Thread Lift",
          price: "₱1,000/thread",
          originalPrice: "₱1,500/thread",
          description: "Lifts and tightens sagging skin in the cheeks, jowls, and neck for a rejuvenated, V-shaped facial contour.",
          duration: "1-1.5 hours",
          results: "12-18 months",
          badge: "PROMO",
          benefits: [
            "Immediate lifting effect",
            "V-shaped facial contouring",
            "Minimal downtime",
            "Natural collagen stimulation",
          ],
          faqs: [
            {
              q: "Can threads lift sagging cheeks and jawline?",
              a: "Yes, this is one of the primary functions of face thread lifts, providing an immediate lifting effect for sagging areas.",
            },
          ],
        },
        {
          name: "Eyebrow Thread Lift",
          price: "₱8,000",
          description: "Lifts and shapes eyebrows for a more youthful, alert appearance using specialized PDO threads.",
          duration: "45 minutes",
          results: "12-18 months",
          benefits: [
            "Natural eyebrow lift",
            "Enhanced eye area",
            "No surgical scars",
            "Immediate results",
          ],
        },
        {
          name: "Neck Thread Lift",
          price: "₱12,000",
          description: "Tightens loose neck skin and reduces the appearance of neck bands for a more defined jawline.",
          duration: "1 hour",
          results: "12-18 months",
          benefits: [
            "Neck skin tightening",
            "Improved jawline definition",
            "Reduced neck bands",
            "Non-surgical solution",
          ],
        },
      ],
    },
    {
      id: "dermal-fillers",
      category: "Dermal Fillers & Volume Enhancement",
      description: "Premium hyaluronic acid fillers for natural volume enhancement",
      image: "/placeholder.svg?height=300&width=400&text=Dermal+Fillers",
      color: "from-[#d09d80] to-[#fbc6c5]",
      services: [
        {
          name: "Lip Fillers",
          price: "₱6,000/1mL",
          description: "Enhance lip volume and definition with premium hyaluronic acid fillers for naturally beautiful lips.",
          duration: "30-45 minutes",
          results: "6-12 months",
          benefits: [
            "Enhanced lip volume",
            "Improved lip definition",
            "Natural-looking results",
            "Customizable enhancement",
          ],
          faqs: [
            {
              q: "Will my lips look natural?",
              a: "Yes, our expert technique focuses on enhancing your natural lip shape for beautiful, proportionate results.",
            },
          ],
        },
        {
          name: "Cheek Fillers",
          price: "₱6,000/1mL",
          description: "Restore volume and create defined cheekbones for a youthful, sculpted appearance.",
          duration: "45 minutes",
          results: "12-18 months",
          benefits: [
            "Enhanced cheek volume",
            "Improved facial contours",
            "Youthful appearance",
            "Natural-looking results",
          ],
        },
        {
          name: "Under-Eye Fillers",
          price: "₱6,000/1mL",
          description: "Reduce dark circles and hollowing under the eyes for a refreshed, youthful look.",
          duration: "30 minutes",
          results: "12-15 months",
          benefits: [
            "Reduced under-eye hollowing",
            "Diminished dark circles",
            "Refreshed appearance",
            "Minimal downtime",
          ],
        },
        {
          name: "Chin Fillers",
          price: "₱6,000/1mL",
          description: "Enhance chin projection and create better facial balance and profile definition.",
          duration: "30 minutes",
          results: "12-18 months",
          benefits: [
            "Improved facial balance",
            "Enhanced chin projection",
            "Better profile definition",
            "Non-surgical enhancement",
          ],
        },
        {
          name: "Jawline Fillers",
          price: "₱8,000/1mL",
          description: "Create a more defined, masculine or feminine jawline depending on your aesthetic goals.",
          duration: "45 minutes",
          results: "12-18 months",
          benefits: [
            "Enhanced jawline definition",
            "Improved facial structure",
            "Customizable results",
            "Immediate enhancement",
          ],
        },
        {
          name: "Body Fillers (BBL)",
          price: "₱27,000/500cc",
          description: "Injectable HA gels for buttocks and hip enhancement, creating beautiful curves and proportions.",
          duration: "1-2 hours",
          results: "12-24 months",
          benefits: [
            "Enhanced body curves",
            "Non-surgical enhancement",
            "Natural-feeling results",
            "Customizable volume",
          ],
          faqs: [
            {
              q: "Can I sit normally after butt filler injections?",
              a: "Avoid direct, prolonged pressure for the first 2-3 days to ensure optimal results and healing.",
            },
          ],
        },
      ],
    },
    {
      id: "botox-treatments",
      category: "Botox & Neuromodulators",
      description: "FDA-approved treatments to smooth wrinkles and prevent aging",
      image: "/placeholder.svg?height=300&width=400&text=Botox+Treatments",
      color: "from-[#fbc6c5]/90 to-[#d09d80]/90",
      services: [
        {
          name: "Forehead Botox",
          price: "₱8,000",
          description: "Smooth horizontal forehead lines and prevent future wrinkle formation.",
          duration: "15-20 minutes",
          results: "3-6 months",
          benefits: [
            "Smooth forehead lines",
            "Prevents new wrinkles",
            "Natural-looking results",
            "Quick treatment",
          ],
        },
        {
          name: "Crow's Feet Botox",
          price: "₱8,000",
          description: "Reduce fine lines around the eyes for a more youthful, refreshed appearance.",
          duration: "15 minutes",
          results: "3-6 months",
          benefits: [
            "Reduced eye wrinkles",
            "Youthful eye area",
            "Prevents deepening lines",
            "Minimal discomfort",
          ],
        },
        {
          name: "Frown Lines Botox",
          price: "₱8,000",
          description: "Smooth the vertical lines between eyebrows for a more relaxed, approachable look.",
          duration: "10-15 minutes",
          results: "3-6 months",
          benefits: [
            "Smooth frown lines",
            "More relaxed appearance",
            "Prevents line deepening",
            "Quick procedure",
          ],
        },
        {
          name: "Masseter Botox (Jaw Slimming)",
          price: "₱12,000",
          description: "Slim the jawline by relaxing the masseter muscles for a more V-shaped face.",
          duration: "20 minutes",
          results: "4-6 months",
          benefits: [
            "Slimmer jawline",
            "V-shaped face",
            "Reduced teeth grinding",
            "Facial feminization",
          ],
        },
        {
          name: "Lip Flip Botox",
          price: "₱4,000",
          description: "Create the appearance of fuller lips by relaxing the muscles around the mouth.",
          duration: "10 minutes",
          results: "2-3 months",
          benefits: [
            "Fuller-looking lips",
            "Enhanced lip shape",
            "Subtle enhancement",
            "No added volume",
          ],
        },
      ],
    },
    {
      id: "laser-treatments",
      category: "Laser Treatments & Hair Removal",
      description: "Advanced laser technology for hair removal and skin rejuvenation",
      image: "/placeholder.svg?height=300&width=400&text=Laser+Treatments",
      color: "from-[#fbc6c5]/80 to-[#d09d80]/80",
      services: [
        {
          name: "Diode Laser Hair Removal - Underarms",
          price: "₱1,000",
          description: "Permanently reduces unwanted underarm hair using comfortable diode laser technology.",
          duration: "15 minutes",
          sessions: "6-8 sessions typically needed",
          benefits: [
            "Permanent hair reduction",
            "Comfortable treatment",
            "Quick sessions",
            "Smooth underarms",
          ],
        },
        {
          name: "Diode Laser Hair Removal - Face",
          price: "₱2,500",
          description: "Remove unwanted facial hair for smooth, hair-free skin.",
          duration: "20-30 minutes",
          sessions: "6-8 sessions typically needed",
          benefits: [
            "Smooth facial skin",
            "Precision treatment",
            "Safe for sensitive areas",
            "Long-lasting results",
          ],
        },
        {
          name: "Diode Laser Hair Removal - Arms",
          price: "₱3,000",
          description: "Full arm hair removal for smooth, hair-free arms.",
          duration: "30-45 minutes",
          sessions: "6-8 sessions typically needed",
          benefits: [
            "Smooth arms",
            "Comfortable treatment",
            "Permanent reduction",
            "No more shaving",
          ],
        },
        {
          name: "Diode Laser Hair Removal - Legs",
          price: "₱5,000",
          description: "Full leg hair removal for permanently smooth legs.",
          duration: "45-60 minutes",
          sessions: "6-8 sessions typically needed",
          benefits: [
            "Smooth legs",
            "Permanent hair reduction",
            "No ingrown hairs",
            "Long-term savings",
          ],
        },
        {
          name: "Diode Laser Hair Removal - Bikini",
          price: "₱5,000",
          description: "Bikini area hair removal for confidence and comfort.",
          duration: "30 minutes",
          sessions: "6-8 sessions typically needed",
          benefits: [
            "Smooth bikini area",
            "Reduced irritation",
            "Precision treatment",
            "Comfortable procedure",
          ],
        },
        {
          name: "Pico Laser",
          price: "₱1,000",
          description: "Advanced laser delivering ultra-short energy pulses to treat pigmentation and rejuvenate skin effectively.",
          duration: "30-45 minutes",
          benefits: [
            "Treats stubborn pigmentation",
            "Skin rejuvenation",
            "Minimal downtime",
            "Safe for all skin types",
          ],
          faqs: [
            {
              q: "Can it treat melasma and sunspots?",
              a: "Yes, Pico laser is highly effective for treating stubborn pigmentation issues including melasma and age spots.",
            },
          ],
        },
        {
          name: "Tattoo Removal",
          price: "₱4,000-₱15,000",
          description: "Advanced laser technology breaks down ink particles, allowing your body to naturally clear them away.",
          duration: "15-45 minutes per session",
          sessions: "5-15+ sessions (varies by tattoo)",
          benefits: [
            "Complete tattoo removal",
            "Minimal scarring",
            "All ink colors treatable",
            "Gradual fading process",
          ],
        },
      ],
    },
    {
      id: "skin-treatments",
      category: "Skin Rejuvenation & Facials",
      description: "Medical-grade treatments for youthful, radiant skin",
      image: "/placeholder.svg?height=300&width=400&text=Skin+Treatments",
      color: "from-[#d09d80]/70 to-[#fbc6c5]/70",
      services: [
        {
          name: "Vampire Facial (PRP + Microneedling)",
          price: "₱3,500",
          description: "Powerful anti-aging treatment combining microneedling with your own Platelet-Rich Plasma for natural skin regeneration.",
          duration: "~1 hour",
          sessions: "3-4 sessions recommended",
          benefits: ["Natural skin regeneration", "Improved skin texture", "Reduced fine lines", "Enhanced skin glow"],
          faqs: [
            {
              q: "Is there redness afterward?",
              a: "Mild redness similar to a sunburn is expected and typically subsides within 24-48 hours.",
            },
          ],
        },
        {
          name: "Thermage RF Skin Tightening",
          price: "₱3,500/area",
          description: "Non-invasive radiofrequency treatment that stimulates collagen production for smoother, tighter skin.",
          duration: "45-90 minutes",
          results: "Results develop over 3-6 months",
          benefits: ["Skin tightening", "Collagen stimulation", "No downtime", "Long-lasting results"],
        },
        {
          name: "Stem Cell Boosters",
          price: "₱2,500-₱6,000",
          description: "Rejuvenating treatment infusing skin with growth factors to repair damage and boost natural collagen production.",
          duration: "~1 hour",
          benefits: ["Cellular regeneration", "Improved skin quality", "Natural healing", "Anti-aging effects"],
          faqs: [
            {
              q: "How does it differ from traditional facials?",
              a: "Stem cell boosters work at a cellular level to regenerate and repair skin from within, providing deeper rejuvenation.",
            },
          ],
        },
        {
          name: "HydraFacial",
          price: "₱4,500",
          description: "Multi-step facial treatment that cleanses, exfoliates, extracts, and hydrates skin for immediate glow.",
          duration: "45 minutes",
          benefits: ["Instant skin glow", "Deep cleansing", "Hydration boost", "No downtime"],
        },
        {
          name: "Chemical Peel",
          price: "₱2,500-₱5,000",
          description: "Professional chemical exfoliation to improve skin texture, tone, and reduce signs of aging.",
          duration: "30-45 minutes",
          benefits: ["Improved skin texture", "Reduced pigmentation", "Smoother skin", "Enhanced radiance"],
        },
        {
          name: "Microneedling",
          price: "₱3,000",
          description: "Stimulates collagen production through controlled micro-injuries for improved skin texture and tone.",
          duration: "45 minutes",
          benefits: ["Collagen stimulation", "Improved texture", "Reduced scars", "Enhanced absorption"],
        },
      ],
    },
  ]

  return (
    <PullToRefresh>
      <div className="min-h-screen bg-white pb-20 md:pb-0">
        {/* Header */}
        <SharedHeader showBackButton={true} backHref="/" />

        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="bg-[#fbc6c5]/10 text-[#d09d80] px-4 py-2 mb-6">Quezon City's Premier Aesthetic Clinic</Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Quezon City's Complete Range of
                <span className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] bg-clip-text text-transparent block">
                  Aesthetic Services
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Discover Quezon City's most comprehensive collection of medical-grade aesthetic treatments, including our signature 
                <span className="font-semibold text-[#d09d80]"> Hiko Nose Thread Lifts</span>, designed to enhance your
                natural beauty with <span className="font-semibold text-[#d09d80]">FDA-approved materials</span> and expert care.
              </p>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {[
                  {
                    icon: Shield,
                    title: "FDA-Approved Materials",
                    description: "Only premium, medical-grade products",
                  },
                  {
                    icon: Award,
                    title: "Licensed Professionals",
                    description: "Expert medical team you can trust",
                  },
                  {
                    icon: Users,
                    title: "10,000+ Happy Clients",
                    description: "Proven track record of excellence",
                  },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services by Category */}
        {serviceCategories.map((category, categoryIndex) => (
          <section
            key={category.id}
            id={category.id}
            className={`py-20 ${categoryIndex % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
          >
            <div className="container mx-auto px-4">
              {/* Category Header */}
              <div className="text-center mb-16">
                <Badge className="bg-[#fbc6c5]/10 text-[#d09d80] px-4 py-2 mb-4">Category {categoryIndex + 1}</Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{category.category}</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">{category.description}</p>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {category.services.map((service, serviceIndex) => (
                  <Card
                    key={serviceIndex}
                    className="group hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden border-0 bg-white"
                  >
                    <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>

                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <CardTitle className="text-xl font-bold text-gray-900 leading-tight pr-2">
                          {service.name}
                        </CardTitle>
                        {service.badge && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs flex-shrink-0">
                            {service.badge}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <CardDescription className="text-2xl font-bold bg-gradient-to-r from-[#d09d80] to-[#fbc6c5] bg-clip-text text-transparent">
                          {service.price}
                        </CardDescription>
                        {service.originalPrice && (
                          <span className="text-lg text-gray-400 line-through">{service.originalPrice}</span>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-6">
                      <p className="text-gray-600 leading-relaxed">{service.description}</p>

                      {service.pricing && (
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <h4 className="font-semibold text-gray-900 mb-2">Pricing Details</h4>
                          <p className="text-sm text-gray-600">{service.pricing}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                        {service.duration && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-[#d09d80]" />
                            <span>{service.duration}</span>
                          </div>
                        )}
                        {service.results && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-2 text-[#d09d80]" />
                            <span>{service.results}</span>
                          </div>
                        )}
                        {service.sessions && (
                          <div className="flex items-center col-span-2">
                            <Star className="w-4 h-4 mr-2 text-[#d09d80]" />
                            <span>{service.sessions}</span>
                          </div>
                        )}
                      </div>

                      {service.includes && (
                        <div className="bg-green-50 p-4 rounded-xl">
                          <h4 className="font-semibold text-green-800 mb-2">Package Includes</h4>
                          <p className="text-sm text-green-700">{service.includes}</p>
                        </div>
                      )}

                      {service.benefits && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Key Benefits</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {service.benefits.map((benefit, idx) => (
                              <div key={idx} className="flex items-center text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4 text-[#d09d80] mr-2 flex-shrink-0" />
                                {benefit}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {service.faqs && service.faqs.length > 0 && (
                        <Accordion type="single" collapsible>
                          <AccordionItem value="faqs" className="border-gray-200">
                            <AccordionTrigger className="text-sm font-semibold text-gray-900 py-3 hover:text-[#d09d80] transition-colors duration-300 hover:no-underline">
                              Frequently Asked Questions
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pb-4">
                              {service.faqs.map((faq, faqIndex) => (
                                <div key={faqIndex} className="border-l-2 border-[#fbc6c5] pl-4">
                                  <h5 className="font-semibold text-gray-900 mb-2">{faq.q}</h5>
                                  <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                                </div>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}

                      {service.name === "Hiko Nose Thread Lift" ? (
                        <Link href="/hiko-nose-lift">
                          <Button className="w-full bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white rounded-xl py-3 font-semibold group-hover:shadow-lg transition-all duration-300">
                            Learn More About Hiko
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/contact">
                          <Button className="w-full bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white rounded-xl py-3 font-semibold group-hover:shadow-lg transition-all duration-300">
                            Book This Treatment
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Look?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Schedule your complimentary consultation today and let our experts create a personalized treatment plan
              for your aesthetic goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-[#d09d80] hover:bg-white/90 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Phone className="w-5 h-5 mr-3" />
                Call 0995-260-3451
              </Button>
              <Link href="/portfolio">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#d09d80] bg-transparent px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  View Our Portfolio
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </PullToRefresh>
  )
}
