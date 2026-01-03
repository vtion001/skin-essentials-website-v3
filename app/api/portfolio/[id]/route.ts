import { NextRequest } from "next/server"
import { PortfolioItem } from "@/lib/types/api.types"
import { jsonOk, jsonError } from "@/lib/api-response"
import { supabaseAdminClient } from "@/lib/supabase-admin"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const admin = supabaseAdminClient()
    if (!admin) return jsonError('Supabase admin client not initialized', 500)
    const { data, error } = await admin
      .from('portfolio_items')
      .select('id, title, category, before_image, after_image, description, treatment, duration, results, extra_results')
      .eq('id', id)
      .single()
    if (error) return jsonError('Portfolio item not found', 404)
    const item = {
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
    return jsonOk(item, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return jsonError("Failed to fetch portfolio item", 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { id } = await params
    const admin = supabaseAdminClient()
    if (!admin) return jsonError('Supabase admin client not initialized', 500)
    const updates: Partial<PortfolioItem> = {
      title: body.title !== undefined ? String(body.title) : undefined,
      category: body.category !== undefined ? String(body.category) : undefined,
      before_image: body.beforeImage !== undefined ? String(body.beforeImage) : undefined,
      after_image: body.afterImage !== undefined ? String(body.afterImage) : undefined,
      description: body.description !== undefined ? String(body.description) : undefined,
      treatment: body.treatment !== undefined ? String(body.treatment) : undefined,
      duration: body.duration !== undefined ? String(body.duration) : undefined,
      results: body.results !== undefined ? String(body.results) : undefined,
      extra_results: Array.isArray(body.extraResults) ? body.extraResults : undefined,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await admin.from('portfolio_items').update(updates).eq('id', id).select('*').single()
    if (error) return jsonError('Portfolio item not found', 404)
    const item = {
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
    return jsonOk(item, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return jsonError("Failed to update portfolio item", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const admin = supabaseAdminClient()
    if (!admin) return jsonError('Supabase admin client not initialized', 500)
    const { error } = await admin.from('portfolio_items').delete().eq('id', id)
    if (error) return jsonError('Portfolio item not found', 404)
    return jsonOk(true, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return jsonError("Failed to delete portfolio item", 500)
  }
}
