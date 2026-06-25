import { Bell } from 'lucide-react'
import { requireTrainerSession } from '@/lib/session'
import { listNotifications } from '@/services/notification.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { NotificacoesClient } from './NotificacoesClient'

export default async function NotificacoesPage() {
  const session = await requireTrainerSession()
  const notifications = await listNotifications(session.sub)
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificações"
        description={unread > 0 ? `${unread} não lida${unread !== 1 ? 's' : ''}` : 'Tudo em dia'}
      />
      <NotificacoesClient initialNotifications={notifications} />
    </div>
  )
}
