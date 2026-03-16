import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar user={user ? { id: user.id, email: user.email } : null} />
      <div className="flex-1 overflow-y-auto min-w-0">
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </div>
    </div>
  )
}
