"use client"

import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Phone,
  MapPin,
  Clock,
  Star,
  Shield,
  Award,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle,
  Play,
  Quote,
  Heart,
  Facebook,
  Instagram,
  Stethoscope,
  Cpu,
  DollarSign,
  Building2,
  Headphones,
  Target,
  Rocket,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { SharedHeader } from "@/components/shared-header"
import { BookingModal } from "@/components/booking-modal"
import { ScrollAnimation } from "@/components/scroll-animation"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import SplitType from "split-type"

export default function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const heroVideoUrl = "https://res.cloudinary.com/dbviya1rj/video/upload/v1766267101/v2httaofqjgsxkgsoqvm.mov"
  const [heroVideoError, setHeroVideoError] = useState(false)
  const headingRef = useRef<HTMLDivElement>(null)

  // GSAP SplitText Animation
  useGSAP(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger)
    }
    if (!headingRef.current) {
      console.log("Heading ref not found")
      return
    }

    let split: SplitType | null = null
    let animation: gsap.core.Tween | null = null

    function setup() {
      split && split.revert()
      animation && animation.revert()
      
      try {
        split = new SplitType(".hero-heading", { types: "chars,words,lines" })
        
        console.log("SplitText created:", split)
        console.log("Characters found:", split?.chars?.length)
        
        // Ensure parent is visible first
        gsap.set(".hero-heading", { opacity: 1, visibility: 'visible' })
        
        // Set initial state for all characters - right and invisible
        if (split.chars && split.chars.length > 0) {
          console.log("Setting initial character state")
          gsap.set(split.chars, {
            x: 150,
            opacity: 0
          })

          // Animate characters in from right to left with stagger
          animation = gsap.to(split.chars, {
            x: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power4",
            stagger: 0.04,
            scrollTrigger: {
              trigger: ".hero-heading",
              start: "top 80%",
              once: true,
              markers: false
            },
            onStart: () => {
              console.log("Animation started")
            }
          })
        } else {
          console.log("No characters found, fallback to direct animation")
          // Fallback for when SplitText doesn't work
          gsap.from(".hero-heading", {
            opacity: 0,
            y: 50,
            duration: 0.7,
            ease: "power4",
            scrollTrigger: {
              trigger: ".hero-heading",
              start: "top 80%",
              once: true
            }
          })
        }
      } catch (error) {
        console.log("SplitText error:", error)
        // Fallback: ensure entire heading is visible
        const headingElement = document.querySelector(".hero-heading")
        if (headingElement) {
          gsap.set(headingElement, { opacity: 1, visibility: 'visible' })
        }
      }
    }

    // Initial setup
    setup()

    // Handle resize with debouncing
    let resizeTimer: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        setup()
      }, 250)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(resizeTimer)
      split?.revert()
      animation?.revert()
    }
  }, { scope: headingRef })

  const mainServices = [
    {
      name: "Thread Lifts",
      description: "Non-surgical face and nose lifting using PDO/PCL threads",
      image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758859267/bbecd5de-3bea-4490-8fef-144ca997ed41.png?height=300&width=400&text=Thread+Lift",
      treatments: ["Hiko Nose Lift", "Face Thread Lift", "Neck Thread Lift"],
      href: "/hiko-nose-lift",
    },
    {
      name: "Dermal Fillers",
      description: "Hyaluronic acid fillers for face, lips, and body enhancement",
      image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758859335/f380e512-53bd-4501-81e3-685818b51001.png?height=300&width=400&text=Dermal+Fillers",
      treatments: ["Lip Fillers", "Cheek Fillers", "Butt Fillers"],
      href: "/services#dermal-fillers",
    },
    {
      name: "Laser Treatments",
      description: "Advanced laser technology for hair removal and skin rejuvenation",
      image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758859399/31549a56-c2be-4517-81e3-9b866a9a1a23.png?height=300&width=400&text=Laser+Treatment",
      treatments: ["Hair Removal", "Pico Laser", "Tattoo Removal"],
      href: "/services#laser-treatments",
    },
    {
      name: "Skin Rejuvenation",
      description: "Medical-grade treatments for youthful, glowing skin",
      image: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758859466/3ae3dd78-09b7-474a-86af-6ff7df610626.png?height=300&width=400&text=Skin+Treatment",
      treatments: ["Vampire Facial", "Thermage", "Stem Cell Boosters"],
      href: "/services#skin-treatments",
    },
  ]

  const [visibleCards, setVisibleCards] = useState<boolean[]>(Array(mainServices.length).fill(false))

  // Intersection Observer for card animations
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    mainServices.forEach((_, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleCards(prev => {
                const newVisible = [...prev]
                newVisible[index] = true
                return newVisible
              })
            }
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      )

      const element = document.getElementById(`service-card-${index}`)
      if (element) {
        observer.observe(element)
        observers.push(observer)
      }
    })

    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [])

  const whyChooseUs = [
    {
      icon: Shield,
      title: "FDA-Approved Materials",
      description:
        "We exclusively use premium, medical-grade products approved by the FDA for your safety and optimal results.",
    },
    {
      icon: Award,
      title: "Licensed Medical Professionals",
      description:
        "Our team consists of licensed medical professionals with extensive experience in aesthetic treatments.",
    },
    {
      icon: Heart,
      title: "Personalized Care",
      description:
        "Every treatment is tailored to your unique needs and goals, ensuring natural-looking results.",
    },
    {
      icon: MapPin,
      title: "Convenient Location",
      description: "Located in the heart of Quezon City, easily accessible with ample parking.",
    },
  ]

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <SharedHeader />

        {/* Booking Modal */}
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />

        {/* Main Content */}
        <main className="pt-20">
          {/* Hero Section */}
          <section className="relative pt-24 md:pt-28 lg:pt-32 pb-20 overflow-hidden">
            <div className="absolute inset-0 z-0">
              {heroVideoUrl && !heroVideoError ? (
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                  src={heroVideoUrl}
                  onError={() => setHeroVideoError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-rose/5 to-brand-tan/5"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent"></div>
            </div>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -left-24 w-48 h-48 bg-brand-rose/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-brand-tan/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.8s' }}></div>
              <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-gradient-to-r from-brand-rose to-brand-tan rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-gradient-to-r from-brand-tan to-brand-rose rounded-full animate-bounce" style={{ animationDelay: '1.1s' }}></div>
            </div>
            <div className="container mx-auto px-4 relative z-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-6rem)]">
                {/* Left Content */}
                <div className="space-y-6 lg:space-y-8 order-2 lg:order-1 overflow-visible">
                  <ScrollAnimation animation="fade-up" stagger={0.1} className="space-y-6 lg:space-y-8">
                    <div className="space-y-4 lg:space-y-6 mb-4 overflow-visible">
                      <Badge className="bg-brand-gradient text-white px-4 py-2 text-sm hover-lift">
                        3,000+ Confidence Transformations
                      </Badge>

                      <h1 ref={headingRef} className="hero-heading text-[clamp(1.875rem,3vw+1rem,3.25rem)] font-bold leading-relaxed">
                        <div className="text-gray-900">Discover Your Most Confident</div>
                        <div className="text-brand-gradient italic">Authentic Self</div>
                      </h1>

                      <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                        Experience personalized beauty treatments designed to reveal your natural radiance. FDA-approved procedures, expert medical care, and results that feel uniquely, beautifully you.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link href="/contact">
                        <Button
                          size="xl"
                          variant="brand"
                          className="px-8 py-4 text-lg font-semibold rounded-xl"
                        >
                          <Calendar className="w-5 h-5 mr-2" />
                          Book Free Consultation
                        </Button>
                      </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex items-center justify-center sm:justify-start space-x-6 lg:space-x-8 pt-4">
                      <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-gray-900">3,000+</div>
                        <div className="text-xs md:text-sm text-gray-600">Happy Clients</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-gray-900">28</div>
                        <div className="text-xs md:text-sm text-gray-600">Treatments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-gray-900">15+</div>
                        <div className="text-xs md:text-sm text-gray-600">Years Experience</div>
                      </div>
                    </div>
                  </ScrollAnimation>
                </div>

                {/* Right Content - Hero Image (hidden when video is present) */}
                {!heroVideoUrl && (
                  <div className="relative order-1 lg:order-2">
                    <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl lg:shadow-2xl">
                      <div className="aspect-[4/5] relative">
                        <Image
                          src="https://res.cloudinary.com/dbviya1rj/image/upload/v1758858583/n5uaxwv6udqpnut6fmot.jpg"
                          alt="Skin Essentials by HER Aesthetic Clinic Interior in Quezon City - Premier Hiko Nose Thread Lift and Beauty Treatments"
                          fill
                          className="object-cover"
                          priority
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    </div>

                    {/* Floating Elements - Hidden on mobile, visible on larger screens */}
                    <div className="hidden md:block absolute -top-4 lg:-top-6 -right-4 lg:-right-6 bg-white rounded-xl lg:rounded-2xl p-3 lg:p-4 shadow-xl z-10">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="w-10 lg:w-12 h-10 lg:h-12 bg-brand-gradient rounded-full flex items-center justify-center">
                          <Star className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm lg:text-base">4.9/5</div>
                          <div className="text-xs lg:text-sm text-gray-600">Client Rating</div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block absolute -bottom-4 lg:-bottom-6 -left-4 lg:-left-6 bg-white rounded-xl lg:rounded-2xl p-3 lg:p-4 shadow-xl z-10">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <Shield className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm lg:text-base">FDA Approved</div>
                          <div className="text-xs lg:text-sm text-gray-600">Materials Only</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-700 text-sm bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
              Scroll to explore
            </div>
          </section>

          {/* Services Section - Luxurious Checkerboard Layout */}
          <section className="relative overflow-hidden bg-white">
            <ScrollAnimation animation="fade-up" stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {/* Row 1 */}
              <div className="aspect-square relative overflow-hidden group">
                <Image
                  src="https://res.cloudinary.com/dbviya1rj/image/upload/v1766177517/Ads_Pin_oxhwqn.jpg"
                  alt="Premium Aesthetic"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              <div className="aspect-square flex flex-col items-center justify-center p-12 text-center bg-[#fbc6c5] text-white space-y-4">
                <h3 className="text-3xl font-serif italic text-brand-rose">Thread Lifts</h3>
                <p className="text-sm opacity-80 leading-relaxed">Advanced Hiko nose procedures and face contouring using premium PCL threads for natural elevation.</p>
                <Link href="/services#thread-lifts" className="text-xs uppercase tracking-[0.2em] font-bold border-b border-brand-rose pb-1 hover:text-brand-rose transition-colors">
                  Read More
                </Link>
              </div>
              <div className="aspect-square relative overflow-hidden group">
                <Image
                  src="https://res.cloudinary.com/dbviya1rj/image/upload/v1766177518/Aesthetic_Clinic_Picture_ifcih6.jpg"
                  alt="Skin Rejuvenation"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              <div className="aspect-square flex flex-col items-center justify-center p-12 text-center bg-[#fbc6c5] space-y-4">
                <h3 className="text-3xl font-serif italic text-[#3d1a11]">Botox</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Relax facial muscles and smooth fine lines with medical-grade neuromodulators for a refreshed look.</p>
                <Link href="/services#botox-treatments" className="text-xs uppercase tracking-[0.2em] font-bold border-b border-[#3d1a11] pb-1 hover:text-brand-tan transition-colors">
                  Read More
                </Link>
              </div>

              {/* Row 2 */}
              <div className="aspect-square flex flex-col items-center justify-center p-12 text-center bg-[#fffaff] space-y-4">
                <h3 className="text-3xl font-serif italic text-[#3d1a11]">Fillers</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Hyaluronic acid enhancement for lips, chin, and jawline to restore volume and youthful contours.</p>
                <Link href="/services#dermal-fillers" className="text-xs uppercase tracking-[0.2em] font-bold border-b border-[#3d1a11] pb-1 hover:text-brand-tan transition-colors">
                  Read More
                </Link>
              </div>
              <div className="aspect-square relative overflow-hidden group">
                <Image
                  src="https://res.cloudinary.com/dbviya1rj/image/upload/v1766177802/Reverse_Sagging_Skin_Ozempic_Mounjaro_in1ash.jpg"
                  alt="Dermal Treatment"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              <div className="aspect-square flex flex-col items-center justify-center p-12 text-center bg-brand-rose text-white space-y-4">
                <h3 className="text-3xl font-serif italic">Laser</h3>
                <p className="text-sm opacity-90 leading-relaxed">Advanced Diode and Pico laser technology for permanent hair removal and skin pigmentation correction.</p>
                <Link href="/services#laser-treatments" className="text-xs uppercase tracking-[0.2em] font-bold border-b border-white pb-1 hover:text-[#3d1a11] transition-colors">
                  Read More
                </Link>
              </div>
              <div className="aspect-square relative overflow-hidden group">
                <Image
                  src="https://res.cloudinary.com/dbviya1rj/image/upload/v1766177517/Asian_Woman_Premium_Photo_mfhnf4.jpg"
                  alt="Medical Care"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
            </ScrollAnimation>

            {/* Choose a treatment section below */}
            <div className="py-24 bg-white">
              <div className="container mx-auto px-4 text-center">
                <ScrollAnimation animation="fade-up" className="mb-16">
                  <h2 className="text-[clamp(2.25rem,4vw+1rem,3rem)] font-serif italic text-gray-900 mb-4 inline-block relative after:content-[''] after:absolute after:-bottom-4 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-[1px] after:bg-brand-tan">
                    Choose a treatment
                  </h2>
                </ScrollAnimation>

                <ScrollAnimation animation="fade-up" stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12 max-w-6xl mx-auto">
                  {[
                    {
                      title: "Face lift",
                      desc: "Advanced contouring and skin tensioning for a youthful, defined profile.",
                      svg: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 text-brand-tan group-hover:scale-110 transition-transform">
                          <path d="M15 4c-1.5 0-3 1-3.5 2.5S11 10 12 12s3 3 5 3" />
                          <path d="M9 8c-1.5 0-3 1.5-3.5 3.5S6 16 7.5 17.5 11 19 13 18.5" />
                          <path d="M18 6l3-3M19 9l3-3M20 12l3-3" strokeDasharray="2 2" />
                        </svg>
                      )
                    },
                    {
                      title: "Implant",
                      desc: "Surgical-grade enhancement procedures for natural-looking volume and shape.",
                      svg: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 text-brand-tan group-hover:scale-110 transition-transform">
                          <path d="M4 19c1-4 4-6 8-6s7 2 8 6" />
                          <circle cx="8" cy="13" r="3.5" />
                          <circle cx="16" cy="13" r="3.5" />
                          <path d="M16 13c0-2-1.5-3.5-3.5-3.5" strokeDasharray="2 2" />
                        </svg>
                      )
                    },
                    {
                      title: "Fillers",
                      desc: "Hyaluronic acid injections to restore volume and smooth deep facial lines.",
                      svg: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 text-brand-tan group-hover:scale-110 transition-transform">
                          <path d="M20 4l-6 6m6-6l-2 2m2-2l2 2M13 11l-2 2m2-2l-2-2m2 2l2 2M4 21a5 5 0 0 1 5-5.5 5 5 0 0 1 5 5.5" />
                          <path d="M11 9s-2-2-4-2-4 2-4 2" strokeDasharray="2 2" />
                        </svg>
                      )
                    },
                    {
                      title: "Rhinoplasty",
                      desc: "Precision reshaping of the nose for improved facial harmony and profile.",
                      svg: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 text-brand-tan group-hover:scale-110 transition-transform">
                          <path d="M10 4c0 4 1 7 3 9s5 3 5 5-2 3-5 3-5-1-5-3" />
                          <path d="M13 13c1 2 2 2.5 4 2.5" strokeDasharray="2 2" />
                        </svg>
                      )
                    },
                    {
                      title: "Eyes & eyelids",
                      desc: "Revitalizing treatments to address drooping lids and under-eye hollowing.",
                      svg: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 text-brand-tan group-hover:scale-110 transition-transform">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                          <circle cx="12" cy="12" r="3.5" />
                          <path d="M7 8.5c2-2 7-2 10 0" strokeDasharray="2 2" />
                        </svg>
                      )
                    },
                    {
                      title: "Lips",
                      desc: "Definition and volume enhancement for perfectly proportioned, soft lips.",
                      svg: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 text-brand-tan group-hover:scale-110 transition-transform">
                          <path d="M4 14.5c2-2 5-3 8-3s6 1 8 3c-2 3-5 5-8 5s-6-2-8-5z" />
                          <path d="M8 12.5c1-1 2-1.5 4-1.5s3 .5 4 1.5" strokeDasharray="2 2" />
                          <path d="M12 12v3" strokeDasharray="2 2" />
                        </svg>
                      )
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex space-x-6 text-left group">
                      <div className="flex-shrink-0 w-16 h-16 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-brand-rose/5 group-hover:border-brand-rose/30 transition-all duration-300">
                        {item.svg}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-brand-tan transition-colors">{item.title}</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </ScrollAnimation>
              </div>
            </div>
          </section>


          {/* About & Why Choose Us Section - Combined Layout */}
          <section className="py-24 relative overflow-hidden bg-white">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 -left-20 w-72 h-72 bg-brand-rose/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brand-tan/5 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
              {/* Top Row: Introduction with Capsule Images */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                {/* Left Column: Capsule Image Grid */}
                <div className="relative order-2 lg:order-1">
                  <ScrollAnimation animation="fade-up" stagger={0.2} className="grid grid-cols-2 gap-6 items-end">
                    <div className="space-y-6">
                      <div className="relative aspect-[3/4] rounded-full overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                        <Image
                          src="https://res.cloudinary.com/dbviya1rj/image/upload/v1766178228/Project_Ideas_Pin_g4caor.jpg"
                          alt="Aesthetic Treatment"
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="relative aspect-square rounded-full overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                        <Image
                          src="https://res.cloudinary.com/dbviya1rj/image/upload/v1766178228/Dermato_Pin_r994zz.jpg"
                          alt="Skin Treatment"
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-6 pb-12">
                      <div className="relative aspect-square rounded-full overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                        <Image
                          src="https://res.cloudinary.com/dbviya1rj/image/upload/v1766179153/Night_Mask_Myths_jguvms.jpg"
                          alt="Medical Team"
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          className="object-cover"
                          suppressHydrationWarning
                        />
                      </div>
                      <div className="relative aspect-[3/4] rounded-full overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                        <Image
                          src="https://res.cloudinary.com/dbviya1rj/image/upload/v1766178228/Exclude_These_Foods_for_Clear_Skin_yuqlhx.jpg"
                          alt="Clinic Interior"
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </ScrollAnimation>
                  {/* Decorative element */}
                  <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-gradient/5 rounded-full blur-3xl"></div>
                </div>

                {/* Right Column: Content */}
                <ScrollAnimation animation="fade-up" stagger={0.1} className="space-y-6 order-1 lg:order-2">
                  <div className="space-y-16 -mt-30">
                    <h3 className="text-brand-tan font-serif italic text-2xl">Beyond Beautiful</h3>
                    <h2 className="text-[clamp(2.25rem,4vw+1rem,3rem)] font-bold leading-tight text-gray-900">
                      Unveil Your Best Self with <span className="text-brand-gradient italic">Artistic Precision</span>
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-lg max-w-xl">
                      Located in the heart of Quezon City, Skin Essentials by HER combines medical expertise with artistic vision to deliver natural-looking results. We specialize in Hiko nose procedures and advanced beauty treatments.
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 mt-4">
                    {[
                      { icon: Stethoscope, title: "Qualified Doctors", desc: "Expert medical professionals" },
                      { icon: Award, title: "Certified Specialists", desc: "Highly trained team" },
                      { icon: Cpu, title: "Modern Technology", desc: "Advanced equipment" },
                      { icon: DollarSign, title: "Affordable Pricing", desc: "Premium value" },
                      { icon: Building2, title: "Verified Clinic", desc: "Safe & licensed" },
                      { icon: Headphones, title: "24/7 Support", desc: "Always here for you" },
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center space-x-4 group">
                        <div className="w-12 h-12 rounded-full bg-brand-rose/10 flex items-center justify-center group-hover:bg-brand-gradient transition-colors duration-300">
                          <feature.icon className="w-6 h-6 text-brand-tan group-hover:text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{feature.title}</h4>
                          <p className="text-xs text-gray-500">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-8 mt-8">
                    {/* Trust & Transformation Section */}
                    <div className="text-center mb-8 mt-0">
                      <h3 className="text-2xl font-serif italic text-gray-900 mb-3">Trusted by Thousands, Transforming Lives Daily</h3>
                      <p className="text-gray-600 max-w-2xl mx-auto">
                        With 28 specialized treatments and over 3,000 satisfied clients, our 97.8% satisfaction rate isn't just a number—it's your assurance of exceptional results and care.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-8 mt-8">
                      <div>
                        <div className="text-3xl font-bold text-gray-900">28 <span className="text-brand-tan"></span></div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Treatments</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-900">3000 <span className="text-brand-tan">+</span></div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Happy Clients</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-900">97.8 <span className="text-brand-tan">%</span></div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Satisfaction</div>
                      </div>
                    </div>
                  </div>
                </ScrollAnimation>
              </div>

              {/* Bottom Row: Why Choose Us & Vision/Mission */}
              <ScrollAnimation animation="fade-up" stagger={0.2} className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                {/* Left: Why Choose Us with Progress Bars */}
                <div className="space-y-10">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-gray-900">Why Must Choose Us</h2>
                    <p className="text-gray-600 max-w-md">Our commitment to excellence ensures that you receive the highest standard of aesthetic care tailored to your unique beauty goals.</p>
                  </div>

                  <div className="space-y-6">
                    {[
                      { label: "Skin Diagnosis", value: 97 },
                      { label: "Non-Surgical Procedures", value: 85 },
                      { label: "Hiko Nose Lift", value: 92 },
                      { label: "Client Satisfaction", value: 99 },
                    ].map((stat, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm font-bold text-gray-900">
                          <span>{stat.label}</span>
                          <span>{stat.value}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-gradient transition-all duration-1000 ease-out"
                            style={{ width: `${stat.value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link href="/contact">
                    <Button className="bg-brand-gradient hover:shadow-xl hover-lift text-white px-8 py-4 rounded-full text-lg font-bold mt-8">
                      Learn More
                    </Button>
                  </Link>
                </div>

                {/* Right: Vision & Mission Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="bg-[#fdf8f5] rounded-[4rem] p-10 space-y-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      To be the leading choice for natural enhancement, setting the standard for safe and artistic aesthetic procedures.
                    </p>
                    <Link href="/about" className="inline-flex items-center text-brand-tan font-bold text-sm hover:underline">
                      Read More +
                    </Link>
                  </div>

                  <div className="bg-[#d09d80] rounded-[4rem] p-10 space-y-6 text-center text-white shadow-xl transform lg:translate-y-12">
                    <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">Our Mission</h3>
                    <p className="text-gray-200/80 text-sm leading-relaxed">
                      Empowering individuals to feel confident in their skin through expert medical care and personalized treatment plans.
                    </p>
                    <Link href="/about" className="inline-flex items-center text-white/90 font-bold text-sm hover:underline">
                      Read More +
                    </Link>
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </section>

          {/* Testimonials - Luxurious Centered Layout */}
          <section className="py-32 bg-white">
            <div className="container mx-auto px-4">
              <ScrollAnimation animation="fade-up" className="text-center mb-20 space-y-4">
                <div className="text-gray-400 text-sm tracking-[0.3em] uppercase">Testimonials</div>
                <div className="w-12 h-[1px] bg-brand-tan/40 mx-auto"></div>
                <h2 className="text-[clamp(2.5rem,5vw+1rem,3.75rem)] font-serif italic text-gray-900 pt-2">
                  What Our Fantastic Clients Say
                </h2>
              </ScrollAnimation>

              <ScrollAnimation animation="fade-up" stagger={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 max-w-7xl mx-auto">
                {[
                  {
                    name: "Lexa Baby Garan",
                    treatment: "Hiko Nose Lift",
                    rating: 5,
                    avatar: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766188329/Screenshot_2025-12-20_at_7.51.36_AM_ffkjdv.png",
                    text: "Doc gumaganda shape nang face ko hehe!"
                  },
                  {
                    name: "Ura Esse",
                    treatment: "Endo Lift",
                    rating: 5,
                    avatar: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766188329/Screenshot_2025-12-20_at_7.51.26_AM_gkxaur.png",
                    text: "Super ganda nang endolift na side na gawa mo ma’am! Lumabas tangos nang ilong ko. "
                  },
                  {
                    name: "Jeric Bernardino ",
                    treatment: "Male Enhancement",
                    rating: 4,
                    avatar: "https://res.cloudinary.com/dbviya1rj/image/upload/v1766188329/Screenshot_2025-12-20_at_7.51.48_AM_l6utxo.png",
                    text: "Thank you Doc!! Ngayon ko lang na experience ganitong confidence. Worth it talaga!"
                  }
                ].map((testimonial, index) => (
                  <div key={index} className="flex flex-col items-center text-center group">
                    <div className="relative w-40 h-40 rounded-full overflow-hidden mb-8 shadow-2xl transition-all duration-700 group-hover:scale-105 border-4 border-white">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-3xl font-serif text-gray-900 mb-2">{testimonial.name}</h3>
                    <p className="text-xs font-bold text-brand-tan uppercase tracking-[0.2em] mb-6">Client</p>
                    <p className="text-gray-500 leading-relaxed text-sm max-w-[18rem] mb-8">
                      "{testimonial.text}"
                    </p>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < testimonial.rating ? 'text-gray-400 fill-gray-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollAnimation>
            </div>
          </section>






          {/* Mobile Bottom Navigation */}
        </main>
      </div>
    </>
  )
}
