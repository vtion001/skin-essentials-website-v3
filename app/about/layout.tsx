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
        url: "https://www.skinessentialsbyher.com/images/skinessentials-logo.png",
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
    images: ["https://www.skinessentialsbyher.com/images/skinessentials-logo.png"],
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