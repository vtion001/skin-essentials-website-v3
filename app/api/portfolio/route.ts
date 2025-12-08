import { NextResponse } from "next/server"
import { jsonOk, jsonError, jsonCreated } from "@/lib/api-response"
import { logError } from "@/lib/error-logger"
import { portfolioService } from "@/lib/portfolio-data"

export async function GET() {
  try {
    const items = portfolioService.getAllItems()
    return jsonOk(items)
  } catch (error) {
    await logError("api.portfolio.get", error)
    return jsonError("Failed to fetch portfolio items", 500)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newItem = portfolioService.addItem(body)
    return jsonCreated(newItem)
  } catch (error) {
    await logError("api.portfolio.post", error)
    return jsonError("Failed to create portfolio item", 500)
  }
}
