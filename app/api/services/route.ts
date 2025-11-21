import { NextRequest, NextResponse } from "next/server"
import { servicesDataService, ServiceCategory, Service } from "@/lib/services-data"

export async function GET() {
  try {
    const data = servicesDataService.getAllCategories()
    return NextResponse.json({ ok: true, data })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const action = body?.action
    if (action === "upsertCategory") {
      const cat = body?.category as ServiceCategory
      if (!cat?.id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 })
      servicesDataService.upsertCategory(cat)
      return NextResponse.json({ ok: true })
    }
    if (action === "deleteCategory") {
      const id = String(body?.id || "")
      if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 })
      servicesDataService.deleteCategory(id)
      return NextResponse.json({ ok: true })
    }
    if (action === "addService") {
      const categoryId = String(body?.categoryId || "")
      const svc = body?.service as Service
      if (!categoryId || !svc?.name) return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 })
      const ok = servicesDataService.addService(categoryId, svc)
      return NextResponse.json({ ok })
    }
    if (action === "updateService") {
      const categoryId = String(body?.categoryId || "")
      const name = String(body?.name || "")
      const updates = body?.updates as Partial<Service>
      if (!categoryId || !name) return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 })
      const ok = servicesDataService.updateService(categoryId, name, updates)
      return NextResponse.json({ ok })
    }
    if (action === "deleteService") {
      const categoryId = String(body?.categoryId || "")
      const name = String(body?.name || "")
      if (!categoryId || !name) return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 })
      const ok = servicesDataService.deleteService(categoryId, name)
      return NextResponse.json({ ok })
    }
    return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}