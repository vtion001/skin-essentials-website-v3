import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Admin Dashboard | Skin Essentials by HER",
    description: "Administrative dashboard for Skin Essentials clinic management",
    robots: "noindex, nofollow", // Prevent search engines from indexing admin pages
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // SharedFooter and MobileNav already have early returns for /admin routes
    // This layout provides admin-specific metadata and can be extended for admin-only features
    return <>{children}</>
}
