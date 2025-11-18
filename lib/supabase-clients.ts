import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function supabaseBrowserClient() {
  const url = String(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  return createBrowserClient(url, key)
}

export function supabaseServerClient() {
  const cookieStore = cookies()
  const url = String(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.delete({ name, ...options })
      },
    },
  })
}