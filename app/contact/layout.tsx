import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact & Location | Aesthetic Clinic Quezon City | Book Consultation | Skin Essentials by HER",
  description: "Visit our aesthetic clinic in Quezon City. Book your consultation for Hiko nose lifts, thread lifts, dermal fillers & more. Convenient location, licensed professionals, flexible scheduling. Contact us today!",
  keywords: "aesthetic clinic location Quezon City, book consultation aesthetic clinic QC, contact aesthetic clinic Philippines, Hiko nose lift appointment, thread lift consultation QC, aesthetic clinic address Quezon City, book aesthetic treatment Philippines",
  openGraph: {
    title: "Contact & Location | Aesthetic Clinic Quezon City | Skin Essentials by HER",
    description: "Visit our aesthetic clinic in Quezon City. Book your consultation for Hiko nose lifts, thread lifts, dermal fillers & more. Convenient location, licensed professionals.",
    url: "https://www.skinessentialsbyher.com/contact",
    images: [
      {
        url: "https://www.skinessentialsbyher.com/images/skinessentials-logo.png",
        width: 1200,
        height: 630,
        alt: "Contact Skin Essentials by HER - Aesthetic Clinic Quezon City",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact & Location | Aesthetic Clinic Quezon City",
    description: "Visit our aesthetic clinic in Quezon City. Book your consultation for Hiko nose lifts, thread lifts & more.",
    images: ["https://www.skinessentialsbyher.com/images/skinessentials-logo.png"],
  },
  alternates: {
    canonical: "https://www.skinessentialsbyher.com/contact",
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}