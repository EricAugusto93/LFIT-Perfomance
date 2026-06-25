'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BellOff,
  CheckCheck,
  AlertCircle,
  Dumbbell,
  Activity,
  Gift,
  CalendarCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type NotificationType = 'EXPIRED_EVALUATION' | 'EXPIRED_WORKOUT' | 'NO_UPDATE' | 'BIRTHDAY' | 'PLAN_RENEWAL'

interface Notification {
  id: string
  type: NotificationType
  message: string
  read: boolean
  createdAt: Date
  student: { id: string; name: string } | null
}

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
  EXPIRED_EVALUATION: AlertCircle,
  EXPIRED_WORKOUT: Dumbbell,
  NO_UPDATE: Activity,
  BIRTHDAY: Gift,
  PLAN_RENEWAL: CalendarCheck,
}

const TYPE_COLORS: Record<NotificationType, string> = {
  EXPIRED_EVALUATION: 'text-yellow-500',
  EXPIRED_WORKOUT: 'text-red-500',
  NO_UPDATE: 'text-blue-500',
  BIRTHDAY: 'text-pink-500',
  PLAN_RENEWAL: 'text-green-500',
}

const fmt = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(d))

export function NotificacoesClient({ initialNotifications }: { initialNotifications: Notification[] }) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [markingAll, setMarkingAll] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  async function handleMarkAsRead(id: string) {
    try {
      const res = await fetch(`/api/notificacoes/${id}/lida`, { method: 'PATCH' })
      if (!res.ok) throw new Error()
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      router.refresh()
    } catch {
      toast.error('Erro ao marcar como lida')
    }
  }

  async function handleMarkAllAsRead() {
    setMarkingAll(true)
    try {
      const res = await fetch('/api/notificacoes/lidas-todas', { method: 'PATCH' })
      if (!res.ok) throw new Error()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast.success('Todas as notificações marcadas como lidas')
      router.refresh()
    } catch {
      toast.error('Erro ao marcar notificações')
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {unreadCount > 0 ? (
            <span>
              <span className="font-medium text-gray-900">{unreadCount}</span> não lida{unreadCount !== 1 ? 's' : ''}
            </span>
          ) : (
            'Todas lidas'
          )}
        </p>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
          >
            <CheckCheck size={14} className="mr-1.5" />
            {markingAll ? 'Marcando...' : 'Marcar todas como lidas'}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <BellOff size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-400">Nenhuma notificação</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = TYPE_ICONS[notif.type]
            return (
              <div
                key={notif.id}
                onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-4 transition-colors',
                  notif.read
                    ? 'bg-white opacity-60'
                    : 'cursor-pointer bg-white hover:bg-gray-50'
                )}
              >
                <div className={cn('mt-0.5 shrink-0', TYPE_COLORS[notif.type])}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', notif.read ? 'text-gray-500' : 'font-medium text-gray-900')}>
                    {notif.message}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">{fmt(notif.createdAt)}</p>
                </div>
                {!notif.read && (
                  <div className="mt-1.5 shrink-0 h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
