import { getAllApisWithStatus } from '@/lib/queries'
import ServiceGrid from '@/components/services/ServiceGrid'
import StatusOverviewBanner from '@/components/dashboard/StatusOverviewBanner'

export const revalidate = 30

export default async function ServicesPage() {
  const apis = await getAllApisWithStatus()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Services</h1>
        <p className="text-gray-500 mt-1">
          Real-time health monitoring for {apis.length} developer APIs.
        </p>
      </div>

      <StatusOverviewBanner apis={apis} />

      <ServiceGrid initialApis={apis} />
    </div>
  )
}
