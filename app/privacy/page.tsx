"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Shield,
  Lock,
  Eye,
  Users,
  FileText,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Download,
  Trash2,
  UserCheck,
  Globe,
  Cookie,
  Database,
  Share2,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { SharedHeader } from "@/components/shared-header"
import { PullToRefresh } from "@/components/pull-to-refresh"

export default function PrivacyPolicyPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
      
      // Update active section based on scroll position
      const sections = document.querySelectorAll("section[id]")
      const scrollPosition = window.scrollY + 100

      sections.forEach((section) => {
        const element = section as HTMLElement
        const offsetTop = element.offsetTop
        const offsetHeight = element.offsetHeight

        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveSection(element.id)
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const tableOfContents = [
    { id: "overview", title: "Privacy Policy Overview", icon: Shield },
    { id: "data-collection", title: "Data Collection Practices", icon: Database },
    { id: "data-usage", title: "How We Use Your Information", icon: Settings },
    { id: "cookies", title: "Cookie Usage", icon: Cookie },
    { id: "third-party", title: "Third-Party Sharing", icon: Share2 },
    { id: "data-security", title: "Data Security Measures", icon: Lock },
    { id: "user-rights", title: "Your Rights & Controls", icon: UserCheck },
    { id: "retention", title: "Data Retention", icon: Clock },
    { id: "international", title: "International Transfers", icon: Globe },
    { id: "updates", title: "Policy Updates", icon: FileText },
    { id: "contact", title: "Contact Information", icon: Mail },
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <PullToRefresh>
      <div className="min-h-screen bg-gradient-to-br from-white via-[#fef7f7] to-[#fdf2f8]">
        <SharedHeader showBackButton backHref="/" />
        
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] rounded-full mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Privacy Policy
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Your privacy is important to us. This policy explains how Skin Essentials by HER 
                collects, uses, and protects your personal information.
              </p>
              <div className="flex items-center justify-center mt-6 text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-7xl px-4 pb-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Table of Contents - Sidebar */}
            <div className="lg:w-1/4">
              <div className="sticky top-28">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-[#d09d80]" />
                      Table of Contents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <nav className="space-y-2">
                      {tableOfContents.map((item) => {
                        const Icon = item.icon
                        return (
                          <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center text-sm ${
                              activeSection === item.id
                                ? "bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] text-white shadow-md"
                                : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                            <span className="leading-tight">{item.title}</span>
                          </button>
                        )
                      })}
                    </nav>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="space-y-8">
                
                {/* Privacy Policy Overview */}
                <section id="overview">
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                        <Shield className="w-6 h-6 mr-3 text-[#d09d80]" />
                        Privacy Policy Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        At Skin Essentials by HER, we are committed to protecting your privacy and ensuring 
                        the security of your personal information. This Privacy Policy explains how we collect, 
                        use, disclose, and safeguard your information when you visit our clinic, use our services, 
                        or interact with our website.
                      </p>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-400">
                        <div className="flex items-start">
                          <AlertTriangle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-2">Important Notice</h4>
                            <p className="text-blue-800 text-sm">
                              By using our services or providing us with your personal information, you consent 
                              to the collection and use of information in accordance with this policy.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Data Collection Practices */}
                <section id="data-collection">
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                        <Database className="w-6 h-6 mr-3 text-[#d09d80]" />
                        Data Collection Practices
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                            Information We Collect
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                              <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Full name and contact details</li>
                                <li>• Date of birth and age</li>
                                <li>• Email address and phone number</li>
                                <li>• Home address</li>
                                <li>• Emergency contact information</li>
                              </ul>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Medical Information</h4>
                              <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Medical history and conditions</li>
                                <li>• Current medications and allergies</li>
                                <li>• Treatment records and progress</li>
                                <li>• Before and after photographs</li>
                                <li>• Consultation notes</li>
                              </ul>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Technical Information</h4>
                              <ul className="text-sm text-gray-700 space-y-1">
                                <li>• IP address and browser type</li>
                                <li>• Device information</li>
                                <li>• Website usage patterns</li>
                                <li>• Cookies and tracking data</li>
                                <li>• Social media interactions</li>
                              </ul>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Financial Information</h4>
                              <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Payment method details</li>
                                <li>• Billing address</li>
                                <li>• Transaction history</li>
                                <li>• Insurance information</li>
                                <li>• Payment preferences</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* How We Use Your Information */}
                <section id="data-usage">
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                        <Settings className="w-6 h-6 mr-3 text-[#d09d80]" />
                        How We Use Your Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Treatment & Care</h4>
                                <p className="text-sm text-gray-600">Providing medical and aesthetic treatments, maintaining medical records, and ensuring continuity of care.</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Mail className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Communication</h4>
                                <p className="text-sm text-gray-600">Sending appointment reminders, treatment updates, and important health information.</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Settings className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Service Improvement</h4>
                                <p className="text-sm text-gray-600">Analyzing usage patterns to improve our services and website functionality.</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Legal Compliance</h4>
                                <p className="text-sm text-gray-600">Meeting regulatory requirements and maintaining proper medical documentation.</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4 text-pink-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Marketing</h4>
                                <p className="text-sm text-gray-600">Sending promotional materials and updates about new services (with your consent).</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Shield className="w-4 h-4 text-red-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Security</h4>
                                <p className="text-sm text-gray-600">Protecting against fraud, unauthorized access, and ensuring clinic security.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Cookie Usage */}
                <section id="cookies">
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                        <Cookie className="w-6 h-6 mr-3 text-[#d09d80]" />
                        Cookie Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <p className="text-gray-700">
                          We use cookies and similar tracking technologies to enhance your browsing experience 
                          and analyze website traffic. Here's how we use different types of cookies:
                        </p>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-900 mb-2">Essential Cookies</h4>
                            <p className="text-sm text-green-800">Required for basic website functionality, security, and user authentication.</p>
                            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">Always Active</Badge>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">Analytics Cookies</h4>
                            <p className="text-sm text-blue-800">Help us understand how visitors interact with our website to improve user experience.</p>
                            <Badge variant="outline" className="mt-2 border-blue-300 text-blue-800">Optional</Badge>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-medium text-purple-900 mb-2">Marketing Cookies</h4>
                            <p className="text-sm text-purple-800">Used to deliver relevant advertisements and track campaign effectiveness.</p>
                            <Badge variant="outline" className="mt-2 border-purple-300 text-purple-800">Optional</Badge>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Managing Cookie Preferences</h4>
                          <p className="text-sm text-gray-700 mb-3">
                            You can control cookie settings through your browser preferences or our cookie consent banner. 
                            Note that disabling certain cookies may affect website functionality.
                          </p>
                          <Button variant="outline" size="sm" className="border-[#d09d80] text-[#d09d80] hover:bg-[#d09d80] hover:text-white">
                            <Settings className="w-4 h-4 mr-2" />
                            Manage Cookie Preferences
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Third-Party Sharing */}
                <section id="third-party">
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                        <Share2 className="w-6 h-6 mr-3 text-[#d09d80]" />
                        Third-Party Sharing Policies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                          <div className="flex items-start">
                            <Shield className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-red-900 mb-2">Our Commitment</h4>
                              <p className="text-red-800 text-sm">
                                We do not sell, trade, or rent your personal information to third parties. 
                                Your medical information is strictly confidential and protected by law.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Limited Sharing Scenarios</h3>
                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Healthcare Providers</h4>
                                <p className="text-sm text-gray-600">With your consent, we may share medical information with referring doctors or specialists involved in your care.</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Legal Requirements</h4>
                                <p className="text-sm text-gray-600">When required by law, court order, or regulatory authorities for legal compliance.</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Settings className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Service Providers</h4>
                                <p className="text-sm text-gray-600">Trusted third-party services (payment processors, appointment systems) under strict confidentiality agreements.</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Emergency Situations</h4>
                                <p className="text-sm text-gray-600">In medical emergencies where disclosure is necessary to protect your health and safety.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Data Security Measures */}
                <section id="data-security">
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                        <Lock className="w-6 h-6 mr-3 text-[#d09d80]" />
                        Data Security Measures
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <p className="text-gray-700">
                          We implement comprehensive security measures to protect your personal and medical information 
                          from unauthorized access, disclosure, alteration, or destruction.
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Technical Safeguards</h3>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700">SSL/TLS encryption for data transmission</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700">Encrypted database storage</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700">Regular security updates and patches</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700">Firewall and intrusion detection systems</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700">Multi-factor authentication</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Physical & Administrative</h3>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700">Secure facility access controls</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700">Staff privacy training and agreements</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700">Regular security audits and assessments</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700">Secure document disposal procedures</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700">Incident response and breach protocols</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                            <Shield className="w-4 h-4 mr-2" />
                            Data Breach Response
                          </h4>
                          <p className="text-sm text-blue-800">
                            In the unlikely event of a data breach, we will notify affected individuals and relevant 
                            authorities within 72 hours as required by law, and take immediate steps to secure the data 
                            and prevent further unauthorized access.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Your Rights & Controls */}
                <section id="user-rights">
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                        <UserCheck className="w-6 h-6 mr-3 text-[#d09d80]" />
                        Your Rights & Controls
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <p className="text-gray-700">
                          You have several rights regarding your personal information. We are committed to helping 
                          you exercise these rights in accordance with applicable privacy laws.
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <Eye className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                                <div>
                                  <h4 className="font-medium text-blue-900">Right to Access</h4>
                                  <p className="text-sm text-blue-800 mt-1">Request a copy of the personal information we hold about you.</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <Settings className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                <div>
                                  <h4 className="font-medium text-green-900">Right to Rectification</h4>
                                  <p className="text-sm text-green-800 mt-1">Request correction of inaccurate or incomplete information.</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <Trash2 className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                                <div>
                                  <h4 className="font-medium text-red-900">Right to Erasure</h4>
                                  <p className="text-sm text-red-800 mt-1">Request deletion of your personal data (subject to legal requirements).</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <Download className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                <div>
                                  <h4 className="font-medium text-purple-900">Right to Portability</h4>
                                  <p className="text-sm text-purple-800 mt-1">Receive your data in a structured, machine-readable format.</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <AlertTriangle className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                                <div>
                                  <h4 className="font-medium text-orange-900">Right to Object</h4>
                                  <p className="text-sm text-orange-800 mt-1">Object to processing of your data for marketing or other purposes.</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <Shield className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                                <div>
                                  <h4 className="font-medium text-gray-900">Right to Restrict</h4>
                                  <p className="text-sm text-gray-800 mt-1">Request limitation of processing under certain circumstances.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] p-6 rounded-lg text-white">
                          <h4 className="font-semibold mb-3 flex items-center">
                            <Mail className="w-5 h-5 mr-2" />
                            How to Exercise Your Rights
                          </h4>
                          <p className="text-sm mb-4">
                            To exercise any of these rights, please contact us using the information provided in the 
                            Contact section. We will respond to your request within 30 days.
                          </p>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                            onClick={() => scrollToSection('contact')}
                          >
                            Contact Us About Your Rights
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Data Retention */}
                <section id="retention">
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                        <Clock className="w-6 h-6 mr-3 text-[#d09d80]" />
                        Data Retention
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <p className="text-gray-700">
                          We retain your personal information only for as long as necessary to fulfill the purposes 
                          for which it was collected, comply with legal obligations, and protect our legitimate interests.
                        </p>
                        
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              Medical Records
                            </h4>
                            <p className="text-sm text-blue-800 mb-2">Retained for 7-10 years as required by medical regulations and professional standards.</p>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Legal Requirement</Badge>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-900 mb-2 flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              Marketing Data
                            </h4>
                            <p className="text-sm text-green-800 mb-2">Retained until you withdraw consent or for 3 years from last interaction.</p>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">Consent Based</Badge>
                          </div>
                          
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-medium text-purple-900 mb-2 flex items-center">
                              <Globe className="w-4 h-4 mr-2" />
                              Website Data
                            </h4>
                            <p className="text-sm text-purple-800 mb-2">Analytics and cookies retained for 2 years or until you clear browser data.</p>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">Technical</Badge>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Secure Disposal</h4>
                          <p className="text-sm text-gray-700">
                            When data is no longer needed, we securely delete or anonymize it using industry-standard 
                            methods to ensure it cannot be recovered or reconstructed.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* International Transfers */}
                <section id="international">
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                        <Globe className="w-6 h-6 mr-3 text-[#d09d80]" />
                        International Data Transfers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-gray-700">
                          Your personal information is primarily stored and processed in the Philippines. However, 
                          some of our service providers may be located in other countries.
                        </p>
                        
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                          <h4 className="font-medium text-blue-900 mb-2">Data Protection Standards</h4>
                          <p className="text-sm text-blue-800">
                            When we transfer data internationally, we ensure adequate protection through:
                          </p>
                          <ul className="text-sm text-blue-800 mt-2 space-y-1">
                            <li>• Adequacy decisions by relevant authorities</li>
                            <li>• Standard contractual clauses</li>
                            <li>• Binding corporate rules</li>
                            <li>• Certification schemes and codes of conduct</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Policy Updates */}
                <section id="updates">
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                        <FileText className="w-6 h-6 mr-3 text-[#d09d80]" />
                        Policy Updates
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-gray-700">
                          We may update this Privacy Policy from time to time to reflect changes in our practices, 
                          technology, legal requirements, or other factors.
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">How We Notify You</h4>
                            <ul className="text-sm text-green-800 space-y-1">
                              <li>• Email notification to registered users</li>
                              <li>• Prominent notice on our website</li>
                              <li>• In-clinic notifications for significant changes</li>
                              <li>• Updated "Last Modified" date on this page</li>
                            </ul>
                          </div>
                          
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <h4 className="font-medium text-orange-900 mb-2">Your Options</h4>
                            <ul className="text-sm text-orange-800 space-y-1">
                              <li>• Review changes before they take effect</li>
                              <li>• Contact us with questions or concerns</li>
                              <li>• Withdraw consent if you disagree</li>
                              <li>• Request data deletion if applicable</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Contact Information */}
                <section id="contact">
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                        <Mail className="w-6 h-6 mr-3 text-[#d09d80]" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <p className="text-gray-700">
                          If you have any questions about this Privacy Policy or wish to exercise your privacy rights, 
                          please contact us using the information below:
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              <MapPin className="w-5 h-5 text-[#d09d80] mt-1 flex-shrink-0" />
                              <div>
                                <h4 className="font-medium text-gray-900">Clinic Address</h4>
                                <p className="text-sm text-gray-600">
                                  Skin Essentials by HER<br />
                                  123 Beauty Street, Quezon City<br />
                                  Metro Manila, Philippines 1100
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <Phone className="w-5 h-5 text-[#d09d80] mt-1 flex-shrink-0" />
                              <div>
                                <h4 className="font-medium text-gray-900">Phone</h4>
                                <p className="text-sm text-gray-600">+63 (2) 8123-4567</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <Mail className="w-5 h-5 text-[#d09d80] mt-1 flex-shrink-0" />
                              <div>
                                <h4 className="font-medium text-gray-900">Email</h4>
                                <p className="text-sm text-gray-600">privacy@skinessentialsbyher.com</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] p-6 rounded-lg text-white">
                            <h4 className="font-semibold mb-3">Privacy Officer</h4>
                            <p className="text-sm mb-4">
                              For specific privacy concerns or data protection inquiries, you can contact our 
                              designated Privacy Officer directly.
                            </p>
                            <div className="space-y-2 text-sm">
                              <p><strong>Email:</strong> dpo@skinessentialsbyher.com</p>
                              <p><strong>Response Time:</strong> Within 30 days</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Business Hours</h4>
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                            <div>
                              <p><strong>Monday - Friday:</strong> 9:00 AM - 7:00 PM</p>
                              <p><strong>Saturday:</strong> 9:00 AM - 5:00 PM</p>
                            </div>
                            <div>
                              <p><strong>Sunday:</strong> 10:00 AM - 4:00 PM</p>
                              <p><strong>Holidays:</strong> By appointment only</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

              </div>
            </div>
          </div>
        </div>

        
      </div>
    </PullToRefresh>
  )
}