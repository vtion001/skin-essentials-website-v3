"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Eye, EyeOff, Shield, CheckCircle, Globe, Check } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function AdminLoginPage() {
  const [email, setEmail] = useState<string>(() => {
    try { return localStorage.getItem('admin_login_email') || '' } catch { return '' }
  })
  const [password, setPassword] = useState("")
  const [mfaCode, setMfaCode] = useState("")
  const [mfaRequired, setMfaRequired] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try { return !!localStorage.getItem('admin_login_email') } catch { return false }
  })
  const router = useRouter()
  const search = useSearchParams()
  const initialError = search.get('error') === 'not_admin' ? 'You are not authorized to access the admin dashboard' : ''
  const [initialized, setInitialized] = useState(false)

  if (!initialized) {
    const err = search.get('error')
    if (err === 'mfa_required') {
      setMfaRequired(true)
      setMessage('Enter your MFA code')
      setInitialized(true)
    } else if (err === 'no_session') {
      setError('Your session has expired or is invalid. Please log in again.')
      setInitialized(true)
    } else if (initialError) {
      setError(initialError)
      setInitialized(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const csrf = typeof document !== 'undefined' ? (document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)?.[1] || '') : ''
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrf,
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.mfa_required) {
          setMfaRequired(true)
          setMessage("Enter your MFA code")
        } else if (data.success) {
          setMessage("Signed in successfully. Redirecting...")
          try {
            if (rememberMe) {
              localStorage.setItem('admin_login_email', email)
            } else {
              localStorage.removeItem('admin_login_email')
            }
          } catch { }
          setTimeout(() => router.replace("/admin"), 100)
        } else {
          setError(data.error || "Invalid email or password")
        }
      } else {
        const data = await response.json().catch(() => ({}))
        setError(data?.error || "Login failed. Please try again.")
      }
    } catch (error) {
      setError("Network error. Please check your connection.")
    }

    setIsLoading(false)
  }

  const handleVerifyMfa = async () => {
    setIsLoading(true)
    setError("")
    const csrf = typeof document !== 'undefined' ? (document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)?.[1] || '') : ''
    const resp = await fetch('/api/admin/mfa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
      credentials: 'include',
      body: JSON.stringify({ code: mfaCode })
    })
    const json = await resp.json().catch(() => ({}))
    if (resp.ok && json.success) {
      setMessage("MFA verified. Redirecting...")
      setTimeout(() => router.replace('/admin'), 100)
    } else {
      setError(json?.error || 'MFA verification failed')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Left side: Editorial Panel */}
      <div className="w-full md:w-1/2 p-8 md:p-20 flex flex-col justify-center animate-in fade-in slide-in-from-left duration-700 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto w-full">
          {/* Header Section */}
          <div className="mb-20 text-center md:text-left">
            <h1 className="text-6xl md:text-[80px] lg:text-[100px] font-bold tracking-tight text-gray-900 leading-none">
              ADMIN LOGIN<span className="text-[#d09d80]">.</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            {/* Sidebar Labels */}
            <div className="md:col-span-3 space-y-2 hidden md:block border-r border-gray-100 pr-8">
              <p className="text-[12px] tracking-[0.05em] font-bold text-gray-900 uppercase">Credentials.</p>
              <p className="text-[12px] tracking-[0.05em] font-medium text-gray-400 uppercase">Security.</p>
              <p className="text-[12px] tracking-[0.05em] font-medium text-gray-400 uppercase">Support.</p>
            </div>

            {/* Main Content Area */}
            <div className="md:col-span-9 space-y-12">
              <div className="space-y-6">
                <p className="text-base md:text-lg leading-[1.8] text-gray-500 font-light max-w-xl">
                  <span className="text-gray-900 font-medium italic block mb-3 text-xl font-serif">Secure Identity Verification.</span>
                  Access the administrative command center to manage clinic workflows, portfolio data, and patient interactions.
                  Please provide your <span className="text-[#d09d80] font-semibold uppercase tracking-widest text-xs">authorized credentials</span> to proceed with the session.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-8 max-w-md">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-900 font-bold text-[10px] uppercase tracking-[0.2em] pl-1">
                      System Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@skinessentials.clinic"
                      required
                      className="h-12 border-gray-200 focus:border-[#d09d80] focus:ring-[#d09d80]/10 rounded-none border-t-0 border-x-0 border-b px-0 text-gray-900 font-medium shadow-none focus-visible:ring-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-900 font-bold text-[10px] uppercase tracking-[0.2em] pl-1">
                      Master Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-12 border-gray-200 focus:border-[#d09d80] focus:ring-[#d09d80]/10 rounded-none border-t-0 border-x-0 border-b px-0 text-gray-900 font-medium pr-12 shadow-none focus-visible:ring-0"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{error}</span>
                  </div>
                )}

                {!error && message && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 text-green-600 animate-in fade-in slide-in-from-top-2 duration-300">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{message}</span>
                  </div>
                )}

                {mfaRequired && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 border-t border-gray-100 pt-8">
                    <div className="space-y-2">
                      <Label htmlFor="mfa" className="text-gray-900 font-bold text-[10px] uppercase tracking-[0.2em] pl-1">MFA Security Code</Label>
                      <Input
                        id="mfa"
                        type="text"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                        placeholder="000000"
                        required
                        className="h-14 border-gray-200 focus:border-[#d09d80] rounded-none text-center text-3xl tracking-[0.5em] font-bold"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleVerifyMfa}
                      disabled={isLoading}
                      className="w-full h-12 bg-gray-900 hover:bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-none transition-all"
                    >
                      Authenticate Access
                    </Button>
                  </div>
                )}

                {!mfaRequired && (
                  <div className="space-y-6">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gray-900 hover:bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-none transition-all active:scale-[0.98]"
                    >
                      {isLoading ? "Validating Session..." : "Authorize Access"}
                    </Button>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          id="remember"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-3 h-3 rounded-none border-gray-300 text-gray-900 focus:ring-0"
                        />
                        <label htmlFor="remember" className="text-[10px] text-gray-500 font-bold uppercase tracking-widest cursor-pointer">Stay Authenticated</label>
                      </div>
                      <Link href="#" className="text-[10px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-900 pb-0.5 hover:text-[#d09d80] hover:border-[#d09d80] transition-colors">Recovery</Link>
                    </div>
                  </div>
                )}
              </form>

              {/* Bottom Badges Section */}
              <div className="flex flex-wrap gap-8 pt-12 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d09d80]"></div>
                  <span className="text-[10px] tracking-[0.2em] font-bold text-gray-900 uppercase">ENCRYPTED</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d09d80]"></div>
                  <span className="text-[10px] tracking-[0.2em] font-bold text-gray-900 uppercase">MFA PROTECTED</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d09d80]"></div>
                  <span className="text-[10px] tracking-[0.2em] font-bold text-gray-900 uppercase">SESSION MONITORED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Image Panel with Organic Corners */}
      <div className="hidden md:flex w-1/2 p-6 h-screen sticky top-0 animate-in fade-in slide-in-from-right duration-1000">
        <div className="relative w-full h-full overflow-hidden shadow-2xl rounded-[60px] md:rounded-[100px] bg-gray-100">
          <Image
            src="https://res.cloudinary.com/dbviya1rj/image/upload/v1754329770/820be4e7-a6c7-46d4-b522-c9dc3e39f194.png"
            alt="Skin Essentials Interior"
            fill
            className="object-cover"
            priority
          />
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

          {/* Content Overlay */}
          <div className="absolute inset-0 p-16 md:p-24 flex flex-col justify-end">
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-8 leading-[1.1] max-w-lg tracking-tight shadow-black drop-shadow-lg">
              Precision in Care, <span className="text-[#fbc6c5]">Beauty</span> in Practice.
            </h2>
            <p className="text-white/90 text-lg lg:text-xl mb-12 max-w-md font-light leading-relaxed drop-shadow">
              Our advanced management ecosystem empowers aesthetic professionals to deliver world-class patient experiences.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3 flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-white text-sm font-bold tracking-wide uppercase">FDA Verified</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3 flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-white text-sm font-bold tracking-wide uppercase">Global Standards</span>
              </div>
            </div>
          </div>

          {/* Floater Element (Inspired by design) */}
          <div className="absolute top-12 right-12 w-32 h-32 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 animate-pulse"></div>
        </div>
      </div>

      {/* Mobile Branding */}
      <div className="md:hidden fixed top-0 left-0 right-0 p-6 flex justify-center bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <span className="text-sm font-black tracking-[0.3em] text-gray-900 uppercase">Skin Essentials</span>
      </div>
    </div>
  )
}
