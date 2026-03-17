import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getAllApisWithStatus } from '@/lib/queries'
import StackDashboard from '@/components/stack/StackDashboard'
import StackSetup from '@/components/stack/StackSetup'

export const dynamic = 'force-dynamic'

export default async function StackPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [userStack, allApis] = await Promise.all([
    prisma.userStack.findUnique({ where: { userId: user.id } }),
    getAllApisWithStatus(),
  ])

  const savedSlugs = userStack?.apiSlugs ?? []
  const stackApis = allApis.filter((a) => savedSlugs.includes(a.slug))

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Stack</h1>
          <p className="text-gray-500 mt-1">
            Monitor only the APIs your project depends on.
          </p>
        </div>
      </div>

      {savedSlugs.length > 0 ? (
        <StackDashboard initialApis={stackApis} stackName={userStack?.name} />
      ) : (
        <>
          <p className="text-sm text-gray-500">
            You haven't set up your stack yet. Auto-detect from a GitHub repo or pick manually.
          </p>
          <StackSetup initialSlugs={[]} initialName={null} allApis={allApis} />
        </>
      )}
    </div>
  )
}
