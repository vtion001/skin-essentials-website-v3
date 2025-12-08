import { jsonOk, jsonError, jsonCreated } from "@/lib/api-response"
import { logError } from "@/lib/error-logger"
import { supabaseAdminClient } from "@/lib/supabase-admin"
import { defaultPortfolioItems } from "@/lib/portfolio-data"

interface PortfolioItem {
  id: string
  title: string
  category: string
  beforeImage: string
  afterImage: string
  description: string
  treatment: string
  duration: string
  results: string
  extraResults?: { beforeImage: string; afterImage: string }[]
}

export async function GET() {
  try {
    const admin = supabaseAdminClient()
    const { data, error } = await admin
      .from('portfolio_items')
      .select('id, title, category, before_image, after_image, description, treatment, duration, results, extra_results')
      .order('created_at', { ascending: false })
    if (error) return jsonError(error.message, 500)

    if (!error && Array.isArray(data) && data.length === 0 && Array.isArray(defaultPortfolioItems) && defaultPortfolioItems.length > 0) {
      const payloads = defaultPortfolioItems.map((p) => ({
        id: String(p.id),
        title: String(p.title || ''),
        category: String(p.category || ''),
        before_image: String(p.beforeImage || ''),
        after_image: String(p.afterImage || ''),
        description: String(p.description || ''),
        treatment: String(p.treatment || ''),
        duration: String(p.duration || ''),
        results: String(p.results || ''),
        extra_results: Array.isArray(p.extraResults) ? p.extraResults : [],
      }))
      const ins = await admin.from('portfolio_items').insert(payloads)
      if (ins.error) return jsonError(ins.error.message, 500)
      const seeded = await admin
        .from('portfolio_items')
        .select('id, title, category, before_image, after_image, description, treatment, duration, results, extra_results')
        .order('created_at', { ascending: false })
      if (seeded.error) return jsonError(seeded.error.message, 500)
      const seededItems: PortfolioItem[] = (seeded.data || []).map((r: any) => ({
        id: String(r.id),
        title: String(r.title || ''),
        category: String(r.category || ''),
        beforeImage: String(r.before_image || ''),
        afterImage: String(r.after_image || ''),
        description: String(r.description || ''),
        treatment: String(r.treatment || ''),
        duration: String(r.duration || ''),
        results: String(r.results || ''),
        extraResults: Array.isArray(r.extra_results) ? r.extra_results : [],
      }))
      return jsonOk(seededItems, { headers: { 'Cache-Control': 'no-store' } })
    }
    // Backfill defaults if some items are missing (id-based, idempotent)
    if (Array.isArray(data) && Array.isArray(defaultPortfolioItems) && defaultPortfolioItems.length > 0) {
      const existingIds = new Set<string>(data.map((r: any) => String(r.id)))
      const missing = defaultPortfolioItems.filter((p) => !existingIds.has(String(p.id)))
      if (missing.length > 0) {
        const payloads = missing.map((p) => ({
          id: String(p.id),
          title: String(p.title || ''),
          category: String(p.category || ''),
          before_image: String(p.beforeImage || ''),
          after_image: String(p.afterImage || ''),
          description: String(p.description || ''),
          treatment: String(p.treatment || ''),
          duration: String(p.duration || ''),
          results: String(p.results || ''),
          extra_results: Array.isArray(p.extraResults) ? p.extraResults : [],
        }))
        const ins = await admin.from('portfolio_items').insert(payloads)
        if (ins.error) return jsonError(ins.error.message, 500)
        const re = await admin
          .from('portfolio_items')
          .select('id, title, category, before_image, after_image, description, treatment, duration, results, extra_results')
          .order('created_at', { ascending: false })
        if (re.error) return jsonError(re.error.message, 500)
        data.splice(0, data.length, ...(re.data || []))
      }
    }

    const items: PortfolioItem[] = (data || []).map((r: any) => ({
      id: String(r.id),
      title: String(r.title || ''),
      category: String(r.category || ''),
      beforeImage: String(r.before_image || ''),
      afterImage: String(r.after_image || ''),
      description: String(r.description || ''),
      treatment: String(r.treatment || ''),
      duration: String(r.duration || ''),
      results: String(r.results || ''),
      extraResults: Array.isArray(r.extra_results) ? r.extra_results : [],
    }))
    return jsonOk(items, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    await logError("api.portfolio.get", error)
    return jsonError("Failed to fetch portfolio items", 500)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const admin = supabaseAdminClient()
    const id = `pf_${Date.now()}`
    const payload = {
      id,
      title: String(body.title || ''),
      category: String(body.category || ''),
      before_image: String(body.beforeImage || ''),
      after_image: String(body.afterImage || ''),
      description: String(body.description || ''),
      treatment: String(body.treatment || ''),
      duration: String(body.duration || ''),
      results: String(body.results || ''),
      extra_results: Array.isArray(body.extraResults) ? body.extraResults : [],
    }
    const { data, error } = await admin.from('portfolio_items').insert(payload).select('*').single()
    if (error) return jsonError(error.message, 500)
    const created: PortfolioItem = {
      id: data.id,
      title: data.title,
      category: data.category,
      beforeImage: data.before_image,
      afterImage: data.after_image,
      description: data.description,
      treatment: data.treatment,
      duration: data.duration,
      results: data.results,
      extraResults: Array.isArray(data.extra_results) ? data.extra_results : [],
    }
    return jsonCreated(created)
  } catch (error) {
    await logError("api.portfolio.post", error)
    return jsonError("Failed to create portfolio item", 500)
  }
}
