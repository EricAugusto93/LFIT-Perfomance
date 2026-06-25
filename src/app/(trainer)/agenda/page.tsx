'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  CalendarDays,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type ScheduleEventType = 'EVALUATION' | 'WORKOUT_RENEWAL' | 'CONSULTATION' | 'AVAILABILITY'

interface ScheduleEvent {
  id: string
  type: ScheduleEventType
  title: string
  description: string | null
  startAt: string
  endAt: string
  studentId: string | null
  student: { id: string; name: string } | null
}

interface Student {
  id: string
  name: string
}

const TYPE_LABELS: Record<ScheduleEventType, string> = {
  EVALUATION: 'Avaliação',
  WORKOUT_RENEWAL: 'Renovação',
  CONSULTATION: 'Consulta',
  AVAILABILITY: 'Disponibilidade',
}

const TYPE_COLORS: Record<ScheduleEventType, string> = {
  EVALUATION: 'bg-blue-100 text-blue-700 border-blue-200',
  WORKOUT_RENEWAL: 'bg-green-100 text-green-700 border-green-200',
  CONSULTATION: 'bg-purple-100 text-purple-700 border-purple-200',
  AVAILABILITY: 'bg-gray-100 text-gray-600 border-gray-200',
}

const TYPE_DOT: Record<ScheduleEventType, string> = {
  EVALUATION: 'bg-blue-500',
  WORKOUT_RENEWAL: 'bg-green-500',
  CONSULTATION: 'bg-purple-500',
  AVAILABILITY: 'bg-gray-400',
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function localToISO(dateStr: string, timeStr: string) {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString()
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function isoToTime(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function AgendaPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    type: 'EVALUATION' as ScheduleEventType,
    title: '',
    description: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    studentId: '',
  })

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/agenda?year=${year}&month=${month}`)
      if (!res.ok) throw new Error()
      const { data } = await res.json()
      setEvents(data ?? [])
    } catch {
      toast.error('Erro ao carregar eventos')
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  useEffect(() => {
    fetch('/api/alunos')
      .then((r) => r.json())
      .then(({ data }) => setStudents(data ?? []))
      .catch(() => {})
  }, [])

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()

  const eventsByDay: Record<string, ScheduleEvent[]> = {}
  for (const ev of events) {
    const d = new Date(ev.startAt)
    const key = toDateKey(d.getFullYear(), d.getMonth() + 1, d.getDate())
    if (!eventsByDay[key]) eventsByDay[key] = []
    eventsByDay[key].push(ev)
  }

  function openCreateForm(dateKey: string) {
    setEditingEvent(null)
    setForm({
      type: 'EVALUATION',
      title: '',
      description: '',
      date: dateKey,
      startTime: '09:00',
      endTime: '10:00',
      studentId: '',
    })
    setSelectedDay(dateKey)
    setShowForm(true)
  }

  function openEditForm(ev: ScheduleEvent) {
    const d = new Date(ev.startAt)
    const dateKey = toDateKey(d.getFullYear(), d.getMonth() + 1, d.getDate())
    setEditingEvent(ev)
    setForm({
      type: ev.type,
      title: ev.title,
      description: ev.description ?? '',
      date: dateKey,
      startTime: isoToTime(ev.startAt),
      endTime: isoToTime(ev.endAt),
      studentId: ev.studentId ?? '',
    })
    setSelectedDay(dateKey)
    setShowForm(true)
  }

  async function handleSubmit() {
    if (!form.title || !form.date) return
    const startAt = localToISO(form.date, form.startTime)
    const endAt = localToISO(form.date, form.endTime)

    const body = {
      type: form.type,
      title: form.title,
      description: form.description || undefined,
      startAt,
      endAt,
      studentId: form.studentId || undefined,
    }

    try {
      if (editingEvent) {
        const res = await fetch(`/api/agenda/${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error()
        toast.success('Evento atualizado')
      } else {
        const res = await fetch('/api/agenda', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error()
        toast.success('Evento criado')
      }
      setShowForm(false)
      fetchEvents()
    } catch {
      toast.error('Erro ao salvar evento')
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/agenda/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Evento removido')
      setShowForm(false)
      fetchEvents()
    } catch {
      toast.error('Erro ao remover evento')
    } finally {
      setDeletingId(null)
    }
  }

  const todayKey = toDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate())
  const selectedDayEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="mt-1 text-sm text-gray-500">Eventos e compromissos</p>
        </div>
        <Button size="sm" onClick={() => openCreateForm(todayKey)}>
          <Plus size={14} className="mr-1.5" />
          Novo evento
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2 rounded-xl border bg-white overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <button onClick={prevMonth} className="rounded p-1 text-gray-400 hover:bg-gray-100">
              <ChevronLeft size={18} />
            </button>
            <span className="font-semibold text-gray-900">
              {MONTHS[month - 1]} {year}
            </span>
            <button onClick={nextMonth} className="rounded p-1 text-gray-400 hover:bg-gray-100">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="border-b border-r p-2 min-h-[80px]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const key = toDateKey(year, month, day)
              const dayEvents = eventsByDay[key] ?? []
              const isToday = key === todayKey
              const isSelected = key === selectedDay

              return (
                <div
                  key={day}
                  onClick={() => { setSelectedDay(key); setShowForm(false) }}
                  className={cn(
                    'border-b border-r p-2 min-h-[80px] cursor-pointer transition-colors',
                    isSelected ? 'bg-gray-50' : 'hover:bg-gray-50/50'
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-sm',
                        isToday ? 'bg-gray-900 text-white font-bold' : 'text-gray-700'
                      )}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-xs text-gray-400">{dayEvents.length}</span>
                    )}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => { e.stopPropagation(); openEditForm(ev) }}
                        className={cn(
                          'flex items-center gap-1 rounded px-1 py-0.5 text-xs cursor-pointer hover:opacity-80',
                          TYPE_COLORS[ev.type]
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', TYPE_DOT[ev.type])} />
                        <span className="truncate">{ev.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-xs text-gray-400 pl-1">+{dayEvents.length - 2} mais</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar: Day detail / Form */}
        <div className="space-y-4">
          {showForm ? (
            <div className="rounded-xl border bg-white p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  {editingEvent ? 'Editar evento' : 'Novo evento'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Tipo</Label>
                  <Select value={form.type} onValueChange={(v: string | null) => { if (v) setForm((f) => ({ ...f, type: v as ScheduleEventType })) }}>
                    <SelectTrigger className="mt-1 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Título *</Label>
                  <Input
                    className="mt-1 h-8 text-sm"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Título do evento"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Início</Label>
                    <Input
                      type="time"
                      className="mt-1 h-8 text-sm"
                      value={form.startTime}
                      onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fim</Label>
                    <Input
                      type="time"
                      className="mt-1 h-8 text-sm"
                      value={form.endTime}
                      onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Aluno (opcional)</Label>
                  <Select
                    value={form.studentId || 'none'}
                    onValueChange={(v: string | null) => setForm((f) => ({ ...f, studentId: v === 'none' || v == null ? '' : v }))}
                  >
                    <SelectTrigger className="mt-1 h-8 text-sm">
                      <SelectValue placeholder="Nenhum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Descrição</Label>
                  <Input
                    className="mt-1 h-8 text-sm"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                {editingEvent && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(editingEvent.id)}
                    disabled={deletingId === editingEvent.id}
                  >
                    <Trash2 size={13} className="mr-1" />
                    Excluir
                  </Button>
                )}
                <Button size="sm" className="flex-1" onClick={handleSubmit} disabled={!form.title}>
                  {editingEvent ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </div>
          ) : selectedDay ? (
            <div className="rounded-xl border bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(
                    new Date(selectedDay + 'T12:00:00')
                  )}
                </h2>
                <Button size="sm" variant="outline" onClick={() => openCreateForm(selectedDay)}>
                  <Plus size={13} className="mr-1" />
                  Evento
                </Button>
              </div>

              {selectedDayEvents.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Nenhum evento neste dia</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => openEditForm(ev)}
                      className={cn(
                        'cursor-pointer rounded-lg border p-3 transition-opacity hover:opacity-80',
                        TYPE_COLORS[ev.type]
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{ev.title}</p>
                        <span className="text-xs opacity-70">{TYPE_LABELS[ev.type]}</span>
                      </div>
                      <p className="mt-0.5 text-xs opacity-70">
                        {formatTime(ev.startAt)} – {formatTime(ev.endAt)}
                      </p>
                      {ev.student && (
                        <p className="mt-0.5 text-xs opacity-70">{ev.student.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-white p-6 text-center">
              <CalendarDays size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">Clique em um dia para ver eventos ou criar um novo</p>
            </div>
          )}

          {/* Legend */}
          <div className="rounded-xl border bg-white p-4">
            <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Legenda</p>
            <div className="space-y-1.5">
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', TYPE_DOT[k as ScheduleEventType])} />
                  <span className="text-xs text-gray-600">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
