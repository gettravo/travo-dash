'use client'

import { useState } from 'react'
import {
  Crown,
  CheckCircle2,
  Calendar,
  RefreshCw,
  RotateCcw,
  ExternalLink,
  Zap,
} from 'lucide-react'
import { useRevenueCat } from '@/components/billing/RevenueCatProvider'
import { ENTITLEMENT_TRAVO_PRO } from '@/lib/revenuecat-client'
import PaywallModal from '@/components/billing/PaywallModal'

interface Props {
  userEmail: string
}

const PRO_FEATURES = [
  { label: 'Unlimited API monitoring', included: true },
  { label: 'Team collaboration & shared alerts', included: true },
  { label: '90-day history & analytics', included: true },
  { label: 'Priority email support', included: true },
  { label: 'Advanced incident management', included: true },
  { label: 'SLA reports', included: true },
]

export default function BillingPageClient({ userEmail }: Props) {
  const { customerInfo, isPro, isLoading, refreshCustomerInfo } = useRevenueCat()
  const [showPaywall, setShowPaywall] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const proEntitlement = customerInfo?.entitlements.active[ENTITLEMENT_TRAVO_PRO]
  const expiresDate = proEntitlement?.expirationDate
  const willRenew = proEntitlement?.willRenew
  const managementURL = customerInfo?.managementURL

  async function handleRefresh() {
    setRefreshing(true)
    try {
      await refreshCustomerInfo()
    } finally {
      setRefreshing(false)
    }
  }

  async function handleRestore() {
    setRestoring(true)
    try {
      await refreshCustomerInfo()
    } finally {
      setRestoring(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing</h1>
          <p className="text-gray-500 mt-1">Manage your subscription and plan.</p>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-32 bg-gray-900 rounded-xl" />
          <div className="h-52 bg-gray-900 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and plan.</p>
      </div>

      {/* Current plan card */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Current Plan
        </h2>

        {isPro ? (
          <div className="bg-gradient-to-br from-accent-950/60 to-gray-900 border border-accent-800/40 rounded-xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-600/20 border border-accent-600/40 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-accent-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">Travo Pro</p>
                    <span className="text-xs bg-accent-600/20 text-accent-300 border border-accent-600/30 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{userEmail}</p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-50"
                title="Refresh subscription status"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Subscription details */}
            <div className="grid grid-cols-2 gap-3">
              {expiresDate && (
                <div className="bg-white/5 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {willRenew ? 'Renews' : 'Expires'}
                  </p>
                  <p className="text-sm font-medium text-white">
                    {new Date(expiresDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
              <div className="bg-white/5 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">Auto-renewal</p>
                <p
                  className={`text-sm font-medium ${willRenew ? 'text-green-400' : 'text-yellow-400'}`}
                >
                  {willRenew ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Free Plan</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upgrade to unlock all features
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Upgrade CTA (free users) */}
      {!isPro && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Upgrade to Pro
          </h2>
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRO_FEATURES.map(({ label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{label}</span>
                </div>
              ))}
            </div>
            <div className="pt-1 border-t border-white/8 flex items-center gap-4">
              <button
                onClick={() => setShowPaywall(true)}
                className="inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                <Zap className="w-4 h-4" />
                Upgrade to Pro
              </button>
              <button
                onClick={handleRestore}
                disabled={restoring}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${restoring ? 'animate-spin' : ''}`} />
                Restore purchases
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Customer Center — manage active subscription */}
      {isPro && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Manage Subscription
          </h2>
          <div className="bg-gray-900 border border-white/10 rounded-xl divide-y divide-white/8">
            {managementURL ? (
              <a
                href={managementURL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-white">Manage Billing</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Update payment method, cancel, or change plan
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
              </a>
            ) : (
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-white">Manage Billing</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Contact support to manage your subscription
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left disabled:opacity-50"
            >
              <div>
                <p className="text-sm font-medium text-white">Restore Purchases</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Re-sync your subscription if it appears missing
                </p>
              </div>
              <RotateCcw
                className={`w-4 h-4 text-gray-600 flex-shrink-0 ${restoring ? 'animate-spin' : ''}`}
              />
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left disabled:opacity-50"
            >
              <div>
                <p className="text-sm font-medium text-white">Refresh Status</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Force-refresh your subscription status from RevenueCat
                </p>
              </div>
              <RefreshCw
                className={`w-4 h-4 text-gray-600 flex-shrink-0 ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </section>
      )}

      {/* Paywall modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSuccess={async (info) => {
          setShowPaywall(false)
          await refreshCustomerInfo()
          void info // customerInfo refreshed via refreshCustomerInfo
        }}
      />
    </div>
  )
}
