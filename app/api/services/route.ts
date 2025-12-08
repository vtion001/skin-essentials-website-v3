import { NextRequest, NextResponse } from 'next/server'

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

let servicesData: ServiceCategory[] = [
  {
    id: 'thread-lifts',
    category: 'Thread Lifts & Face Contouring',
    description: 'Non-surgical lifting and contouring using advanced PDO/PCL threads',
    services: [
      { name: 'Hiko Nose Thread Lift', price: '₱9,999', description: 'Instantly lifts and defines the nose bridge and tip.', duration: '~1 hour', results: '1-2 years', includes: 'Unlimited PCL threads, free consultation, and post-care kit', benefits: ['Immediate nose bridge enhancement','No surgery or downtime required','Natural-looking results','Stimulates collagen production'], faqs: [{ q: 'Does it hurt?', a: 'A topical anesthetic is applied to ensure comfort.' }, { q: 'How long do results last?', a: 'Results typically last 1-2 years.' }] },
      { name: 'Face Thread Lift', price: '₱1,000/thread', originalPrice: '₱1,500/thread', badge: 'PROMO', description: 'Lifts and tightens sagging skin in the cheeks and jawline.', duration: '1-1.5 hours', results: '12-18 months', benefits: ['Immediate lifting effect','V-shaped facial contouring','Minimal downtime','Natural collagen stimulation'], faqs: [{ q: 'Can threads lift sagging cheeks and jawline?', a: 'Yes, face thread lifts provide immediate lifting for sagging areas.' }] }
    ]
  },
  {
    id: 'dermal-fillers',
    category: 'Dermal Fillers & Volume Enhancement',
    description: 'Premium hyaluronic acid fillers for natural volume enhancement',
    services: [
      { name: 'Lip Fillers', price: '₱6,000/1mL', description: 'Enhance lip volume and definition.', duration: '30-45 minutes', results: '6-12 months', benefits: ['Enhanced lip volume','Improved lip definition','Natural-looking results','Customizable enhancement'], faqs: [{ q: 'Will my lips look natural?', a: 'Yes, we focus on enhancing your natural shape for proportionate results.' }] },
      { name: 'Cheek Fillers', price: '₱6,000/1mL', description: 'Restore cheek volume and definition.', duration: '45 minutes', results: '12-18 months', benefits: ['Enhanced cheek volume','Improved facial contours','Youthful appearance','Natural-looking results'] }
    ]
  }
]

export async function GET() {
  return NextResponse.json({ ok: true, data: servicesData })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const action = String(body.action || '').trim()
    if (!action) return NextResponse.json({ ok: false, error: 'Missing action' }, { status: 400 })

    if (action === 'addService') {
      const categoryId = String(body.categoryId || '')
      const service = body.service as Service
      const cat = servicesData.find(c => c.id === categoryId)
      if (!cat) return NextResponse.json({ ok: false, error: 'Category not found' }, { status: 404 })
      cat.services.push({
        name: String(service.name || ''),
        price: String(service.price || ''),
        description: String(service.description || ''),
        duration: service.duration ? String(service.duration) : undefined,
        results: service.results ? String(service.results) : undefined,
        sessions: service.sessions ? String(service.sessions) : undefined,
        includes: service.includes ? String(service.includes) : undefined,
        originalPrice: service.originalPrice ? String(service.originalPrice) : undefined,
        badge: service.badge ? String(service.badge) : undefined,
        pricing: service.pricing ? String(service.pricing) : undefined,
        benefits: Array.isArray(service.benefits) ? service.benefits.map(String) : undefined,
        faqs: Array.isArray(service.faqs) ? service.faqs.map((f: any) => ({ q: String(f.q || ''), a: String(f.a || '') })) : undefined,
      })
      return NextResponse.json({ ok: true })
    }

    if (action === 'deleteService') {
      const categoryId = String(body.categoryId || '')
      const name = String(body.name || '')
      const cat = servicesData.find(c => c.id === categoryId)
      if (!cat) return NextResponse.json({ ok: false, error: 'Category not found' }, { status: 404 })
      cat.services = cat.services.filter(s => s.name !== name)
      return NextResponse.json({ ok: true })
    }

    if (action === 'updateService') {
      const categoryId = String(body.categoryId || '')
      const originalName = String(body.originalName || '')
      const service = body.service as Service
      const cat = servicesData.find(c => c.id === categoryId)
      if (!cat) return NextResponse.json({ ok: false, error: 'Category not found' }, { status: 404 })
      const idx = cat.services.findIndex(s => s.name === originalName)
      if (idx === -1) return NextResponse.json({ ok: false, error: 'Service not found' }, { status: 404 })
      cat.services[idx] = {
        name: String(service.name || originalName),
        price: String(service.price ?? cat.services[idx].price),
        description: String(service.description ?? cat.services[idx].description ?? ''),
        duration: service.duration !== undefined ? String(service.duration) : cat.services[idx].duration,
        results: service.results !== undefined ? String(service.results) : cat.services[idx].results,
        sessions: service.sessions !== undefined ? String(service.sessions) : cat.services[idx].sessions,
        includes: service.includes !== undefined ? String(service.includes) : cat.services[idx].includes,
        originalPrice: service.originalPrice !== undefined ? String(service.originalPrice) : cat.services[idx].originalPrice,
        badge: service.badge !== undefined ? String(service.badge) : cat.services[idx].badge,
        pricing: service.pricing !== undefined ? String(service.pricing) : cat.services[idx].pricing,
        benefits: Array.isArray(service.benefits) ? service.benefits.map(String) : cat.services[idx].benefits,
        faqs: Array.isArray(service.faqs) ? service.faqs.map((f: any) => ({ q: String(f.q || ''), a: String(f.a || '') })) : cat.services[idx].faqs,
      }
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: false, error: 'Unsupported action' }, { status: 400 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}
