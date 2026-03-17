'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { type CustomerInfo } from '@revenuecat/purchases-js'
import { initializePurchases, getPurchases, isProActive } from '@/lib/revenuecat-client'

interface RevenueCatContextValue {
  customerInfo: CustomerInfo | null
  isPro: boolean
  isLoading: boolean
  refreshCustomerInfo: () => Promise<void>
}

const RevenueCatContext = createContext<RevenueCatContextValue>({
  customerInfo: null,
  isPro: false,
  isLoading: true,
  refreshCustomerInfo: async () => {},
})

export function RevenueCatProvider({
  userId,
  children,
}: {
  userId: string
  children: ReactNode
}) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshCustomerInfo = useCallback(async () => {
    try {
      const info = await getPurchases().getCustomerInfo()
      setCustomerInfo(info)
    } catch (err) {
      console.error('[RevenueCat] getCustomerInfo failed:', err)
    }
  }, [])

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    async function init() {
      try {
        const info = await initializePurchases(userId)
        if (!cancelled) setCustomerInfo(info)
      } catch (err) {
        console.error('[RevenueCat] init failed:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [userId])

  return (
    <RevenueCatContext.Provider
      value={{
        customerInfo,
        isPro: isProActive(customerInfo),
        isLoading,
        refreshCustomerInfo,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  )
}

export function useRevenueCat(): RevenueCatContextValue {
  return useContext(RevenueCatContext)
}
