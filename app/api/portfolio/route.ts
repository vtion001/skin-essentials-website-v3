import { NextRequest, NextResponse } from "next/server"
import { portfolioService } from "@/lib/portfolio-data"

export async function GET() {
  try {
    const items = portfolioService.getAllItems()
    return NextResponse.json(items)
  } catch (error) {
    console.error("Get portfolio items error:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newItem = portfolioService.addItem(body)
    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error("Create portfolio item error:", error)
    return NextResponse.json({ error: "Failed to create portfolio item" }, { status: 500 })
  }
}
