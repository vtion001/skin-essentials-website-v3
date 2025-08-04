import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use a real database
const portfolioItems: any[] = [
  {
    id: "1",
    title: "Nose Thread Lift Transformation",
    category: "Thread Lifts",
    subcategory: "Nose Enhancement",
    beforeImage: "/uploads/portfolio/before-1704067200000.jpg",
    afterImage: "/uploads/portfolio/after-1704067200000.jpg",
    description: "Complete nose reshaping using PDO threads for natural-looking enhancement",
    duration: "1 hour",
    price: "₱9,999",
    date: "2024-01-15",
    rating: 5,
    tags: ["Non-surgical", "Instant results", "Natural looking"],
    clientAge: "28",
    results: ["Higher nose bridge", "Defined tip", "Improved profile"],
    testimonial: "I'm absolutely amazed by the results! My nose looks so much better and natural.",
    clientInitials: "M.S.",
    status: "published",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
]

export async function GET() {
  try {
    return NextResponse.json(portfolioItems)
  } catch (error) {
    console.error("Get portfolio items error:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newItem = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    portfolioItems.push(newItem)

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error("Create portfolio item error:", error)
    return NextResponse.json({ error: "Failed to create portfolio item" }, { status: 500 })
  }
}
