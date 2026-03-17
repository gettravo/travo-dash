import { Purchases, ErrorCode, LogLevel, type CustomerInfo } from '@revenuecat/purchases-js'

export { ErrorCode }
export type { CustomerInfo }

export const ENTITLEMENT_TRAVO_PRO = 'Travo Pro'

// Track which userId the SDK is currently configured for
let _configuredUserId: string | null = null

/**
 * Initialize or switch user for the RevenueCat SDK.
 * Safe to call multiple times — re-uses the existing instance if the userId hasn't changed.
 * Client-side only.
 */
export async function initializePurchases(appUserId: string): Promise<CustomerInfo> {
  if (typeof window === 'undefined') {
    throw new Error('RevenueCat SDK is client-side only')
  }

  if (_configuredUserId === appUserId) {
    // Already configured for this user — just refresh
    return Purchases.getSharedInstance().getCustomerInfo()
  }

  if (_configuredUserId !== null) {
    // User changed (e.g. account switch) — update the existing instance
    _configuredUserId = appUserId
    return Purchases.getSharedInstance().changeUser(appUserId)
  }

  // First initialization
  if (process.env.NODE_ENV !== 'production') {
    Purchases.setLogLevel(LogLevel.Debug)
  }

  Purchases.configure({
    apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY!,
    appUserId,
  })

  _configuredUserId = appUserId
  return Purchases.getSharedInstance().getCustomerInfo()
}

export function getPurchases(): Purchases {
  return Purchases.getSharedInstance()
}

export function isProActive(customerInfo: CustomerInfo | null): boolean {
  return !!customerInfo?.entitlements.active[ENTITLEMENT_TRAVO_PRO]?.isActive
}
