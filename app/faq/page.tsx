"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Shield, Clock, CreditCard, Camera, AlertTriangle, Heart, Star, Award, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { SharedHeader } from "@/components/shared-header"

export default function FAQPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const generalFAQs = [
    {
      category: "General Information",
      icon: <Shield className="w-5 h-5" />,
      color: "from-[#fbc6c5] to-[#d09d80]",
      questions: [
        {
          q: "How long does a procedure take?",
          a: "Procedure times vary depending on the service, ranging from 30 minutes for quick treatments like whitening sessions to 2-3 hours for more intensive procedures like thread lifts or fillers. Each service description provides a more specific timeframe.",
        },
        {
          q: "Is there any downtime?",
          a: "Most of our non-surgical treatments require minimal to no downtime. Clients often experience mild swelling, redness, or tenderness for 1-3 days but can typically resume daily activities immediately.",
        },
        {
          q: "Are the materials and products FDA-approved?",
          a: "Yes. We prioritize your safety by exclusively using high-quality, medical-grade materials and products that are approved by the FDA.",
        },
        {
          q: "What safety protocols do you follow?",
          a: "All procedures are performed by licensed medical professionals in a sterile environment. We adhere to strict hygiene standards, use single-use needles, and conduct thorough consultations to ensure every treatment is safe and suitable for the client.",
        },
      ],
    },
    {
      category: "Pricing & Payment",
      icon: <CreditCard className="w-5 h-5" />,
      color: "from-[#d09d80] to-[#fbc6c5]",
      questions: [
        {
          q: "Do you offer payment plans or discounts?",
          a: "We frequently offer seasonal promotions and packages. Please ask about our latest offers! We accept GCash, Bank Transfers, and Cash. At this time, we do not offer credit card payments or cash installment plans.",
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept GCash, Bank Transfers, and Cash payments. Unfortunately, we do not currently accept credit cards or offer installment plans.",
        },
      ],
    },
    {
      category: "Before Your Visit",
      icon: <Clock className="w-5 h-5" />,
      color: "from-[#fbc6c5]/80 to-[#d09d80]/80",
      questions: [
        {
          q: "How do I prepare for my procedure?",
          a: "• Hydrate well and have a light meal before your appointment\n• Avoid alcohol and blood-thinning medications (like aspirin) for at least 24-48 hours prior\n• Arrive with clean skin, free of makeup or lotions\n• Disclose any medical conditions, allergies, or medications you are taking during your consultation",
        },
      ],
    },
    {
      category: "Portfolio & Results",
      icon: <Camera className="w-5 h-5" />,
      color: "from-[#d09d80]/70 to-[#fbc6c5]/70",
      questions: [
        {
          q: "Can I see before-and-after photos of previous clients?",
          a: "Absolutely. Due to Meta's privacy guidelines, we cannot post all results publicly. Please contact us via Viber or WhatsApp (0995-260-3451) or visit our website, and we will be happy to share our portfolio with you.",
        },
      ],
    },
  ]

  const aftercareFAQs = [
    {
      q: "What activities should I avoid post-treatment?",
      a: "Generally, avoid strenuous exercise, swimming pools, saunas, and direct sun exposure for at least 24-48 hours.",
    },
    {
      q: "What products should I use/avoid during recovery?",
      a: "Use a gentle cleanser and moisturizer. Avoid harsh exfoliants or retinoids for 5-7 days. Always apply SPF 50 sunscreen daily.",
    },
    {
      q: "When should I schedule a follow-up?",
      a: "A follow-up is often scheduled 2-4 weeks post-treatment to assess results.",
    },
    {
      q: "What are the signs of complications?",
      a: "While rare, signs can include excessive pain, swelling, heat, pus, or fever. Please contact us immediately if you experience any of these symptoms.",
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
                <Heart className="w-4 h-4 text-[#d09d80] mr-2" />
                <span className="text-sm font-medium text-gray-700">Your Questions Answered</span>
              </div>

              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
                  Frequently Asked
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#fbc6c5] via-[#d09d80] to-[#fbc6c5] bg-clip-text text-transparent animate-gradient">
                  Questions
                </span>
              </h2>

              <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto">
                Find answers to common questions about our procedures, safety protocols, and what to expect during your
                <span className="font-semibold text-[#d09d80]"> beauty transformation journey</span>.
              </p>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                {[
                  {
                    icon: Shield,
                    title: "Safety First",
                    description: "FDA-approved materials & licensed professionals",
                    color: "from-[#fbc6c5] to-[#d09d80]",
                  },
                  {
                    icon: Award,
                    title: "Expert Care",
                    description: "Personalized treatments & aftercare support",
                    color: "from-[#d09d80] to-[#fbc6c5]",
                  },
                  {
                    icon: Users,
                    title: "Trusted by Thousands",
                    description: "10,000+ satisfied clients & growing",
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

        {/* General FAQs */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#fbc6c5]/20 to-[#d09d80]/20 backdrop-blur-sm rounded-full border border-[#fbc6c5]/30 mb-6">
                <Star className="w-4 h-4 text-[#d09d80] mr-2" />
                <span className="text-sm font-medium text-gray-700">Most Asked Questions</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  General Questions
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to know about our treatments, safety, and procedures
              </p>
            </div>

            <div className="max-w-6xl mx-auto space-y-8">
              {generalFAQs.map((category, categoryIndex) => (
                <Card
                  key={categoryIndex}
                  className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden group"
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-4 text-xl">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300`}
                      >
                        {category.icon}
                      </div>
                      <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        {category.category}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Accordion type="single" collapsible>
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem
                          key={faqIndex}
                          value={`general-${categoryIndex}-${faqIndex}`}
                          className="border-[#fbc6c5]/20"
                        >
                          <AccordionTrigger className="text-left font-semibold text-gray-800 py-4 hover:text-[#d09d80] transition-colors duration-300 hover:no-underline">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600 whitespace-pre-line leading-relaxed pb-4">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Aftercare Section */}
        <section className="py-20 bg-gradient-to-br from-[#fbc6c5]/10 via-[#fffaff] to-[#d09d80]/10 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#fbc6c5]/20 to-[#d09d80]/20 backdrop-blur-sm rounded-full border border-[#fbc6c5]/30 mb-6">
                  <Heart className="w-4 h-4 text-[#d09d80] mr-2" />
                  <span className="text-sm font-medium text-gray-700">Post-Treatment Care</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Aftercare &
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] bg-clip-text text-transparent">
                    Recovery
                  </span>
                </h3>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Essential post-treatment guidance for optimal results and speedy recovery
                </p>
              </div>

              <Card className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-4 text-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#fbc6c5] to-[#d09d80] rounded-2xl flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Recovery Guidelines
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Accordion type="single" collapsible>
                    {aftercareFAQs.map((faq, index) => (
                      <AccordionItem key={index} value={`aftercare-${index}`} className="border-[#fbc6c5]/20">
                        <AccordionTrigger className="text-left font-semibold text-gray-800 py-4 hover:text-[#d09d80] transition-colors duration-300 hover:no-underline">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 leading-relaxed pb-4">{faq.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <CardTitle className="flex items-center space-x-4 text-2xl">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <span>Important Notice</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-amber-800 mb-6 text-lg leading-relaxed">
                    If you experience any unusual symptoms or complications after your treatment, please contact us
                    immediately. Our team is available to address any concerns and provide appropriate guidance.
                  </p>
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
                    <Phone className="w-5 h-5 mr-3" />
                    Emergency Contact: 0995-260-3451
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Still Have Questions?</h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Our friendly team is here to help. Contact us for personalized answers and expert guidance on your beauty
              journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-[#d09d80] hover:bg-white/90 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-2xl"
              >
                <Phone className="w-5 h-5 mr-3" />
                Call 0995-260-3451
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-[#d09d80] bg-transparent px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-2xl"
              >
                Book Free Consultation
              </Button>
            </div>
          </div>
        </section>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </PullToRefresh>
  )
}
