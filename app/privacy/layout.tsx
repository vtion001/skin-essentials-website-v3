import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Skin Essentials by HER - Data Protection & Privacy Rights",
  description: "Learn how Skin Essentials by HER protects your personal information. Our comprehensive privacy policy covers data collection, usage, storage, and your privacy rights at our Quezon City aesthetic clinic.",
  keywords: "privacy policy, data protection, personal information, privacy rights, Skin Essentials by HER, aesthetic clinic privacy, medical privacy, GDPR compliance, data security",
  openGraph: {
    title: "Privacy Policy | Skin Essentials by HER - Data Protection & Privacy Rights",
    description: "Learn how Skin Essentials by HER protects your personal information. Our comprehensive privacy policy covers data collection, usage, storage, and your privacy rights.",
    url: "https://www.skinessentialsbyher.com/privacy",
    images: [
      {
        url: "https://www.skinessentialsbyher.com/images/skinessentials-logo.png",
        width: 1200,
        height: 630,
        alt: "Skin Essentials by HER Privacy Policy - Data Protection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Skin Essentials by HER",
    description: "Learn how we protect your personal information and respect your privacy rights at our aesthetic clinic.",
    images: ["https://www.skinessentialsbyher.com/images/skinessentials-logo.png"],
  },
  alternates: {
    canonical: "https://www.skinessentialsbyher.com/privacy",
  },
  robots: "index, follow",
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}