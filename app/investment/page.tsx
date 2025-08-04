import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, ArrowLeft, TrendingUp, Shield, FileText, DollarSign, Users, BarChart3 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function InvestmentPage() {
  const investmentTiers = [
    {
      amount: "₱100,000",
      returns: "1.5% per procedure",
      description: "Entry-level investment with steady returns",
      features: [
        "1.5% return per procedure",
        "Notarized contract protection",
        "Monthly transparent reports",
        "Capital returned after 10 months",
      ],
    },
    {
      amount: "₱250,000",
      returns: "2% on 2 filler procedures",
      description: "Mid-tier investment focusing on popular filler treatments",
      features: [
        "2% return on filler procedures",
        "Priority on high-demand services",
        "Detailed monthly analytics",
        "Full capital protection",
        "Quarterly performance reviews",
      ],
      popular: true,
    },
    {
      amount: "₱500,000",
      returns: "3% on all filler procedures",
      description: "Premium investment tier with maximum returns",
      features: [
        "3% return on ALL filler procedures",
        "Highest earning potential",
        "VIP investor status",
        "Weekly performance updates",
        "Direct communication with management",
        "First access to new investment opportunities",
      ],
    },
  ]

  const benefits = [
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "Passive Income",
      description: "Earn consistent returns without active involvement in daily operations",
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Capital Protection",
      description: "Your investment is secured by notarized contracts and returned after 10 months",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      title: "Transparent Reporting",
      description: "Receive detailed monthly reports showing your returns and business performance",
    },
    {
      icon: <Users className="w-8 h-8 text-rose-600" />,
      title: "Growing Market",
      description: "Beauty and aesthetics industry continues to expand with increasing demand",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-rose-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <ArrowLeft className="w-5 h-5 text-rose-600" />
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/skinessentials-logo.png"
                  alt="Skin Essentials by HER"
                  width={120}
                  height={60}
                  className="h-10 w-auto object-contain"
                />
              </div>
            </Link>
            <Button className="bg-rose-600 hover:bg-rose-700">
              <Phone className="w-4 h-4 mr-2" />
              Inquire Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Invest in the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
              Beauty Industry
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Earn passive income by investing in our most popular services. We offer a transparent, secure, and
            profitable partnership with guaranteed capital protection.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Secured Investment</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Notarized Contracts</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Guaranteed Returns</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-rose-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2">1. Choose Your Investment</h4>
              <p className="text-gray-600">
                Select from our three investment tiers based on your budget and expected returns.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-rose-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2">2. Secure Contract</h4>
              <p className="text-gray-600">
                Sign a notarized contract that protects your investment and guarantees returns.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-rose-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2">3. Earn Returns</h4>
              <p className="text-gray-600">
                Receive percentage returns from each procedure plus full capital back after 10 months.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Tiers */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">Investment Tiers</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {investmentTiers.map((tier, index) => (
              <Card
                key={index}
                className={`relative hover:shadow-lg transition-shadow ${tier.popular ? "border-rose-300 shadow-lg" : "border-rose-100"}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-rose-600 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">{tier.amount}</CardTitle>
                  <CardDescription className="text-lg font-semibold text-rose-600">{tier.returns}</CardDescription>
                  <p className="text-gray-600 mt-2">{tier.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-6 ${tier.popular ? "bg-rose-600 hover:bg-rose-700" : "bg-gray-600 hover:bg-gray-700"}`}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Invest With Us?</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h4 className="font-semibold text-lg mb-2">{benefit.title}</h4>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Details */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-blue-100 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-blue-900">Investment Security & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Investor Protection</h4>
                  <ul className="space-y-2 text-blue-800">
                    <li>• Notarized legal contracts</li>
                    <li>• Full capital protection guarantee</li>
                    <li>• Transparent monthly reporting</li>
                    <li>• 10-month investment term</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Business Advantages</h4>
                  <ul className="space-y-2 text-blue-800">
                    <li>• Established client base</li>
                    <li>• Growing beauty industry</li>
                    <li>• Proven business model</li>
                    <li>• Professional management team</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Limited Availability */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-amber-900 mb-4">Limited Slots Available</h3>
              <p className="text-amber-800 mb-6">
                We only accept a limited number of investors to ensure optimal returns for all partners. Contact us
                directly for a detailed investment proposal and to secure your slot.
              </p>
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white">
                <Phone className="w-5 h-5 mr-2" />
                Request Investment Proposal
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Earning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our investment program and start earning passive income from the growing beauty industry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-green-600 hover:bg-white/90">
              <Phone className="w-5 h-5 mr-2" />
              Call 0995-260-3451
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600 bg-transparent"
            >
              Download Investment Guide
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
