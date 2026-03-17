import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getAllApisWithStatus } from '@/lib/queries'
import { checkIsPro } from '@/lib/plan'
import StackSetup from '@/components/stack/StackSetup'

export const dynamic = 'force-dynamic'

export default async function StackEditPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [userStack, allApis, isPro] = await Promise.all([
    prisma.userStack.findUnique({ where: { userId: user.id } }),
    getAllApisWithStatus(),
    checkIsPro(user.id),
  ])

  const savedSlugs = userStack?.apiSlugs ?? []

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/stack"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back to My Stack
        </Link>
        <h1 className="text-3xl font-bold text-white mt-4">Edit Stack</h1>
        <p className="text-gray-500 mt-1">
          Update the APIs you want to track.
        </p>
      </div>

      <StackSetup
        initialSlugs={savedSlugs}
        initialName={userStack?.name}
        allApis={allApis}
        isPro={isPro}
      />
    </div>
  )
}
