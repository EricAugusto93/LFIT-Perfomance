import Link from 'next/link'
import {
  Users,
  UserCheck,
  UserMinus,
  UserX,
  AlertTriangle,
  CalendarDays,
  Dumbbell,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { requireTrainerSession } from '@/lib/session'
import { getDashboardData } from '@/services/dashboard.service'

const SCHEDULE_TYPE_LABELS: Record<string, string> = {
  EVALUATION: 'Avaliação',
  WORKOUT_RENEWAL: 'Renovação',
  CONSULTATION: 'Consulta',
  AVAILABILITY: 'Disponível',
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function formatDaysAgo(date: Date | null): string {
  if (!date) return 'Nunca avaliado'
  const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
  return `Há ${days} dia${days !== 1 ? 's' : ''}`
}

export default async function DashboardPage() {
  const session = await requireTrainerSession()
  const { students, alerts, upcomingEvents } = await getDashboardData(session.sub)

  const totalAlerts = alerts.expiredEvaluations.length + alerts.expiredWorkouts.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visão geral dos seus alunos e atividades
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total de Alunos" value={students.total} icon={Users} />
        <StatCard title="Ativos" value={students.active} icon={UserCheck} color="green" />
        <StatCard title="Pausados" value={students.paused} icon={UserMinus} color="yellow" />
        <StatCard title="Inativos" value={students.inactive} icon={UserX} color="red" />
      </div>

      {/* Alerts + Events */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Avaliações Vencidas */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle size={18} className="text-yellow-500" />
              Avaliações Vencidas
              {alerts.expiredEvaluations.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {alerts.expiredEvaluations.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.expiredEvaluations.length === 0 ? (
              <EmptyState icon={CheckCircle2} message="Nenhuma avaliação vencida" />
            ) : (
              <ul className="space-y-3">
                {alerts.expiredEvaluations.map((student) => (
                  <li key={student.id}>
                    <Link
                      href={`/alunos/${student.id}/avaliacoes`}
                      className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50"
                    >
                      <span className="text-sm font-medium text-gray-800">{student.name}</span>
                      <span className="text-xs text-gray-400">
                        {formatDaysAgo(student.lastEvaluationDate)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Treinos Vencidos */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Dumbbell size={18} className="text-red-500" />
              Treinos Vencidos
              {alerts.expiredWorkouts.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {alerts.expiredWorkouts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.expiredWorkouts.length === 0 ? (
              <EmptyState icon={CheckCircle2} message="Nenhum treino vencido" />
            ) : (
              <ul className="space-y-3">
                {alerts.expiredWorkouts.map((workout) => (
                  <li key={workout.id}>
                    <Link
                      href={`/alunos/${workout.studentId}/treinos`}
                      className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{workout.studentName}</p>
                        <p className="text-xs text-gray-400">
                          Treino {workout.division} · {workout.name}
                        </p>
                      </div>
                      <span className="text-xs text-red-400">
                        {formatDate(workout.expiresAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Agenda da Semana */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays size={18} className="text-blue-500" />
              Agenda da Semana
              {upcomingEvents.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {upcomingEvents.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <EmptyState icon={CalendarDays} message="Nenhum evento esta semana" />
            ) : (
              <ul className="space-y-3">
                {upcomingEvents.map((event) => (
                  <li key={event.id}>
                    <Link
                      href="/agenda"
                      className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{event.title}</p>
                        {event.studentName && (
                          <p className="text-xs text-gray-400">{event.studentName}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {SCHEDULE_TYPE_LABELS[event.type] ?? event.type}
                        </Badge>
                        <p className="mt-1 text-xs text-gray-400">{formatDate(event.startAt)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Banner quando não há alertas */}
      {totalAlerts === 0 && students.total > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 size={20} className="text-green-600" />
            <p className="text-sm font-medium text-green-700">
              Tudo em dia! Nenhum aluno com avaliação ou treino vencido.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Banner de boas-vindas quando não há alunos */}
      {students.total === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <Users size={40} className="mb-3 text-gray-300" />
            <h3 className="font-semibold text-gray-700">Nenhum aluno cadastrado</h3>
            <p className="mt-1 text-sm text-gray-400">
              Comece cadastrando seu primeiro aluno para ver o dashboard completo.
            </p>
            <Link
              href="/alunos/novo"
              className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
            >
              Cadastrar primeiro aluno
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
