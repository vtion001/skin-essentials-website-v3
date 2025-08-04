"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Clock, Star, Phone, Award, Shield, Users } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { SharedHeader } from "@/components/shared-header"

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

  const serviceCategories = [
    {
      category: "Face Enhancement",
      color: "from-[#fbc6c5] to-[#d09d80]",
      services: [
        {
          name: "Nose Thread Lift (Hiko)",
          price: "₱9,999",
          description: "Instantly lifts and defines the nose bridge and tip using dissolvable PDO/PCL threads.",
          duration: "~1 hour",
          results: "1-2 years",
          includes: "Unlimited PCL threads, free consultation, and post-care kit",
          faqs: [
            {
              q: "Does it hurt?",
              a: "A topical anesthetic is applied to ensure comfort. Most clients report feeling only minimal pressure.",
            },
            {
              q: "How long do results last?",
              a: "1 to 2 years, as the threads stimulate your own collagen production.",
            },
          ],
        },
        {
          name: "Face Thread Lift",
          price: "₱1,000/thread",
          originalPrice: "₱1,500/thread",
          description:
            "Lifts and tightens sagging skin in the cheeks, jowls, and neck for a rejuvenated, V-shaped contour.",
          duration: "1-1.5 hours",
          badge: "PROMO",
          faqs: [
            {
              q: "Can threads lift sagging cheeks/jawline?",
              a: "Yes, this is one of its primary functions, providing an immediate lift.",
            },
            {
              q: "How does it compare to Botox or fillers?",
              a: "Threads provide a physical lift. Botox relaxes muscles, and fillers add volume. They are often used together for a comprehensive non-surgical facelift.",
            },
          ],
        },
        {
          name: "Botox",
          price: "₱150/unit",
          description:
            "A neuromodulator injection that temporarily relaxes facial muscles to smooth dynamic wrinkles like frown lines and crow's feet.",
          duration: "15-30 minutes",
          results: "3-4 months",
        },
      ],
    },
    {
      category: "Dermal Fillers",
      color: "from-[#d09d80] to-[#fbc6c5]",
      services: [
        {
          name: "Face Fillers",
          price: "₱6,000/1mL",
          description: "Injectable hyaluronic acid (HA) gels for eyes, lips, cheeks, chin, and nose enhancement.",
          duration: "45 minutes - 1.5 hours",
          touchups: "6-18 months",
          faqs: [
            {
              q: "Can fillers migrate or cause lumps?",
              a: "This risk is minimized by choosing an experienced injector. Lumps are typically treatable.",
            },
          ],
        },
        {
          name: "Butt/Hip Fillers",
          price: "₱27,000/500cc",
          description: "Injectable HA gels to enhance curves and add volume to buttocks and hips.",
          duration: "45 minutes - 1.5 hours",
          touchups: "12-24 months",
          faqs: [
            {
              q: "Can I sit normally after butt filler injections?",
              a: "Avoid direct, prolonged pressure for the first 2-3 days.",
            },
          ],
        },
        {
          name: "Breast Fillers",
          price: "₱31,500/500cc",
          description: "Injectable HA gels for subtle breast enhancement.",
          duration: "45 minutes - 1.5 hours",
          touchups: "12-24 months",
        },
      ],
    },
    {
      category: "Skin Treatments",
      color: "from-[#fbc6c5]/80 to-[#d09d80]/80",
      services: [
        {
          name: "Vampire Facial (PRP + Microneedling)",
          price: "₱3,500",
          description:
            "A powerful anti-aging treatment that combines microneedling with Platelet-Rich Plasma (PRP) from your own blood to regenerate skin.",
          duration: "~1 hour",
          sessions: "3-4 sessions recommended",
          faqs: [
            {
              q: "Is there redness afterward?",
              a: "Mild redness, similar to a sunburn, is expected and subsides within 24-48 hours.",
            },
          ],
        },
        {
          name: "Thermage (RF Skin Tightening)",
          price: "₱3,500/area",
          description:
            "A non-invasive treatment that uses radiofrequency (RF) energy to stimulate collagen for smoother, tighter skin.",
          duration: "45-90 minutes",
          results: "Full results develop over 3-6 months",
        },
        {
          name: "Face Stemcell Boosters",
          price: "₱2,500-₱6,000",
          description:
            "A rejuvenating treatment infusing skin with growth factors to repair damage and boost collagen.",
          duration: "~1 hour",
          faqs: [
            {
              q: "How does it differ from traditional facials?",
              a: "Stem cell boosters work at a cellular level to regenerate and repair the skin from within.",
            },
          ],
        },
        {
          name: "Luthillo (Skin Booster)",
          price: "₱10,000/syringe",
          description:
            "An advanced injectable skin booster with hyaluronic acid that deeply hydrates and stimulates collagen for improved skin firmness and glow.",
          faqs: [
            {
              q: "How is it different from fillers?",
              a: "It does not add volume; it improves overall skin quality, elasticity, and hydration from within.",
            },
          ],
        },
      ],
    },
    {
      category: "Laser Treatments",
      color: "from-[#d09d80]/70 to-[#fbc6c5]/70",
      services: [
        {
          name: "Diode Laser Hair Removal",
          price: "₱1,000-₱5,000",
          description:
            "Permanently reduces unwanted hair by targeting the hair follicle with concentrated light energy.",
          pricing: "Underarm: ₱1,000, Face: ₱2,500, Arm: ₱3,000, Legs: ₱5,000, Bikini: ₱5,000",
          sessions: "6-8 sessions typically needed",
          faqs: [
            {
              q: "Is it painful?",
              a: "Diode lasers are one of the more comfortable technologies, often described as a slight snapping sensation.",
            },
          ],
        },
        {
          name: "Pico Laser",
          price: "₱1,000",
          description:
            "An advanced laser that delivers ultra-short energy pulses to shatter pigment, ideal for treating pigmentation and rejuvenating skin.",
          duration: "30-45 minutes",
          faqs: [
            {
              q: "Can it treat melasma and sunspots?",
              a: "Yes, it is highly effective for stubborn pigmentation issues.",
            },
          ],
        },
        {
          name: "Tattoo Removal",
          price: "₱4,000-₱15,000",
          description:
            "Laser technology breaks down ink particles in the skin, allowing your body to naturally clear them away.",
          duration: "15-45 minutes per session",
          sessions: "5-15+ sessions (varies greatly)",
        },
        {
          name: "Melasma Removal",
          price: "₱4,500",
          description:
            "Targeted treatments like Pico Laser or specialized chemical peels to reduce the appearance of melasma.",
          duration: "30-60 minutes",
          faqs: [
            {
              q: "Will melasma return?",
              a: "Melasma is a chronic condition. Strict daily use of SPF 50 is essential to maintain results.",
            },
          ],
        },
      ],
    },
    {
      category: "Specialized Treatments",
      color: "from-[#fbc6c5]/60 to-[#d09d80]/60",
      services: [
        {
          name: "Orgasm Shot for Women",
          price: "₱5,000",
          description:
            "A treatment that uses PRP injected into specific areas to enhance sexual arousal, pleasure, and orgasm.",
          duration: "~45 minutes",
          faqs: [{ q: "Are results immediate?", a: "Full results typically develop over several weeks." }],
        },
        {
          name: "Hair Growth Treatment",
          price: "₱4,500",
          description:
            "A non-surgical treatment using growth factor serums with microneedling on the scalp to stimulate dormant hair follicles.",
          duration: "~1 hour",
          sessions: "4-6 sessions recommended",
        },
        {
          name: "NAD+ Drip",
          price: "₱8,000",
          description:
            "An IV therapy delivering Nicotinamide Adenine Dinucleotide (NAD+) to boost cellular metabolism, energy, and cognitive function.",
          duration: "1-2 hours",
          benefits: "Increased energy, improved mental clarity, and anti-aging effects",
        },
        {
          name: "GLP-1 (Weight Loss Shot)",
          price: "₱2,500",
          description:
            "Medically supervised injections of a GLP-1 receptor agonist that aids in weight loss by regulating appetite.",
          note: "Medical consultation required",
        },
      ],
    },
  ]

  return (
    <PullToRefresh>
      <div className="min-h-screen bg-[#fffaff] pb-20 md:pb-0 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#fbc6c5]/20 to-[#d09d80]/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#d09d80]/30 to-[#fbc6c5]/30 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-[#fbc6c5]/10 to-[#d09d80]/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        {/* Glassmorphism Header */}
        <SharedHeader showBackButton={true} backHref="/" />

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 relative">
          <div className="container mx-auto text-center relative z-10">
            <div className="max-w-6xl mx-auto">
              {/* Floating Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#fbc6c5]/20 to-[#d09d80]/20 backdrop-blur-sm rounded-full border border-[#fbc6c5]/30 mb-8 animate-fadeInUp">
                <Award className="w-4 h-4 text-[#d09d80] mr-2" />
                <span className="text-sm font-medium text-gray-700">28 Professional Treatments</span>
              </div>

              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
                  Complete Range of
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#fbc6c5] via-[#d09d80] to-[#fbc6c5] bg-clip-text text-transparent animate-gradient">
                  Beauty Services
                </span>
              </h2>

              <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto">
                Discover all of our professional treatments designed to enhance your natural beauty with
                <span className="font-semibold text-[#d09d80]"> FDA-approved materials</span> and expert care.
              </p>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
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
                    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-[#fbc6c5]/20 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500 hover:bg-white/80">
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-6 transition-transform duration-300`}
                      >
                        <item.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-3 text-lg">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services by Category */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            {serviceCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-20">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#fbc6c5]/20 to-[#d09d80]/20 backdrop-blur-sm rounded-full border border-[#fbc6c5]/30 mb-6">
                    <Star className="w-4 h-4 text-[#d09d80] mr-2" />
                    <span className="text-sm font-medium text-gray-700">Category {categoryIndex + 1}</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {category.category}
                    </span>
                  </h3>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  {category.services.map((service, serviceIndex) => (
                    <Card
                      key={serviceIndex}
                      className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden group hover:scale-105"
                    >
                      <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <CardTitle className="text-lg font-bold text-gray-800 leading-tight pr-2">
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
                      <CardContent className="pt-0">
                        <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>

                        {service.pricing && (
                          <p className="text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-xl">{service.pricing}</p>
                        )}

                        <div className="space-y-2 text-sm text-gray-500 mb-4">
                          {service.duration && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-[#d09d80]" />
                              Duration: {service.duration}
                            </div>
                          )}
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
                          {service.touchups && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-2 text-[#d09d80]" />
                              Touch-ups: {service.touchups}
                            </div>
                          )}
                        </div>

                        {service.includes && (
                          <p className="text-sm text-green-600 mb-4 bg-green-50 p-3 rounded-xl">
                            <strong>Includes:</strong> {service.includes}
                          </p>
                        )}

                        {service.benefits && (
                          <p className="text-sm text-blue-600 mb-4 bg-blue-50 p-3 rounded-xl">
                            <strong>Benefits:</strong> {service.benefits}
                          </p>
                        )}

                        {service.note && (
                          <p className="text-sm text-amber-600 mb-4 bg-amber-50 p-3 rounded-xl">
                            <strong>Note:</strong> {service.note}
                          </p>
                        )}

                        {service.faqs && service.faqs.length > 0 && (
                          <Accordion type="single" collapsible className="mt-4">
                            {service.faqs.map((faq, faqIndex) => (
                              <AccordionItem key={faqIndex} value={`faq-${faqIndex}`} className="border-[#fbc6c5]/20">
                                <AccordionTrigger className="text-sm text-left py-3 hover:text-[#d09d80] transition-colors duration-300 hover:no-underline">
                                  {faq.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-sm text-gray-600 pb-3 leading-relaxed">
                                  {faq.a}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Look?</h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Book your consultation today and let our experts create a personalized treatment plan for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                onClick={() => setIsBookingOpen(true)}
                variant="secondary"
                className="text-[#d09d80] hover:bg-white/90 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-2xl"
              >
                <Phone className="w-5 h-5 mr-3" />
                Call 0995-260-3451
              </Button>
              <Link href="/portfolio">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#d09d80] bg-transparent px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-2xl"
                >
                  View Portfolio
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
