'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { getPurchases, ErrorCode } from '@/lib/revenuecat-client'
import { PurchasesError, type CustomerInfo } from '@revenuecat/purchases-js'
import { useRevenueCat } from '@/components/billing/RevenueCatProvider'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (customerInfo: CustomerInfo) => void
}

export default function PaywallModal({ isOpen, onClose, onSuccess }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { isLoading: rcLoading } = useRevenueCat()

  useEffect(() => {
    if (!isOpen || !containerRef.current || rcLoading) return

    setStatus('loading')
    setErrorMsg(null)

    let cancelled = false

    async function showPaywall() {
      try {
        const purchases = getPurchases()

        // Pre-fetch offerings so the paywall loads faster
        const offerings = await purchases.getOfferings()
        if (cancelled) return

        setStatus('ready')

        const result = await purchases.presentPaywall({
          htmlTarget: containerRef.current!,
          offering: offerings.current ?? undefined,
        })

        if (!cancelled) {
          onSuccess?.(result.customerInfo)
          onClose()
        }
      } catch (err) {
        if (cancelled) return

        // User cancelled — silent close
        if (
          err instanceof PurchasesError &&
          err.errorCode === ErrorCode.UserCancelledError
        ) {
          onClose()
          return
        }

        setStatus('error')
        setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      }
    }

    showPaywall()
    return () => {
      cancelled = true
    }
  }, [isOpen, rcLoading, onClose, onSuccess])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 pb-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-gray-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-base font-semibold text-white">Upgrade to Travo Pro</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors rounded-lg p-1 hover:bg-white/5"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* RevenueCat paywall container */}
        <div className="relative min-h-96">
          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
            </div>
          )}
          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-sm text-red-400 text-center">{errorMsg}</p>
              <button
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          )}
          {/* RC renders its paywall UI into this element */}
          <div ref={containerRef} className="w-full" />
        </div>
      </div>
    </div>
  )
}
