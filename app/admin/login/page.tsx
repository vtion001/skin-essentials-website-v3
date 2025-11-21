"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Eye, EyeOff, Shield, CheckCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mfaCode, setMfaCode] = useState("")
  const [mfaRequired, setMfaRequired] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
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
    } else if (initialError) {
      setError(initialError)
      setInitialized(true)
    }
  }

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('admin_login_email') : null
      if (saved) {
        setEmail(saved)
        setRememberMe(true)
      }
    } catch {}
  }, [])

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
          } catch {}
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
    <div className="min-h-screen bg-gradient-to-br from-[#fffaff] via-[#fbc6c5]/10 to-[#d09d80]/10 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#fbc6c5]/20 to-[#d09d80]/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#d09d80]/30 to-[#fbc6c5]/30 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-[#fbc6c5]/10 to-[#d09d80]/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-[#fbc6c5]/20 shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#fbc6c5] to-[#d09d80] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Admin Login</CardTitle>
          <p className="text-gray-600 mt-2">Access the portfolio management system</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="border-[#fbc6c5]/30 focus:border-[#d09d80] focus:ring-[#d09d80]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="border-[#fbc6c5]/30 focus:border-[#d09d80] focus:ring-[#d09d80]/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {!error && message && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{message}</span>
              </div>
            )}

            {!mfaRequired && (
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white font-medium py-3"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>)}
            {mfaRequired && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mfa" className="text-gray-700 font-medium">MFA Code</Label>
                  <Input id="mfa" type="text" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} placeholder="Enter 6-digit code" required />
                </div>
                <Button type="button" onClick={handleVerifyMfa} disabled={isLoading} className="w-full bg-gradient-to-r from-[#fbc6c5] to-[#d09d80] hover:from-[#d09d80] hover:to-[#fbc6c5] text-white font-medium py-3">
                  Verify MFA
                </Button>
              </div>
            )}
            <div className="mt-2 flex items-center gap-2">
              <input id="remember" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <label htmlFor="remember" className="text-sm text-gray-700">Remember email</label>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Use your admin account</h4>
              <div className="text-sm text-blue-700">
                Sign in with your Supabase-managed admin email and password.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
