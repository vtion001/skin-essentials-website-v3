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
      <div className="min-h-screen bg-white pb-20 md:pb-0 relative overflow-hidden">
        <SharedHeader showBackButton={true} backHref="/" />

        <main className="container mx-auto max-w-6xl px-4 pt-40 pb-32">
          {/* Oversized Header Section */}
          <div className="mb-24 text-center md:text-left">
            <h1 className="text-7xl md:text-[120px] font-bold tracking-tight text-gray-900 leading-none">
              FAQ<span className="text-[#d09d80]">.</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">

            {/* Left Column: Sidebar Labels */}
            <div className="md:col-span-3 space-y-8">
              <div className="space-y-2">
                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-900">Your questions.</p>
                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Our protocols.</p>
                <p className="text-[14px] tracking-[0.05em] font-medium text-gray-400">Expert guidance.</p>
              </div>

              <div className="pt-8 lg:sticky lg:top-48">
                <button
                  className="w-full text-[11px] font-bold tracking-[0.2em] text-gray-900 border border-gray-900 uppercase px-8 py-4 rounded-full hover:bg-gray-900 hover:text-white transition-all transform hover:scale-[1.02]"
                  onClick={() => window.location.href = "tel:09952603451"}
                >
                  Ask a Question
                </button>

                <div className="pt-12 space-y-6 hidden md:block">
                  <div className="space-y-2">
                    <p className="text-[11px] tracking-[0.2em] font-bold text-gray-900 uppercase">The Standard.</p>
                    <div className="space-y-1">
                      <p className="text-[10px] tracking-widest text-gray-400 uppercase">FDA-Approved</p>
                      <p className="text-[10px] tracking-widest text-gray-400 uppercase">Licensed Pros</p>
                      <p className="text-[10px] tracking-widest text-gray-400 uppercase">10k+ Clients</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Search + FAQ List */}
            <div className="md:col-span-9 space-y-16">

              {/* Search & Filter Bar */}
              <div className="space-y-8 border-b border-gray-100 pb-12">
                <div className="relative group">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#d09d80] transition-colors" />
                  <input
                    type="text"
                    placeholder="Search by treatment or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-200 py-6 pl-8 text-xl font-light focus:outline-none focus:border-[#d09d80] transition-all placeholder:text-gray-300"
                  />
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-all pb-2 border-b-2 ${selectedCategory === category
                        ? 'border-[#d09d80] text-gray-900'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ List */}
              <div className="divide-y divide-gray-100">
                {filteredFAQs.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-0">
                    {category.questions.map((faq, faqIndex) => (
                      <div key={faqIndex} className="py-12 first:pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6 md:gap-12">
                          <div className="space-y-6">
                            <div>
                              <span className="text-[10px] font-bold tracking-[0.25em] text-gray-400 uppercase block mb-1">Question.</span>
                              <span className="text-[9px] font-medium text-[#d09d80] uppercase tracking-widest bg-[#fbc6c5]/10 px-2 py-0.5 rounded">
                                {category.category}
                              </span>
                            </div>
                            <div className="hidden md:block pt-12">
                              <span className="text-[10px] font-bold tracking-[0.25em] text-gray-400 uppercase">Response.</span>
                            </div>
                          </div>

                          <div className="space-y-8">
                            <h3 className="text-xl md:text-2xl font-medium text-gray-900 leading-snug">
                              {faq.q}
                            </h3>

                            <div className="md:hidden">
                              <span className="text-[10px] font-bold tracking-[0.25em] text-gray-400 uppercase">Response.</span>
                            </div>

                            <div className="space-y-6">
                              <p className="text-base md:text-lg leading-relaxed text-gray-500 font-light whitespace-pre-wrap">
                                {faq.a}
                              </p>
                              <div className="flex items-center justify-between pt-4">
                                <span className="text-[10px] font-bold tracking-[0.2em] text-[#d09d80] uppercase">
                                  By Skin Essentials &reg;
                                </span>

                                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-300">
                                  <span>Helpful?</span>
                                  <button className="border border-gray-100 px-3 py-1 rounded hover:bg-gray-50 transition-colors uppercase tracking-widest">Yes</button>
                                  <button className="border border-gray-100 px-3 py-1 rounded hover:bg-gray-50 transition-colors uppercase tracking-widest">No</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {(filteredFAQs.length === 0 || filteredFAQs.every(s => s.questions.length === 0)) && (
                  <div className="py-20 text-center">
                    <p className="text-gray-400 font-light italic text-xl">
                      No results found for your search. Try a different term or browse our categories.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Section - Redesigned Editorial */}
          <div className="mt-32 pt-24 border-t border-gray-100">
            <div className="bg-[#fdf9f9] rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-xl space-y-6 text-center md:text-left">
                <div className="inline-flex items-center gap-2 text-red-500 scale-125 md:scale-100">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-[11px] tracking-[0.3em] font-bold uppercase">Emergency Notice.</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900 uppercase tracking-tight">
                  Experiencing complications<br />or unusual symptoms?
                </h2>
                <p className="text-gray-500 font-light leading-relaxed">
                  Safety is our priority. If you experience severe pain, excessive swelling, or any unusual reactions, contact our medical team immediately for guidance.
                </p>
              </div>
              <button
                className="bg-red-500 text-white px-12 py-5 rounded-full text-sm font-bold tracking-[0.2em] uppercase hover:bg-red-600 transition-all transform hover:scale-[1.02] shadow-xl shadow-red-200/50"
                onClick={() => window.location.href = "tel:09952603451"}
              >
                0995-260-3451
              </button>
            </div>
          </div>
        </main>

        <MobileNav />
      </div>
    </PullToRefresh>
  )
}
