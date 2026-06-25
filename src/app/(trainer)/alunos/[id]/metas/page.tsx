'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { Plus, Target, Trophy, Trash2, X } from 'lucide-react'
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
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'

type GoalType = 'WEIGHT' | 'BODY_FAT' | 'MUSCLE_MASS' | 'CIRCUMFERENCE'

interface Goal {
  id: string
  type: GoalType
  targetValue: number
  currentValue: number | null
  deadline: string | null
  achieved: boolean
  createdAt: string
}

const TYPE_LABELS: Record<GoalType, string> = {
  WEIGHT: 'Peso (kg)',
  BODY_FAT: '% Gordura',
  MUSCLE_MASS: 'Massa Muscular (kg)',
  CIRCUMFERENCE: 'Circunferência (cm)',
}

const TYPE_UNITS: Record<GoalType, string> = {
  WEIGHT: 'kg',
  BODY_FAT: '%',
  MUSCLE_MASS: 'kg',
  CIRCUMFERENCE: 'cm',
}

function ProgressBar({ current, target, achieved }: { current: number | null; target: number; achieved: boolean }) {
  if (current == null) return <div className="h-2 rounded-full bg-gray-100" />
  const pct = Math.min(100, Math.round((current / target) * 100))
  return (
    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all', achieved ? 'bg-green-500' : 'bg-gray-900')}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function formatDeadline(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const label = new Intl.DateTimeFormat('pt-BR').format(d)
  if (diff < 0) return `${label} (vencida)`
  if (diff === 0) return `${label} (hoje)`
  return `${label} (${diff} dia${diff !== 1 ? 's' : ''})`
}

export default function MetasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: studentId } = use(params)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: 'WEIGHT' as GoalType, targetValue: '', currentValue: '', deadline: '' })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/alunos/${studentId}/metas`)
      .then((r) => r.json())
      .then(({ data }) => setGoals(data ?? []))
      .catch(() => toast.error('Erro ao carregar metas'))
      .finally(() => setLoading(false))
  }, [studentId])

  async function handleAdd() {
    if (!form.targetValue) return
    setSaving(true)
    try {
      const res = await fetch(`/api/alunos/${studentId}/metas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          targetValue: parseFloat(form.targetValue),
          currentValue: form.currentValue ? parseFloat(form.currentValue) : undefined,
          deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        }),
      })
      if (!res.ok) throw new Error()
      const { data } = await res.json()
      setGoals((prev) => [data, ...prev])
      setForm({ type: 'WEIGHT', targetValue: '', currentValue: '', deadline: '' })
      setShowForm(false)
      toast.success('Meta adicionada')
    } catch {
      toast.error('Erro ao criar meta')
    } finally {
      setSaving(false)
    }
  }

  async function handleAchieve(id: string) {
    try {
      const res = await fetch(`/api/metas/${id}`, { method: 'PATCH' })
      if (!res.ok) throw new Error()
      const { data } = await res.json()
      setGoals((prev) => prev.map((g) => (g.id === id ? data : g)))
      toast.success('Meta marcada como atingida!')
    } catch {
      toast.error('Erro ao atualizar meta')
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/metas/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setGoals((prev) => prev.filter((g) => g.id !== id))
      toast.success('Meta removida')
    } catch {
      toast.error('Erro ao remover meta')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <div className="py-8 text-center text-sm text-gray-400">Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{goals.length} meta{goals.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? <><X size={14} className="mr-1.5" />Cancelar</> : <><Plus size={14} className="mr-1.5" />Nova meta</>}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-white p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Tipo de meta</Label>
              <Select value={form.type} onValueChange={(v: string | null) => { if (v) setForm((f) => ({ ...f, type: v as GoalType })) }}>
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
              <Label className="text-xs">Valor alvo ({TYPE_UNITS[form.type]}) *</Label>
              <Input
                type="number"
                step="0.1"
                className="mt-1 h-8 text-sm"
                value={form.targetValue}
                onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))}
                placeholder="Ex: 75"
              />
            </div>
            <div>
              <Label className="text-xs">Valor atual ({TYPE_UNITS[form.type]})</Label>
              <Input
                type="number"
                step="0.1"
                className="mt-1 h-8 text-sm"
                value={form.currentValue}
                onChange={(e) => setForm((f) => ({ ...f, currentValue: e.target.value }))}
                placeholder="Opcional"
              />
            </div>
            <div>
              <Label className="text-xs">Prazo</Label>
              <Input
                type="date"
                className="mt-1 h-8 text-sm"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleAdd} disabled={saving || !form.targetValue}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12">
          <EmptyState icon={Target} message="Nenhuma meta definida ainda." />
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const unit = TYPE_UNITS[goal.type]
            const pct =
              goal.currentValue != null
                ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
                : 0
            const deadline = formatDeadline(goal.deadline)

            return (
              <div
                key={goal.id}
                className={cn(
                  'rounded-lg border bg-white p-4',
                  goal.achieved && 'border-green-200 bg-green-50/30'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {goal.achieved ? (
                        <Trophy size={14} className="text-green-500" />
                      ) : (
                        <Target size={14} className="text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-900">{TYPE_LABELS[goal.type]}</span>
                      {goal.achieved && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Atingida!
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {goal.currentValue != null ? `${goal.currentValue} ${unit}` : '—'} / {goal.targetValue} {unit}
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <ProgressBar current={goal.currentValue} target={goal.targetValue} achieved={goal.achieved} />
                    </div>

                    {deadline && (
                      <p className="text-xs text-gray-400">Prazo: {deadline}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {!goal.achieved && (
                      <button
                        onClick={() => handleAchieve(goal.id)}
                        className="rounded p-1 text-green-500 hover:bg-green-50"
                        title="Marcar como atingida"
                      >
                        <Trophy size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(goal.id)}
                      disabled={deletingId === goal.id}
                      className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
