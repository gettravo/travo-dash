'use client'

import { useRouter } from 'next/navigation'
import AlertSettingsForm from '@/components/alerts/AlertSettingsForm'

export default function OnboardingAlertsStep({ userId }: { userId: string }) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <AlertSettingsForm userId={userId} />
      <div className="flex justify-end">
        <button
          onClick={() => router.push('/dashboard?welcome=1')}
          className="bg-accent-600 hover:bg-accent-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Finish setup →
        </button>
      </div>
    </div>
  )
}
