"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Phone, Shield, Clock, CreditCard, Camera, AlertTriangle, Heart, Star, Award, Users, Search, TrendingUp, Briefcase, Zap, Filter } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { SharedHeader } from "@/components/shared-header"

export default function FAQPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

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
        {
          q: "What age groups do you serve?",
          a: "We welcome clients aged 18 and above. For clients under 21, parental consent may be required for certain procedures. We provide age-appropriate treatments and consultations to ensure the best outcomes for each individual.",
        },
        {
          q: "Do you offer consultations?",
          a: "Yes! We offer comprehensive consultations to assess your needs, discuss treatment options, and create a personalized plan. Initial consultations help us understand your goals and ensure you're comfortable with the recommended procedures.",
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
        {
          q: "Are there package deals available?",
          a: "Yes! We offer various package deals that combine multiple treatments for better value. These packages are designed to provide comprehensive care while offering cost savings. Contact us to learn about current package options.",
        },
        {
          q: "What is your cancellation policy?",
          a: "We require at least 24 hours notice for cancellations or rescheduling. Late cancellations may be subject to a fee. We understand that emergencies happen, so please contact us as soon as possible if you need to change your appointment.",
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
        {
          q: "What should I bring to my appointment?",
          a: "Please bring a valid ID, any relevant medical history or medication lists, and comfortable clothing. If you're getting facial treatments, avoid wearing heavy makeup. For body treatments, wear loose, comfortable clothing.",
        },
        {
          q: "Can I eat before my procedure?",
          a: "Yes, we recommend having a light meal 1-2 hours before your appointment to maintain stable blood sugar levels. Avoid heavy meals immediately before treatment, but don't come on an empty stomach either.",
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
        {
          q: "How soon will I see results?",
          a: "Results vary by treatment type. Some treatments like dermal fillers show immediate results, while others like skin rejuvenation may take 2-4 weeks to show full effects. We'll provide specific timelines during your consultation.",
        },
        {
          q: "How long do results typically last?",
          a: "Treatment longevity varies: Botox lasts 3-6 months, dermal fillers 6-18 months, thread lifts 12-24 months, and skin treatments may require maintenance every 3-6 months. Individual results may vary based on lifestyle and skin type.",
        },
      ],
    },
  ]

  const serviceSpecificFAQs = [
    {
      category: "Thread Lifts & Face Contouring",
      icon: <Zap className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
      questions: [
        {
          q: "What is a PDO thread lift?",
          a: "PDO (Polydioxanone) thread lifts use biocompatible threads to lift and tighten sagging skin. The threads dissolve naturally over 6-8 months while stimulating collagen production for long-lasting results.",
        },
        {
          q: "Am I a good candidate for thread lifts?",
          a: "Thread lifts are ideal for clients with mild to moderate skin laxity who want a non-surgical facelift alternative. Best results are seen in clients aged 30-60 with good skin elasticity.",
        },
        {
          q: "What's the difference between different thread types?",
          a: "We offer various thread types: PDO threads for lifting, PCL threads for longer-lasting results, and PLLA threads for maximum collagen stimulation. Your practitioner will recommend the best option based on your needs.",
        },
      ],
    },
    {
      category: "Dermal Fillers & Volume Enhancement",
      icon: <Heart className="w-5 h-5" />,
      color: "from-rose-500 to-pink-500",
      questions: [
        {
          q: "What areas can be treated with dermal fillers?",
          a: "We can enhance lips, cheeks, under-eyes, jawline, chin, temples, and nasolabial folds. Fillers can also be used for non-surgical nose reshaping and hand rejuvenation.",
        },
        {
          q: "How do I choose the right filler?",
          a: "Different fillers work better for different areas. Hyaluronic acid fillers are versatile and reversible, while calcium hydroxylapatite provides structure. We'll recommend the best option during consultation.",
        },
        {
          q: "Can fillers be dissolved if I don't like the results?",
          a: "Yes! Hyaluronic acid fillers can be dissolved using hyaluronidase enzyme if needed. This provides peace of mind and allows for adjustments to achieve your desired look.",
        },
      ],
    },
    {
      category: "Investment Opportunities",
      icon: <Briefcase className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
      questions: [
        {
          q: "Do you offer franchise opportunities?",
          a: "Yes! Skin Essentials by HER offers franchise and partnership opportunities for qualified individuals. We provide comprehensive training, ongoing support, and proven business systems.",
        },
        {
          q: "What investment is required to start a franchise?",
          a: "Investment requirements vary by location and setup. We offer different partnership models to suit various budgets. Contact us for detailed investment information and franchise packages.",
        },
        {
          q: "What support do you provide to franchise partners?",
          a: "We provide complete training programs, marketing support, ongoing education, business development assistance, and access to our proven systems and protocols. Our goal is your success.",
        },
        {
          q: "What are the requirements to become a franchise partner?",
          a: "We look for partners with business experience, commitment to excellence, and alignment with our values. Medical background is preferred but not required as we provide comprehensive training.",
        },
      ],
    },
  ]

  const aftercareFAQs = [
    {
      category: "Aftercare & Recovery",
      icon: <Heart className="w-5 h-5" />,
      color: "from-[#d09d80] to-[#fbc6c5]",
      questions: [
        {
          q: "What should I expect after my procedure?",
          a: "You may experience mild swelling, redness, or tenderness for 1-3 days. These are normal reactions and will subside. We provide detailed aftercare instructions specific to your treatment.",
        },
        {
          q: "When can I return to normal activities?",
          a: "Most clients can resume normal activities immediately, though we recommend avoiding strenuous exercise for 24-48 hours. Specific guidelines will be provided based on your treatment.",
        },
        {
          q: "How do I care for the treated area?",
          a: "Keep the area clean and dry, avoid touching or massaging unless instructed, apply ice if there's swelling, and follow any specific aftercare instructions provided. Avoid makeup for 24 hours on treated facial areas.",
        },
        {
          q: "When should I schedule a follow-up?",
          a: "Follow-up appointments are typically scheduled 2-4 weeks after your initial treatment to assess results and determine if any touch-ups are needed. We'll schedule this during your visit.",
        },
        {
          q: "What products should I avoid after treatment?",
          a: "Avoid retinoids, AHA/BHA acids, vitamin C serums, and exfoliating products for 48-72 hours post-treatment. Also avoid saunas, steam rooms, and excessive heat exposure for the first week.",
        },
        {
          q: "Can I wear makeup after my treatment?",
          a: "For facial treatments, avoid makeup for at least 24 hours to prevent infection and allow proper healing. When you do resume makeup use, ensure all brushes and products are clean and sanitized.",
        },
        {
          q: "What are signs I should contact you immediately?",
          a: "Contact us immediately if you experience severe pain, excessive swelling that worsens after 48 hours, signs of infection (fever, pus, red streaking), or any unusual reactions. We're always available for post-treatment concerns.",
        },
        {
          q: "What can I do to optimize my results?",
          a: "Stay hydrated, follow a good skincare routine, protect your skin from sun exposure, maintain a healthy lifestyle, and attend all follow-up appointments. Consistency with aftercare instructions is key to optimal results.",
        },
      ],
    },
  ]

  // Combine all FAQ sections
  const allFAQs = [...generalFAQs, ...serviceSpecificFAQs, ...aftercareFAQs]

  // Get unique categories for filter
  const categories = ['All', ...new Set(allFAQs.map(section => section.category))]

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    let filtered = allFAQs

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(section => section.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.map(section => ({
        ...section,
        questions: section.questions.filter(
          (qa: { q: string; a: string }) => 
            qa.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            qa.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => section.questions.length > 0)
    }

    return filtered
  }, [searchQuery, selectedCategory])

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

              {/* Search and Filter Section */}
              <div className="max-w-4xl mx-auto mb-12">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-[#fbc6c5]/20 p-4 md:p-6">
                  <div className="flex flex-col gap-4">
                    {/* Search Input */}
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                      <Input
                        type="text"
                        placeholder="Search FAQs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-3 w-full border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fbc6c5] focus:border-transparent bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                    
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap ${
                            selectedCategory === category
                              ? 'bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white shadow-lg'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {category === 'All' && <Filter className="w-3 h-3 sm:w-4 sm:h-4" />}
                          {category === 'Investment Opportunities' && <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />}
                          {category === 'Thread Lifts & Face Contouring' && <Zap className="w-3 h-3 sm:w-4 sm:h-4" />}
                          {category === 'Dermal Fillers & Volume Enhancement' && <Heart className="w-3 h-3 sm:w-4 sm:h-4" />}
                          <span className="truncate max-w-[120px] sm:max-w-none">{category}</span>
                        </button>
                      ))}
                    </div>
                    
                    {/* Results Count */}
                    <div className="text-sm text-gray-500 text-center sm:text-left">
                      {filteredFAQs.reduce((total, section) => total + section.questions.length, 0)} questions found
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-16">
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
                    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 lg:p-8 border border-[#fbc6c5]/20 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500 hover:bg-white/80 h-full flex flex-col">
                      <div
                        className={`w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-4 lg:mb-6 mx-auto group-hover:rotate-6 transition-transform duration-300 flex-shrink-0`}
                      >
                        <item.icon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-3 text-lg text-center break-words">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-center text-sm lg:text-base break-words flex-1">{item.description}</p>
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
              {filteredFAQs.map((category, categoryIndex) => (
                <Card
                  key={categoryIndex}
                  className="bg-white/60 backdrop-blur-sm border border-[#fbc6c5]/20 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden group"
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-4 text-lg sm:text-xl">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300 flex-shrink-0`}
                      >
                        {category.icon}
                      </div>
                      <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent break-words min-w-0 flex-1">
                        {category.category}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 sm:px-6">
                    <Accordion type="single" collapsible>
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem
                          key={faqIndex}
                          value={`faq-${categoryIndex}-${faqIndex}`}
                          className="border-[#fbc6c5]/20"
                        >
                          <AccordionTrigger className="text-left font-semibold text-gray-800 py-4 hover:text-[#d09d80] transition-colors duration-300 hover:no-underline text-sm sm:text-base break-words hyphens-auto">
                            <span className="pr-2 leading-relaxed">{faq.q}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600 leading-relaxed pb-4 text-sm sm:text-base">
                            <div className="whitespace-pre-wrap break-words hyphens-auto max-w-none overflow-wrap-anywhere">
                              {faq.a}
                            </div>
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



        {/* Emergency Contact */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <CardTitle className="flex items-center space-x-4 text-xl sm:text-2xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="break-words min-w-0 flex-1">Important Notice</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  <p className="text-amber-800 mb-6 text-base sm:text-lg leading-relaxed break-words">
                    If you experience any unusual symptoms or complications after your treatment, please contact us
                    immediately. Our team is available to address any concerns and provide appropriate guidance.
                  </p>
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white w-full py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="break-words">Emergency Contact: 0995-260-3451</span>
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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 break-words">Still Have Questions?</h2>
            <p className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed break-words">
              Our friendly team is here to help. Contact us for personalized answers and expert guidance on your beauty
              <span className="font-semibold"> transformation journey</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center max-w-2xl mx-auto">
              <Button
                size="lg"
                variant="secondary"
                className="text-[#d09d80] hover:bg-white/90 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-2xl w-full sm:w-auto"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="break-words">Call 0995-260-3451</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-[#d09d80] bg-transparent px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-2xl w-full sm:w-auto"
              >
                <span className="break-words">Book Free Consultation</span>
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
