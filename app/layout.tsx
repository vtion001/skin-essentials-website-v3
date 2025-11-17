import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SmoothScroll } from "@/components/smooth-scroll"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { StructuredData } from "@/components/structured-data"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import SharedFooter from "@/components/shared-footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Skin Essentials by HER - Premier Aesthetic Clinic in Quezon City | Hiko Nose Lift & Thread Lifts",
  description:
    "Leading aesthetic clinic in Quezon City specializing in Hiko nose lifts, thread lifts, dermal fillers & laser treatments. Licensed professionals, FDA-approved materials. Book your consultation today!",
  keywords: "aesthetic clinic Quezon City, Hiko nose lift Quezon City, thread lift Philippines, dermal fillers QC, laser hair removal Quezon City, aesthetic clinic near me, non-surgical beauty treatments, medical aesthetics Philippines, vampire facial QC, skin rejuvenation Quezon City",
  authors: [{ name: "Skin Essentials by HER" }],
  creator: "Skin Essentials by HER",
  publisher: "Skin Essentials by HER",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  verification: {
    google: "your-google-verification-code",
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://www.skinessentialsbyher.com",
    siteName: "Skin Essentials by HER",
    title: "Premier Aesthetic Clinic in Quezon City | Skin Essentials by HER",
    description: "Leading aesthetic clinic in Quezon City specializing in Hiko nose lifts, thread lifts, dermal fillers & laser treatments. Licensed professionals, FDA-approved materials.",
    images: [
      {
        url: "https://www.skinessentialsbyher.com/images/skinessentials-logo.png",
        width: 1200,
        height: 630,
        alt: "Skin Essentials by HER - Aesthetic Clinic Quezon City",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Premier Aesthetic Clinic in Quezon City | Skin Essentials by HER",
    description: "Leading aesthetic clinic in Quezon City specializing in Hiko nose lifts, thread lifts, dermal fillers & laser treatments.",
    images: ["https://www.skinessentialsbyher.com/images/skinessentials-logo.png"],
    creator: "@skinessentialsher",
  },
  alternates: {
    canonical: "https://www.skinessentialsbyher.com",
  },
  other: {
    "geo.region": "PH-00",
    "geo.placename": "Quezon City",
    "geo.position": "14.6760;121.0437",
    "ICBM": "14.6760, 121.0437",
    "format-detection": "telephone=no",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#fbc6c5" />
        <meta name="msapplication-TileColor" content="#fbc6c5" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#fbc6c5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <StructuredData />
          <PerformanceMonitor />
          <SmoothScroll>
            {children}
          </SmoothScroll>
          <SharedFooter />
          {process.env.NODE_ENV === "production" && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
