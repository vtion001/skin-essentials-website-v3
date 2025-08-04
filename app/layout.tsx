import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

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
      <body className={inter.className}>{children}</body>
    </html>
  )
}
