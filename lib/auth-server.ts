import { createServerClient } from "@supabase/ssr"

/**
 * Retrieve the authenticated user from a NextRequest/Request on the server.
 * Used for HIPAA audit logging and additional authorization checks.
 */
export async function getAuthUser(req: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) return null

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                const cookieStr = req.headers.get('cookie') || ''
                return cookieStr.split(';').map(c => {
                    const [name, ...val] = c.trim().split('=')
                    return { name, value: val.join('=') }
                })
            },
            setAll() { }
        }
    })

    try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return null

        // Detect our custom MFA cookie
        const cookieStr = req.headers.get('cookie') || ''
        const mfaVerified = cookieStr.includes('mfa_ok=1')

        // Inject verified status for our Access Control service
        return {
            ...user,
            mfa_verified: mfaVerified
        }
    } catch (e) {
        return null
    }
}
