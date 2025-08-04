import { type NextRequest, NextResponse } from "next/server"
import { PortfolioService } from "@/lib/portfolio-data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = PortfolioService.getItemById(params.id)

    if (!item) {
      return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Get portfolio item error:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio item" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const updatedItem = PortfolioService.updateItem(params.id, body)

    if (!updatedItem) {
      return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 })
    }

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error("Update portfolio item error:", error)
    return NextResponse.json({ error: "Failed to update portfolio item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = PortfolioService.deleteItem(params.id)

    if (!success) {
      return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Portfolio item deleted successfully" })
  } catch (error) {
    console.error("Delete portfolio item error:", error)
    return NextResponse.json({ error: "Failed to delete portfolio item" }, { status: 500 })
  }
}
