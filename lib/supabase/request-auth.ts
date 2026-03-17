import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

/**
 * Resolves the authenticated user from either:
 *  - Authorization: Bearer <token>  (mobile / API clients)
 *  - Supabase session cookie         (web browser clients)
 */
export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization')

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    // Validate the JWT against Supabase — works with both web and mobile tokens
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser(token)
    return user
  }

  // Cookie-based auth (web)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
