import { createBrowserClient } from '@supabase/ssr'

let browserClient: any = null

export function supabaseBrowserClient() {
    if (browserClient) return browserClient

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key || url === 'undefined') {
        return null
    }
    browserClient = createBrowserClient(url, key)
    return browserClient
}
