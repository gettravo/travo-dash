import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllApisWithStatus } from '@/lib/queries'
import OnboardingStackStep from './OnboardingStackStep'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const allApis = await getAllApisWithStatus()

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-gray-900">
        <div className="h-full w-1/2 bg-blue-600 transition-all duration-500" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-900 border border-white/10 rounded-full px-3 py-1 mb-4">
              Step 1 of 2
            </div>
            <h1 className="text-3xl font-bold text-white">Set up your stack</h1>
            <p className="text-gray-500 mt-2">
              Tell Travo which APIs your project depends on. We'll monitor them for you.
            </p>
          </div>

          <OnboardingStackStep allApis={allApis} />

          <div className="text-center mt-6">
            <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-400 transition-colors">
              I'll do this later →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
