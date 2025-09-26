import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Hiko Nose Thread Lift Quezon City ₱9,999 | Best Non-Surgical Nose Job | Skin Essentials by HER",
  description: "Get the perfect nose with Hiko Nose Thread Lift in Quezon City! ₱9,999 with unlimited PDO/PCL threads. No surgery, 1-hour procedure, 1-2 years results. Licensed professionals, FDA-approved materials. Book free consultation!",
  keywords: "Hiko nose lift Quezon City, nose thread lift Philippines, non surgical nose job QC, PDO nose threads Quezon City, nose enhancement Philippines, aesthetic clinic nose lift QC, Hiko nose thread lift price Philippines, best nose lift Quezon City, nose contouring QC, thread lift nose Philippines",
  openGraph: {
    title: "Hiko Nose Thread Lift Quezon City ₱9,999 | Skin Essentials by HER",
    description: "Get the perfect nose with Hiko Nose Thread Lift in Quezon City! ₱9,999 with unlimited PDO/PCL threads. No surgery, 1-hour procedure, 1-2 years results.",
    url: "https://www.skinessentialsbyher.com/hiko-nose-lift",
    images: [
      {
        url: "https://res.cloudinary.com/dbviya1rj/image/upload/v1758858517/rymvbcmiq248mvbilmcj.jpg",
        width: 1200,
        height: 630,
        alt: "Hiko Nose Thread Lift Results Quezon City - Skin Essentials by HER",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hiko Nose Thread Lift Quezon City ₱9,999",
    description: "Get the perfect nose with Hiko Nose Thread Lift! No surgery, 1-hour procedure, 1-2 years results. Book free consultation in Quezon City.",
    images: ["https://res.cloudinary.com/dbviya1rj/image/upload/v1758858517/rymvbcmiq248mvbilmcj.jpg"],
  },
  alternates: {
    canonical: "https://www.skinessentialsbyher.com/hiko-nose-lift",
  },
}

export default function HikoNoseLiftLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}