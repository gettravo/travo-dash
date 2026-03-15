import { formatUptime } from '@/lib/utils'

interface Props {
  uptime24h: number | null
  uptime7d: number | null
}

function UptimeStat({ label, value }: { label: string; value: number | null }) {
  const pct = value !== null ? value : null
  const color =
    pct === null
      ? 'text-gray-500'
      : pct >= 99
        ? 'text-green-400'
        : pct >= 90
          ? 'text-yellow-400'
          : 'text-red-400'

  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 font-mono ${color}`}>{formatUptime(pct)}</p>
    </div>
  )
}

export default function UptimeSummary({ uptime24h, uptime7d }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <UptimeStat label="Uptime — last 24h" value={uptime24h} />
      <UptimeStat label="Uptime — last 7d" value={uptime7d} />
    </div>
  )
}
