import { describe, it, expect, beforeEach } from 'vitest'
import { servicesDataService } from '@/lib/services-data'

describe('servicesDataService', () => {
  beforeEach(() => {
    // Reset localStorage for deterministic tests
    if (typeof window !== 'undefined') {
      window.localStorage.clear()
    }
  })

  it('loads default categories when localStorage empty', () => {
    const cats = servicesDataService.getAllCategories()
    expect(Array.isArray(cats)).toBe(true)
    expect(cats.length).toBeGreaterThan(0)
  })

  it('can add, update, and delete services', () => {
    const cats = servicesDataService.getAllCategories()
    const first = cats[0]
    const okAdd = servicesDataService.addService(first.id, { name: 'Test', price: '₱0', description: 'desc' }) as any
    expect(okAdd).toBe(true)
    const afterAdd = servicesDataService.getAllCategories()
    const added = afterAdd.find(c => c.id === first.id)?.services.find(s => s.name === 'Test')
    expect(added).toBeTruthy()

    const okUpdate = servicesDataService.updateService(first.id, 'Test', { price: '₱1' })
    expect(okUpdate).toBe(true)
    const updated = servicesDataService.getAllCategories().find(c => c.id === first.id)?.services.find(s => s.name === 'Test')
    expect(updated?.price).toBe('₱1')

    const okDelete = servicesDataService.deleteService(first.id, 'Test')
    expect(okDelete).toBe(true)
    const afterDelete = servicesDataService.getAllCategories().find(c => c.id === first.id)?.services.find(s => s.name === 'Test')
    expect(afterDelete).toBeFalsy()
  })
})
