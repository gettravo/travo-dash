import { uptimeBg } from '@/lib/utils'

interface Props {
  dailyBuckets: Array<{ date: string; uptime: number | null }>
}

export default function UptimeBar({ dailyBuckets }: Props) {
  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-400">90-day uptime</h3>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-green-500 inline-block" /> Operational
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-yellow-400 inline-block" /> Degraded
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> Down
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-gray-700 inline-block" /> No data
          </span>
        </div>
      </div>
      <div className="flex gap-0.5">
        {dailyBuckets.map((bucket) => (
          <div
            key={bucket.date}
            title={`${bucket.date}: ${bucket.uptime !== null ? `${bucket.uptime.toFixed(1)}%` : 'no data'}`}
            className={`flex-1 h-8 rounded-sm ${uptimeBg(bucket.uptime)} cursor-default`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-600">
        <span>90 days ago</span>
        <span>Today</span>
      </div>
    </div>
  )
}
