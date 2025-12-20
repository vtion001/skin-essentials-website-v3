import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | Licensed Aesthetic Clinic in Quezon City | 15+ Years Experience | Skin Essentials by HER",
  description: "Meet our licensed medical professionals at Quezon City's premier aesthetic clinic. Board-certified dermatologist, FDA-certified injectors, 15+ years experience, 5000+ happy clients. Your trusted beauty partner in QC.",
  keywords: "licensed aesthetic clinic Quezon City, board certified dermatologist QC, FDA certified injector Philippines, aesthetic clinic team Quezon City, medical director aesthetic clinic, experienced aesthetic doctor Philippines, trusted aesthetic clinic QC",
  openGraph: {
    title: "About Us | Licensed Aesthetic Clinic in Quezon City | Skin Essentials by HER",
    description: "Meet our licensed medical professionals at Quezon City's premier aesthetic clinic. Board-certified dermatologist, FDA-certified injectors, 15+ years experience, 5000+ happy clients.",
    url: "https://www.skinessentialsbyher.com/about",
    images: [
      {
        url: "https://res.cloudinary.com/dbviya1rj/image/upload/v1753674655/skinessentials_logo_350_x_180_px_fpp26r.png",
        width: 1200,
        height: 630,
        alt: "About Skin Essentials by HER - Licensed Aesthetic Clinic Quezon City",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Licensed Aesthetic Clinic in Quezon City",
    description: "Meet our licensed medical professionals. Board-certified dermatologist, FDA-certified injectors, 15+ years experience in Quezon City.",
    images: ["https://res.cloudinary.com/dbviya1rj/image/upload/v1753674655/skinessentials_logo_350_x_180_px_fpp26r.png"],
  },
  alternates: {
    canonical: "https://www.skinessentialsbyher.com/about",
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}