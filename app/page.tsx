import { getAllApisWithStatus } from '@/lib/queries'
import StatusOverviewBanner from '@/components/dashboard/StatusOverviewBanner'
import ApiGrid from '@/components/dashboard/ApiGrid'

export const revalidate = 30

export default async function HomePage() {
  const apis = await getAllApisWithStatus()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">API Status</h1>
        <p className="text-gray-500 mt-1">
          Real-time health monitoring for 26 developer APIs.
        </p>
      </div>

      <StatusOverviewBanner apis={apis} />

      <ApiGrid initialApis={apis} />
    </div>
  )
}
