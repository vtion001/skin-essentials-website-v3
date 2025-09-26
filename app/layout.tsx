import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SmoothScroll } from "@/components/smooth-scroll"
import { PerformanceMonitor } from "@/components/performance-monitor"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Skin Essentials by HER - Non-Surgical Beauty Enhancements",
  description:
    "Your trusted partner for non-surgical beauty enhancements and medical-grade skin solutions. Licensed professionals, FDA-approved materials, personalized treatments.",
  keywords: "beauty treatments, non-surgical, thread lift, fillers, laser treatments, Quezon City, medical aesthetics",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#fbc6c5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <PerformanceMonitor />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}
