import { NextRequest } from 'next/server'
import { jsonOk, jsonError } from '@/lib/api-response'
import { ServiceSchema } from '@/lib/validation'
import { supabaseAdminClient } from '@/lib/supabase-admin'
import { serviceCategories as defaultServiceCategories } from '@/lib/services-data'

interface ServiceFAQ { q: string; a: string }
interface Service {
  name: string
  price: string
  description: string
  duration?: string
  results?: string
  sessions?: string
  includes?: string
  benefits?: string[]
  faqs?: ServiceFAQ[]
  originalPrice?: string
  badge?: string
  pricing?: string
}

interface ServiceCategory {
  id: string
  category: string
  description: string
  image?: string
  color?: string
  services: Service[]
}

// The services catalog is stored in Supabase (service_categories + services tables)

export async function GET() {
  const admin = supabaseAdminClient()
  const { data, error } = await admin
    .from('service_categories')
    .select('id, category, description, image, color, services:services(id, name, price, description, duration, results, sessions, includes, benefits, faqs, original_price, badge, pricing)')
    .order('category', { ascending: true })
  if (error) return jsonError(error.message, 500)
  // Seed from local defaults if empty
  if (!error && Array.isArray(data) && data.length === 0 && Array.isArray(defaultServiceCategories) && defaultServiceCategories.length > 0) {
    // Insert categories
    const catPayloads = defaultServiceCategories.map((c) => ({
      id: c.id,
      category: c.category,
      description: c.description,
      image: c.image,
      color: c.color,
    }))
    const catIns = await admin.from('service_categories').insert(catPayloads).select('id')
    if (catIns.error) return jsonError(catIns.error.message, 500)
    // Insert services for each category
    const svcPayloads: any[] = []
    for (const c of defaultServiceCategories) {
      for (const s of c.services) {
        svcPayloads.push({
          id: `svc_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
          category_id: c.id,
          name: String(s.name || ''),
          price: String(s.price || ''),
          description: String(s.description || ''),
          duration: s.duration ? String(s.duration) : null,
          results: s.results ? String(s.results) : null,
          sessions: s.sessions ? String(s.sessions) : null,
          includes: s.includes ? String(s.includes) : null,
          benefits: Array.isArray(s.benefits) ? s.benefits : [],
          faqs: Array.isArray(s.faqs) ? s.faqs : [],
          original_price: s.originalPrice ? String(s.originalPrice) : null,
          badge: s.badge ? String(s.badge) : null,
          pricing: s.pricing ? String(s.pricing) : null,
        })
      }
    }
    if (svcPayloads.length) {
      const svcIns = await admin.from('services').insert(svcPayloads)
      if (svcIns.error) return jsonError(svcIns.error.message, 500)
    }
    // Re-query after seed
    const seeded = await admin
      .from('service_categories')
      .select('id, category, description, image, color, services:services(id, name, price, description, duration, results, sessions, includes, benefits, faqs, original_price, badge, pricing)')
      .order('category', { ascending: true })
    if (seeded.error) return jsonError(seeded.error.message, 500)
    const seededCategories: ServiceCategory[] = (seeded.data || []).map((c: any) => ({
      id: c.id,
      category: c.category,
      description: c.description || '',
      image: c.image || '',
      color: c.color || '',
      services: Array.isArray(c.services) ? c.services.map((s: any) => ({
        name: String(s.name || ''),
        price: String(s.price || ''),
        description: String(s.description || ''),
        duration: s.duration || undefined,
        results: s.results || undefined,
        sessions: s.sessions || undefined,
        includes: s.includes || undefined,
        benefits: Array.isArray(s.benefits) ? s.benefits.map(String) : undefined,
        faqs: Array.isArray(s.faqs) ? s.faqs.map((f: any) => ({ q: String(f.q || ''), a: String(f.a || '') })) : undefined,
        originalPrice: s.original_price || undefined,
        badge: s.badge || undefined,
        pricing: s.pricing || undefined,
      })) : [],
    }))
    return jsonOk(seededCategories)
  }
  const categories: ServiceCategory[] = (data || []).map((c: any) => ({
    id: c.id,
    category: c.category,
    description: c.description || '',
    image: c.image || '',
    color: c.color || '',
    services: Array.isArray(c.services) ? c.services.map((s: any) => ({
      name: String(s.name || ''),
      price: String(s.price || ''),
      description: String(s.description || ''),
      duration: s.duration || undefined,
      results: s.results || undefined,
      sessions: s.sessions || undefined,
      includes: s.includes || undefined,
      benefits: Array.isArray(s.benefits) ? s.benefits.map(String) : undefined,
      faqs: Array.isArray(s.faqs) ? s.faqs.map((f: any) => ({ q: String(f.q || ''), a: String(f.a || '') })) : undefined,
      originalPrice: s.original_price || undefined,
      badge: s.badge || undefined,
      pricing: s.pricing || undefined,
    })) : [],
  }))
  return jsonOk(categories)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const action = String(body.action || '').trim()
    if (!action) return jsonError('Missing action', 400)

    if (action === 'addService') {
      const categoryId = String(body.categoryId || '')
      const service = body.service as Service
      const parsed = ServiceSchema.safeParse(service)
      if (!parsed.success) {
        return jsonError('Invalid service payload', 422, { issues: parsed.error.issues })
      }
      const admin = supabaseAdminClient()
      const payload = {
        id: `svc_${Date.now()}`,
        category_id: categoryId,
        name: String(service.name || ''),
        price: String(service.price || ''),
        description: String(service.description || ''),
        duration: service.duration ? String(service.duration) : null,
        results: service.results ? String(service.results) : null,
        sessions: service.sessions ? String(service.sessions) : null,
        includes: service.includes ? String(service.includes) : null,
        benefits: Array.isArray(service.benefits) ? service.benefits : [],
        faqs: Array.isArray(service.faqs) ? service.faqs : [],
        original_price: service.originalPrice ? String(service.originalPrice) : null,
        badge: service.badge ? String(service.badge) : null,
        pricing: service.pricing ? String(service.pricing) : null,
      }
      const { error } = await admin.from('services').insert(payload)
      if (error) return jsonError(error.message, 500)
      return jsonOk(true)
    }

    if (action === 'deleteService') {
      const categoryId = String(body.categoryId || '')
      const name = String(body.name || '')
      const admin = supabaseAdminClient()
      const { error } = await admin.from('services').delete().eq('category_id', categoryId).eq('name', name)
      if (error) return jsonError(error.message, 500)
      return jsonOk(true)
    }

    if (action === 'updateService') {
      const categoryId = String(body.categoryId || '')
      const originalName = String(body.originalName || '')
      const service = body.service as Service
      const admin = supabaseAdminClient()
      const updates: any = {
        name: service.name !== undefined ? String(service.name) : undefined,
        price: service.price !== undefined ? String(service.price) : undefined,
        description: service.description !== undefined ? String(service.description) : undefined,
        duration: service.duration !== undefined ? String(service.duration) : undefined,
        results: service.results !== undefined ? String(service.results) : undefined,
        sessions: service.sessions !== undefined ? String(service.sessions) : undefined,
        includes: service.includes !== undefined ? String(service.includes) : undefined,
        original_price: service.originalPrice !== undefined ? String(service.originalPrice) : undefined,
        badge: service.badge !== undefined ? String(service.badge) : undefined,
        pricing: service.pricing !== undefined ? String(service.pricing) : undefined,
        benefits: Array.isArray(service.benefits) ? service.benefits : undefined,
        faqs: Array.isArray(service.faqs) ? service.faqs : undefined,
        updated_at: new Date().toISOString(),
      }
      const { error } = await admin.from('services').update(updates).eq('category_id', categoryId).eq('name', originalName)
      if (error) return jsonError(error.message, 500)
      return jsonOk(true)
    }

    if (action === 'addCategory') {
      const category = String(body.category || '')
      const description = body.description !== undefined ? String(body.description) : null
      const image = body.image !== undefined ? String(body.image) : null
      const color = body.color !== undefined ? String(body.color) : null
      if (!category) return jsonError('Category name required', 422)
      const id = body.id ? String(body.id) : category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      const admin = supabaseAdminClient()
      const exists = await admin.from('service_categories').select('id').eq('id', id).limit(1)
      if (!exists.error && Array.isArray(exists.data) && exists.data.length > 0) return jsonError('Category already exists', 409)
      const { error } = await admin.from('service_categories').insert({ id, category, description, image, color })
      if (error) return jsonError(error.message, 500)
      return jsonOk(true)
    }

    if (action === 'updateCategory') {
      const id = String(body.id || '')
      if (!id) return jsonError('Missing id', 400)
      const updates: any = {
        category: body.category !== undefined ? String(body.category) : undefined,
        description: body.description !== undefined ? String(body.description) : undefined,
        image: body.image !== undefined ? String(body.image) : undefined,
        color: body.color !== undefined ? String(body.color) : undefined,
        updated_at: new Date().toISOString(),
      }
      const admin = supabaseAdminClient()
      const { error } = await admin.from('service_categories').update(updates).eq('id', id)
      if (error) return jsonError(error.message, 500)
      return jsonOk(true)
    }

    if (action === 'deleteCategory') {
      const id = String(body.id || '')
      if (!id) return jsonError('Missing id', 400)
      const admin = supabaseAdminClient()
      const { error } = await admin.from('service_categories').delete().eq('id', id)
      if (error) return jsonError(error.message, 500)
      return jsonOk(true)
    }

    return jsonError('Unsupported action', 400)
  } catch (err) {
    return jsonError('Invalid request', 400)
  }
}
