'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  CalendarDays,
  Bell,
  FileText,
  LogOut,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const BASE_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/alunos', label: 'Alunos', icon: Users },
  { href: '/biblioteca', label: 'Biblioteca', icon: Dumbbell },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/notificacoes', label: 'Notificações', icon: Bell, badge: true },
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetch('/api/notificacoes?count=true')
      .then((r) => r.json())
      .then(({ data }) => setUnreadCount(data?.count ?? 0))
      .catch(() => {})
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Sessão encerrada')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <span className="text-xl font-bold tracking-tight text-gray-900">LFit</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {BASE_NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          const showBadge = badge && unreadCount > 0
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}
