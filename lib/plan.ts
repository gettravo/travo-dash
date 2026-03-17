import { prisma } from './prisma'

export const FREE_STACK_LIMIT = 5
export const FREE_METRICS_HOURS = 24
export const PRO_METRICS_HOURS = 168 // 7 days

export async function checkIsPro(userId: string): Promise<boolean> {
  const plan = await prisma.userPlan.findUnique({ where: { userId } })
  return plan?.isPro ?? false
}

export async function setUserPro(userId: string, isPro: boolean): Promise<void> {
  await prisma.userPlan.upsert({
    where: { userId },
    create: { userId, isPro },
    update: { isPro },
  })
}
