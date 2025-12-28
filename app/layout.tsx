import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { SmoothScroll } from "@/components/smooth-scroll"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { StructuredData } from "@/components/structured-data"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeWrapper } from "@/components/theme-wrapper"
import SharedFooter from "@/components/shared-footer"
import { MobileNav } from "@/components/mobile-nav"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
})

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
        url: "https://res.cloudinary.com/dbviya1rj/image/upload/v1753674655/skinessentials_logo_350_x_180_px_fpp26r.png",
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
    images: ["https://res.cloudinary.com/dbviya1rj/image/upload/v1753674655/skinessentials_logo_350_x_180_px_fpp26r.png"],
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
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#fbc6c5" />
        <meta name="msapplication-TileColor" content="#fbc6c5" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#fbc6c5" />
        <link rel="icon" type="image/png" sizes="16x16" href="https://res.cloudinary.com/dbviya1rj/image/upload/c_fill,w_16,h_16/v1763694737/jneevo5qj2skirxgww0c.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="https://res.cloudinary.com/dbviya1rj/image/upload/c_fill,w_32,h_32/v1763694737/jneevo5qj2skirxgww0c.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="https://res.cloudinary.com/dbviya1rj/image/upload/c_fill,w_48,h_48/v1763694737/jneevo5qj2skirxgww0c.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="https://res.cloudinary.com/dbviya1rj/image/upload/c_fill,w_64,h_64/v1763694737/jneevo5qj2skirxgww0c.png" />
        <link rel="icon" type="image/png" sizes="128x128" href="https://res.cloudinary.com/dbviya1rj/image/upload/c_fill,w_128,h_128/v1763694737/jneevo5qj2skirxgww0c.png" />
        <link rel="icon" type="image/png" sizes="256x256" href="https://res.cloudinary.com/dbviya1rj/image/upload/c_fill,w_256,h_256/v1763694737/jneevo5qj2skirxgww0c.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="https://res.cloudinary.com/dbviya1rj/image/upload/c_fill,w_180,h_180/v1763694737/jneevo5qj2skirxgww0c.png" />
        <link rel="shortcut icon" href="https://res.cloudinary.com/dbviya1rj/image/upload/c_fill,w_32,h_32/v1763694737/jneevo5qj2skirxgww0c.png" />
        <link rel="canonical" href="https://www.skinessentialsbyher.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${inter.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <StructuredData />
          <PerformanceMonitor />
          <SmoothScroll>
            <ThemeWrapper>
              <main className="pb-24 md:pb-0">
                {children}
              </main>
            </ThemeWrapper>
          </SmoothScroll>
          <SharedFooter />
          <MobileNav />
          {process.env.NODE_ENV === "production" && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
