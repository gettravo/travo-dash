'use client'

import { useRouter } from 'next/navigation'
import StackSetup from '@/components/stack/StackSetup'
import type { ApiWithStatus } from '@/lib/queries'

export default function OnboardingStackStep({ allApis }: { allApis: ApiWithStatus[] }) {
  const router = useRouter()

  return (
    <StackSetup
      initialSlugs={[]}
      initialName={null}
      allApis={allApis}
      onSave={() => router.push('/onboarding/alerts')}
      redirectTo="/onboarding/alerts"
    />
  )
}
