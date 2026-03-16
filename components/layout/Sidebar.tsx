'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Globe,
  Layers,
  AlertTriangle,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'

interface User {
  email?: string | null
  id: string
}

interface Props {
  user: User | null
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/services', label: 'Services', icon: Globe },
  { href: '/stack', label: 'My Stack', icon: Layers },
  { href: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { href: '/alerts', label: 'Alerts', icon: Bell },
]

export default function Sidebar({ user }: Props) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-gray-950 border-r border-white/8 h-screen">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-white/8">
        <Link href="/dashboard">
          <Image
            src="/whitelogo.png"
            alt="Travo"
            width={88}
            height={22}
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-gray-500" />}
            </Link>
          )
        })}

        <div className="pt-4 mt-4 border-t border-white/8">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/settings')
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            Settings
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/8">
        {user ? (
          <div className="space-y-1">
            <div className="px-3 py-2">
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </aside>
  )
}
