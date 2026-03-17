import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { checkIsPro } from '@/lib/plan'
import AlertSettingsForm from '@/components/alerts/AlertSettingsForm'

export const dynamic = 'force-dynamic'

export default async function AlertsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const isPro = await checkIsPro(user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Alerts</h1>
        <p className="text-gray-500 mt-1">
          Configure when and how you get notified about API incidents.
        </p>
      </div>

      <AlertSettingsForm userId={user.id} isPro={isPro} />
    </div>
  )
}
