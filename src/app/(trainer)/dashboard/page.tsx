import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Dumbbell,
  Users,
  UserCheck,
  UserMinus,
  UserX,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { requireTrainerSession } from '@/lib/session'
import { getDashboardData } from '@/services/dashboard.service'
import type { DashboardData } from '@/services/dashboard.service'

// ─── Formatters ──────────────────────────────────────────────────────────────

const fmtTime = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(d))

const fmtDayHeader = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).format(
    new Date(d)
  )

const fmtDaysAgo = (date: Date | null): string => {
  if (!date) return 'Nunca avaliado'
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000)
  return days === 0 ? 'Hoje' : `Há ${days} dia${days !== 1 ? 's' : ''}`
}

const fmtFullDate = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupByDay(events: DashboardData['upcomingEvents']) {
  const map: Record<string, DashboardData['upcomingEvents']> = {}
  for (const ev of events) {
    const key = fmtDayHeader(ev.startAt)
    if (!map[key]) map[key] = []
    map[key].push(ev)
  }
  return Object.entries(map)
}

const EVENT_DOT: Record<string, string> = {
  EVALUATION: 'bg-amber-500',
  WORKOUT_RENEWAL: 'bg-primary',
  CONSULTATION: 'bg-blue-500',
  AVAILABILITY: 'bg-muted-foreground/40',
}

const EVENT_BORDER: Record<string, string> = {
  EVALUATION: 'border-l-amber-500',
  WORKOUT_RENEWAL: 'border-l-primary',
  CONSULTATION: 'border-l-blue-500',
  AVAILABILITY: 'border-l-muted-foreground/40',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({
  children,
  count,
}: {
  children: React.ReactNode
  count?: number
}) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <div className="h-3 w-[3px] shrink-0 rounded-full bg-primary" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {children}
      </p>
      {count != null && count > 0 && (
        <span className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary/15 px-1.5 text-[10px] font-bold leading-none text-primary">
          {count}
        </span>
      )}
    </div>
  )
}

