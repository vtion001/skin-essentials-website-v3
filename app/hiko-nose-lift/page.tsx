"use client"

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
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { SharedHeader } from "@/components/shared-header"

export default function HikoNoseLiftPage() {
  const benefits = [
    "Immediate nose bridge enhancement",
    "No surgery or downtime required", 
    "Natural-looking results",
    "Stimulates collagen production",
    "FDA-approved PDO/PCL threads",
    "Licensed medical professionals",
    "1-2 years lasting results",
    "Affordable pricing at ₱9,999"
  ]

  const faqs = [
    {
      q: "What is a Hiko Nose Thread Lift?",
      a: "Hiko Nose Thread Lift is a non-surgical procedure that uses dissolvable PDO/PCL threads to instantly lift and define the nose bridge and tip for a more refined profile."
    },
    {
      q: "How long does the procedure take?",
      a: "The Hiko Nose Thread Lift procedure typically takes about 1 hour to complete, including consultation and preparation."
    },
    {
      q: "Does it hurt?",
      a: "The procedure involves minimal discomfort. We use topical anesthesia to ensure your comfort throughout the treatment."
    },
    {
      q: "How long do results last?",
      a: "Results from Hiko Nose Thread Lift typically last 1-2 years, as the threads gradually dissolve while stimulating natural collagen production."
    },
    {
      q: "Is there any downtime?",
      a: "There's minimal to no downtime. You may experience slight swelling or tenderness for 1-2 days, but you can return to normal activities immediately."
    },
    {
      q: "Am I a good candidate?",
      a: "Most people are good candidates for Hiko Nose Thread Lift. During your consultation, our medical professionals will assess your suitability for the procedure."
    }
  ]

  const beforeAfterImages = [
    {
      before: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758858520/thgaptaukyvwweysmawt.jpg",
      after: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758858517/rymvbcmiq248mvbilmcj.jpg",
      description: "Hiko Nose Thread Lift - Enhanced nose bridge definition"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <SharedHeader variant="default" />
      
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-28 lg:pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fbc6c5]/5 to-[#d09d80]/5"></div>
        <div className="container mx-auto px-4 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-4 lg:space-y-6">
                <Badge className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white px-4 py-2 text-sm">
                  #1 Hiko Nose Lift in Quezon City
                </Badge>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-gray-900">Hiko Nose Thread Lift</span>
                  <br />
                  <span className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] bg-clip-text text-transparent">
                    in Quezon City
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                  Get the perfect nose shape without surgery! Our Hiko Nose Thread Lift in Quezon City uses FDA-approved PDO/PCL threads for instant, natural-looking results. Starting at ₱9,999 with unlimited threads.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="brand"
                  size="lg"
                  className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl"
                >
                  <Calendar className="w-4 md:w-5 h-4 md:h-5 mr-2" />
                  Book Free Consultation
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl bg-transparent"
                >
                  <Phone className="w-4 md:w-5 h-4 md:h-5 mr-2" />
                  Call Now
                </Button>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl font-bold text-[#d09d80]">₱9,999</div>
                  <div className="text-sm text-gray-600">Starting Price</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl font-bold text-[#d09d80]">1 Hour</div>
                  <div className="text-sm text-gray-600">Procedure Time</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl font-bold text-[#d09d80]">1-2 Years</div>
                  <div className="text-sm text-gray-600">Results Last</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl font-bold text-[#d09d80]">No Downtime</div>
                  <div className="text-sm text-gray-600">Recovery</div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl lg:shadow-2xl">
                <div className="aspect-[4/5] relative">
                  <Image
                    src="https://res.cloudinary.com/dbviya1rj/image/upload/v1758858517/rymvbcmiq248mvbilmcj.jpg"
                    alt="Hiko Nose Thread Lift Results in Quezon City"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-[#fbc6c5]/10 text-[#d09d80] px-4 py-2 mb-4">Why Choose Our Hiko Nose Lift</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Benefits of Hiko Nose Thread Lift</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the advantages of non-surgical nose enhancement at Quezon City's premier aesthetic clinic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0">
                  <CheckCircle className="w-12 h-12 text-[#d09d80] mx-auto mb-4" />
                  <p className="font-semibold text-gray-900">{benefit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-[#fbc6c5]/10 text-[#d09d80] px-4 py-2 mb-4">Real Results</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Hiko Nose Lift Before & After</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See the amazing transformations achieved with our Hiko Nose Thread Lift procedure in Quezon City.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 max-w-4xl mx-auto">
            {beforeAfterImages.map((image, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="relative">
                      <Image
                        src={image.before}
                        alt="Before Hiko Nose Thread Lift"
                        width={400}
                        height={500}
                        className="w-full h-[400px] object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        BEFORE
                      </div>
                    </div>
                    <div className="relative">
                      <Image
                        src={image.after}
                        alt="After Hiko Nose Thread Lift"
                        width={400}
                        height={500}
                        className="w-full h-[400px] object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        AFTER
                      </div>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <p className="text-gray-600">{image.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-[#fbc6c5]/10 text-[#d09d80] px-4 py-2 mb-4">Common Questions</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Hiko Nose Lift FAQ</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get answers to frequently asked questions about Hiko Nose Thread Lift in Quezon City.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.q}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#fbc6c5] to-[#d09d80]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready for Your Hiko Nose Transformation?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Book your free consultation today at Quezon City's premier aesthetic clinic. Our licensed medical professionals are ready to help you achieve your dream nose shape.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-[#d09d80] hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Free Consultation
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-[#d09d80] px-8 py-4 text-lg font-semibold rounded-xl bg-transparent"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call (02) 8123-4567
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}