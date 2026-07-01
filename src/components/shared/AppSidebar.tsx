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
  Sun,
  Moon,
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
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
  const { theme, toggle } = useTheme()
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
    <aside className="relative flex h-screen w-[220px] shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar">

      {/* ── Signature: ambient red neon glow from above the logo ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl dark:bg-primary/25"
      />

      {/* ── Logo ───────────────────────────────────────────────── */}
      <div className="relative z-10 flex h-[84px] shrink-0 items-center justify-center border-b border-sidebar-border px-4">
        <Image
          src="/logo.png"
          alt="LFit Performance"
          width={72}
          height={72}
          className="rounded-xl object-contain"
          priority
        />
      </div>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="relative z-10 flex-1 space-y-0.5 overflow-y-auto p-2.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          const showBadge = badge && unreadCount > 0
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-[13.5px] font-medium transition-all duration-150',
                active
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon size={16} className="shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {showBadge && (
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary-foreground/20 px-1 text-[10px] font-bold leading-none text-primary-foreground ring-1 ring-primary-foreground/30">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="relative z-10 space-y-0.5 border-t border-sidebar-border p-2.5">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13.5px] font-medium text-sidebar-foreground/60 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {theme === 'dark' ? (
            <Sun size={16} className="shrink-0" />
          ) : (
            <Moon size={16} className="shrink-0" />
          )}
          <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13.5px] font-medium text-sidebar-foreground/60 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut size={16} className="shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