function MetricChip({
  value,
  label,
  icon: Icon,
  variant = 'default',
  percentage,
}: {
  value: number
  label: string
  icon: LucideIcon
  variant?: 'default' | 'accent' | 'muted'
  percentage?: number
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all',
        variant === 'accent' && 'border-primary/20 bg-primary/5 dark:bg-primary/8',
        variant === 'muted' && 'border-border bg-card opacity-70',
        variant === 'default' && 'border-border bg-card'
      )}
    >
      <Icon
        size={14}
        className={cn(
          variant === 'accent' ? 'text-primary' : 'text-muted-foreground/60'
        )}
      />
      <p
        className={cn(
          'mt-2.5 text-3xl font-black tracking-tight leading-none',
          variant === 'accent' ? 'text-primary' : 'text-foreground'
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {percentage != null && (
        <div className="mt-2.5 space-y-1">
          <div className="h-[2px] w-full overflow-hidden rounded-full bg-primary/15">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-[9px] font-medium text-muted-foreground/70">{percentage}% do total</p>
        </div>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await requireTrainerSession()
  const { students, alerts, upcomingEvents } = await getDashboardData(session.sub)

  const totalAlerts = alerts.expiredEvaluations.length + alerts.expiredWorkouts.length
  const eventGroups = groupByDay(upcomingEvents)
  const activePercent =
    students.total > 0 ? Math.round((students.active / students.total) * 100) : 0

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">LFit</p>
          <h1 className="mt-0.5 text-2xl font-black tracking-tight text-foreground">
            Visão geral
          </h1>
          <p className="mt-0.5 text-[13px] capitalize text-muted-foreground">
            {fmtFullDate(new Date())}
          </p>
        </div>

        {totalAlerts > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <AlertTriangle size={11} />
            {totalAlerts} {totalAlerts === 1 ? 'alerta pendente' : 'alertas pendentes'}
          </div>
        )}
        {totalAlerts === 0 && students.total > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
            <CheckCircle2 size={11} />
            Tudo em dia
          </div>
        )}
      </div>

      {/* ── Metrics ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricChip value={students.total} label="Total" icon={Users} />
        <MetricChip
          value={students.active}
          label="Ativos"
          icon={UserCheck}
          variant="accent"
          percentage={activePercent}
        />
        <MetricChip value={students.paused} label="Pausados" icon={UserMinus} />
        <MetricChip
          value={students.inactive}
          label="Inativos"
          icon={UserX}
          variant={students.inactive > 0 ? 'muted' : 'default'}
        />
      </div>

      {/* ── No students onboarding ─────────────────────────────────────────── */}
      {students.total === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Zap size={24} className="text-primary" />
          </div>
          <h3 className="text-base font-bold text-foreground">Pronto para começar</h3>
          <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
            Cadastre seu primeiro aluno para começar a monitorar sua carteira de clientes.
          </p>
          <Link
            href="/alunos/novo"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-opacity hover:opacity-90"
          >
            Cadastrar primeiro aluno
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      {students.total > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ── Alerts column (2/3) ─────────────────────────────────────── */}
          <div className="space-y-8 lg:col-span-2">

            {/* All clear */}
            {totalAlerts === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 size={20} className="text-primary" />
                </div>
                <p className="font-bold text-foreground">Carteira em dia</p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Nenhum aluno com avaliação ou treino vencido.
                </p>
              </div>
            )}

            {/* Expired evaluations */}
            {alerts.expiredEvaluations.length > 0 && (
              <div>
                <SectionLabel count={alerts.expiredEvaluations.length}>
                  Avaliações vencidas
                </SectionLabel>
                <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                  {alerts.expiredEvaluations.map((student) => (
                    <Link
                      key={student.id}
                      href={`/alunos/${student.id}/avaliacoes`}
                      className="group flex items-center gap-3 border-l-[3px] border-l-amber-500 px-4 py-3 transition-colors hover:bg-amber-500/5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/12 text-xs font-black text-amber-600 dark:text-amber-400">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[13px] font-semibold text-foreground">
                          {student.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {fmtDaysAgo(student.lastEvaluationDate)}
                        </p>
                      </div>
                      <span className="shrink-0 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Vencida
                      </span>
                      <ArrowRight
                        size={13}
                        className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Expired workouts */}
            {alerts.expiredWorkouts.length > 0 && (
              <div>
                <SectionLabel count={alerts.expiredWorkouts.length}>
                  Treinos vencidos
                </SectionLabel>
                <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                  {alerts.expiredWorkouts.map((workout) => (
                    <Link
                      key={workout.id}
                      href={`/alunos/${workout.studentId}/treinos`}
                      className="group flex items-center gap-3 border-l-[3px] border-l-primary px-4 py-3 transition-colors hover:bg-primary/5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Dumbbell size={14} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[13px] font-semibold text-foreground">
                          {workout.studentName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {workout.name}
                        </p>
                      </div>
                      <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                        Treino {workout.division}
                      </span>
                      <ArrowRight
                        size={13}
                        className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Events column (1/3) ─────────────────────────────────────── */}
          <div>
            <SectionLabel>Esta semana</SectionLabel>

            {upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-14 text-center">
                <CalendarDays size={20} className="mb-2 text-muted-foreground/30" />
                <p className="text-[13px] text-muted-foreground">Semana sem eventos</p>
                <Link
                  href="/agenda"
                  className="mt-3 text-[11px] font-medium text-primary hover:underline"
                >
                  Abrir agenda →
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                {eventGroups.map(([day, events], groupIdx) => (
                  <div key={day}>
                    {/* Day header */}
                    <div
                      className={cn(
                        'px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground',
                        groupIdx > 0 && 'border-t border-border',
                        'bg-muted/40 dark:bg-muted/20'
                      )}
                    >
                      {day}
                    </div>
                    {/* Events for this day */}
                    {events.map((ev) => (
                      <Link
                        key={ev.id}
                        href="/agenda"
                        className={cn(
                          'group flex items-start gap-3 border-l-[3px] px-4 py-3 transition-colors hover:bg-muted/40',
                          EVENT_BORDER[ev.type] ?? 'border-l-muted-foreground/30'
                        )}
                      >
                        <div
                          className={cn(
                            'mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full',
                            EVENT_DOT[ev.type] ?? 'bg-muted-foreground'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[13px] font-semibold text-foreground">
                            {ev.title}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-muted-foreground">
                            <Clock size={9} className="shrink-0" />
                            <span>{fmtTime(ev.startAt)}</span>
                            {ev.studentName && (
                              <>
                                <span className="opacity-40">·</span>
                                <span className="truncate">{ev.studentName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ))}
                <div className="border-t border-border px-4 py-2.5">
                  <Link
                    href="/agenda"
                    className="text-[11px] font-medium text-primary transition-opacity hover:opacity-80"
                  >
                    Ver agenda completa →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
