export function supabaseAvailable() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export async function supabaseFetchAppointments() {
  if (!supabaseAvailable()) return null
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/appointments?select=*` 
  const res = await fetch(url, {
    headers: {
      apikey: String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = await res.json()
  return Array.isArray(data) ? data : []
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