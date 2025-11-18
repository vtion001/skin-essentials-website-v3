export function supabaseAvailable() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export async function supabaseFetchAppointments() {
  try {
    const res = await fetch('/api/admin/appointments', { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    const arr = json?.appointments
    return Array.isArray(arr) ? arr : []
  } catch {
    return null
  }
}

export async function supabaseInsertAppointment(row: any) {
  if (!supabaseAvailable()) return false
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/appointments`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  })
  return res.ok
}

export async function supabaseUpdateAppointment(id: string, updates: any) {
  if (!supabaseAvailable()) return false
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/appointments?id=eq.${encodeURIComponent(id)}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(updates),
  })
  return res.ok
}

export async function supabaseDeleteAppointment(id: string) {
  if (!supabaseAvailable()) return false
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/appointments?id=eq.${encodeURIComponent(id)}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      apikey: String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
  })
  return res.ok
}

export async function supabaseFetchClients() {
  try {
    const res = await fetch('/api/admin/clients', { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    const arr = json?.clients
    return Array.isArray(arr) ? arr : []
  } catch {
    return null
  }
}

export async function supabaseFetchStaff() {
  try {
    const res = await fetch('/api/admin/staff', { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return Array.isArray(json?.staff) ? json.staff : []
  } catch { return null }
}

export async function supabaseFetchPayments() {
  try {
    const res = await fetch('/api/admin/payments', { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return Array.isArray(json?.payments) ? json.payments : []
  } catch { return null }
}

export async function supabaseFetchMedicalRecords() {
  try {
    const res = await fetch('/api/admin/medical-records', { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return Array.isArray(json?.records) ? json.records : []
  } catch { return null }
}

export async function supabaseFetchInfluencers() {
  try {
    const res = await fetch('/api/admin/influencers', { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return Array.isArray(json?.influencers) ? json.influencers : []
  } catch { return null }
}

export async function supabaseFetchReferrals() {
  try {
    const res = await fetch('/api/admin/influencer-referrals', { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return Array.isArray(json?.referrals) ? json.referrals : []
  } catch { return null }
}