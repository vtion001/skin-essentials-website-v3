"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Phone,
  MapPin,
  Clock,
  Star,
  Shield,
  Award,
  Users,
  Heart,
  CheckCircle,
  ArrowRight,
  Stethoscope,
  GraduationCap,
  Target,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { SharedHeader } from "@/components/shared-header"

export default function AboutPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const teamMembers = [
    {
      name: "JC Hers",
      role: "Medical Director & Founder",
      specialization: "Aesthetic Medicine & Dermatology",
      experience: "15+ years",
      image: "https://res.cloudinary.com/dbviya1rj/image/upload/c_crop,g_face,h_400,w_400/v1754329770/820be4e7-a6c7-46d4-b522-c9dc3e39f194.png",
      credentials: ["Board Certified Dermatologist", "Aesthetic Medicine Specialist", "FDA-Certified Injector"],
    },
  ]

  const values = [
    {
      icon: <Shield className="w-8 h-8 text-[#d09d80]" />,
      title: "Safety First",
      description: "We prioritize your safety with FDA-approved materials and sterile procedures performed by licensed professionals.",
    },
    {
      icon: <Heart className="w-8 h-8 text-[#d09d80]" />,
      title: "Personalized Care",
      description: "Every treatment is customized to your unique needs and aesthetic goals for natural-looking results.",
    },
    {
      icon: <Award className="w-8 h-8 text-[#d09d80]" />,
      title: "Excellence",
      description: "We maintain the highest standards in medical aesthetics with continuous training and advanced techniques.",
    },
    {
      icon: <Users className="w-8 h-8 text-[#d09d80]" />,
      title: "Client-Centered",
      description: "Your comfort, satisfaction, and confidence are at the heart of everything we do.",
    },
  ]

  const achievements = [
    { number: "5000+", label: "Happy Clients" },
    { number: "15+", label: "Years Experience" },
    { number: "50+", label: "Procedures Mastered" },
    { number: "98%", label: "Satisfaction Rate" },
  ]

  return (
    <PullToRefresh>
      <div className="min-h-screen bg-[#fffaff] dark:bg-gray-950 pb-20 md:pb-0 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-16 left-10 w-32 h-32 bg-gradient-to-br from-[#fbc6c5]/20 to-[#d09d80]/20 dark:from-[#fbc6c5]/10 dark:to-[#d09d80]/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#d09d80]/30 to-[#fbc6c5]/30 dark:from-[#d09d80]/20 dark:to-[#fbc6c5]/20 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-[#fbc6c5]/10 to-[#d09d80]/10 dark:from-[#fbc6c5]/5 dark:to-[#d09d80]/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        {/* Shared Header */}
        <SharedHeader showBackButton={true} backHref="/" />

        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 relative z-10">
          <div className="container mx-auto text-center">
            <Badge className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white mb-6 px-6 py-2 text-sm font-semibold">
              About Skin Essentials by HER
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Your Trusted Partner in
              <span className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] bg-clip-text text-transparent block">
                Beauty Enhancement
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              At Skin Essentials by HER, we believe that everyone deserves to feel confident and beautiful. Our team of licensed medical professionals is dedicated to providing safe, effective, and personalized aesthetic treatments.
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Founded with a passion for helping people achieve their aesthetic goals, Skin Essentials by HER has been at the forefront of non-surgical beauty enhancements in Quezon City. Our journey began with a simple mission: to provide safe, effective, and affordable aesthetic treatments that enhance natural beauty.
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Over the years, we have built a reputation for excellence, combining advanced medical techniques with personalized care. Our state-of-the-art facility and experienced team ensure that every client receives the highest quality treatment in a comfortable and professional environment.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-[#d09d80]">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-semibold">FDA-Approved Materials</span>
                  </div>
                  <div className="flex items-center text-[#d09d80]">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Licensed Professionals</span>
                  </div>
                  <div className="flex items-center text-[#d09d80]">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Personalized Care</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-[#fbc6c5] to-[#d09d80] rounded-3xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                  <p className="mb-6 leading-relaxed">
                    To empower individuals to feel confident and beautiful through safe, effective, and personalized aesthetic treatments that enhance their natural beauty.
                  </p>
                  <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                  <p className="leading-relaxed">
                    To be the leading provider of non-surgical aesthetic treatments, setting the standard for safety, quality, and client satisfaction in the Philippines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4 bg-white/50 dark:bg-white/10">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Core Values</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                These principles guide everything we do and ensure the highest quality of care for our clients.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center border-[#fbc6c5]/20 hover:shadow-lg transition-all duration-300 group dark:bg-gray-900/60 dark:border-gray-800">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#fbc6c5]/20 to-[#d09d80]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Meet Our Expert Team</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our team of licensed medical professionals brings years of experience and expertise to every treatment.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="max-w-sm w-full">
                {teamMembers.map((member, index) => (
                  <Card key={index} className="border-[#fbc6c5]/20 hover:shadow-xl transition-all duration-300 group overflow-hidden dark:bg-gray-900/60 dark:border-gray-800">
                    <div className="relative">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={400}
                        height={400}
                        className="w-full h-90 object-cover group-hover:scale-95 transition-transform duration-300"
                        style={{ objectPosition: "center 60%" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{member.name}</h3>
                      <p className="text-[#d09d80] font-semibold mb-2">{member.role}</p>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">{member.specialization}</p>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        {member.experience} Experience
                      </div>
                      <div className="space-y-2">
                        {member.credentials.map((credential, credIndex) => (
                          <div key={credIndex} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-3 h-3 text-[#d09d80] mr-2 flex-shrink-0" />
                            {credential}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Achievements</h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Numbers that reflect our commitment to excellence and client satisfaction.
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2">{achievement.number}</div>
                  <div className="text-lg opacity-90">{achievement.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Ready to Begin Your Journey?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Schedule your complimentary consultation today and let our expert team create a personalized treatment plan for your aesthetic goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                variant="brand"
                size="lg"
                className="px-8 py-4 text-lg font-semibold rounded-2xl"
              >
                <Phone className="w-5 h-5 mr-3" />
                Book Free Consultation
              </Button>
              <Link href="/portfolio">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-brand-tan text-brand-tan hover:bg-brand-tan hover:text-white px-8 py-4 text-lg font-semibold rounded-2xl"
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