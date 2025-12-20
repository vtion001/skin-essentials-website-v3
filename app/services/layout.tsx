import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Aesthetic Services in Quezon City | Hiko Nose Lift ₱9,999, Thread Lifts & More | Skin Essentials by HER",
  description: "Comprehensive aesthetic services in Quezon City: Hiko nose lifts ₱9,999, thread lifts ₱1,000/thread, dermal fillers, laser treatments, vampire facials. Licensed professionals, FDA-approved materials. Book consultation today!",
  keywords: "aesthetic services Quezon City, Hiko nose lift price Philippines, thread lift cost QC, dermal fillers Quezon City, laser hair removal price Philippines, vampire facial QC, aesthetic treatments near me, medical aesthetics services, PDO thread lift Philippines, lip fillers QC",
  openGraph: {
    title: "Aesthetic Services in Quezon City | Skin Essentials by HER",
    description: "Comprehensive aesthetic services in Quezon City: Hiko nose lifts ₱9,999, thread lifts, dermal fillers, laser treatments, vampire facials. Licensed professionals, FDA-approved materials.",
    url: "https://www.skinessentialsbyher.com/services",
    images: [
      {
        url: "https://res.cloudinary.com/dbviya1rj/image/upload/v1753674655/skinessentials_logo_350_x_180_px_fpp26r.png",
        width: 1200,
        height: 630,
        alt: "Aesthetic Services Quezon City - Skin Essentials by HER",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aesthetic Services in Quezon City | Skin Essentials by HER",
    description: "Comprehensive aesthetic services: Hiko nose lifts ₱9,999, thread lifts, dermal fillers, laser treatments in Quezon City.",
    images: ["https://res.cloudinary.com/dbviya1rj/image/upload/v1753674655/skinessentials_logo_350_x_180_px_fpp26r.png"],
  },
  alternates: {
    canonical: "https://www.skinessentialsbyher.com/services",
  },
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}