export function supabaseAvailable() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export async function supabaseFetchAppointments() {
  try {
    const res = await fetch('/api/admin/appointments', {
      cache: 'no-store',
      headers: { 'x-reveal': '1' }
    })
    if (!res.ok) return null
    const json = await res.json()
    const arr = json?.appointments || json?.data || json?.items
    return Array.isArray(arr) ? arr : []
  } catch {
    return null
  }
}

export async function supabaseInsertAppointment(row: any) {
  try {
    const res = await fetch('/api/admin/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function supabaseUpdateAppointment(id: string, updates: any) {
  try {
    const res = await fetch('/api/admin/appointments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function supabaseDeleteAppointment(id: string) {
  try {
    const res = await fetch(`/api/admin/appointments?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    return res.ok
  } catch {
    return false
  }
}

export async function supabaseFetchClients() {
  try {
    const res = await fetch('/api/admin/clients', {
      cache: 'no-store',
      headers: { 'x-reveal': '1' }
    })
    if (!res.ok) return null
    const json = await res.json()
    const arr = json?.clients || json?.data || json?.items
    return Array.isArray(arr) ? arr : []
  } catch {
    return null
  }
}

export async function supabaseFetchStaff() {
  try {
    const res = await fetch('/api/admin/staff', {
      cache: 'no-store',
      headers: { 'x-reveal': '1' }
    })
    if (!res.ok) return null
    const json = await res.json()
    const arr = json?.staff || json?.data || json?.items
    return Array.isArray(arr) ? arr : []
  } catch { return null }
}

export async function supabaseFetchPayments() {
  try {
    const res = await fetch('/api/admin/payments', {
      cache: 'no-store',
      headers: { 'x-reveal': '1' }
    })
    if (!res.ok) return null
    const json = await res.json()
    const arr = json?.payments || json?.data || json?.items
    return Array.isArray(arr) ? arr : []
  } catch { return null }
}

export async function supabaseFetchMedicalRecords() {
  try {
    const res = await fetch('/api/admin/medical-records', {
      cache: 'no-store',
      headers: { 'x-reveal': '1' }
    })
    if (!res.ok) return null
    const json = await res.json()
    const arr = json?.records || json?.data || json?.items
    return Array.isArray(arr) ? arr : []
  } catch { return null }
}

export async function supabaseFetchInfluencers() {
  try {
    const res = await fetch('/api/admin/influencers', {
      cache: 'no-store',
      headers: { 'x-reveal': '1' }
    })
    if (!res.ok) return null
    const json = await res.json()
    const arr = json?.influencers || json?.data || json?.items
    return Array.isArray(arr) ? arr : []
  } catch { return null }
}

export async function supabaseFetchReferrals() {
  try {
    const res = await fetch('/api/admin/influencer-referrals', {
      cache: 'no-store',
      headers: { 'x-reveal': '1' }
    })
    if (!res.ok) return null
    const json = await res.json()
    const arr = json?.referrals || json?.data || json?.items
    return Array.isArray(arr) ? arr : []
  } catch { return null }
}