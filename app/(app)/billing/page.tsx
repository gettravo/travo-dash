import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BillingPageClient from './BillingPageClient'

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return <BillingPageClient userEmail={user.email ?? ''} />
}
