'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { Save, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AnamnesisData {
  mainObjective?: string
  weightTrainingExperience?: string
  weeklyFrequency?: number
  healthIssues?: string
  injuries?: string
  previousSurgeries?: string
  medications?: string
  dietaryRestrictions?: string
  sleepHours?: number
  stressLevel?: number
}

const FIELD_LABELS: Record<keyof AnamnesisData, string> = {
  mainObjective: 'Objetivo Principal',
  weightTrainingExperience: 'Experiência com Musculação',
  weeklyFrequency: 'Frequência Semanal (dias)',
  healthIssues: 'Problemas de Saúde',
  injuries: 'Lesões',
  previousSurgeries: 'Cirurgias Anteriores',
  medications: 'Medicamentos em Uso',
  dietaryRestrictions: 'Restrições Alimentares',
  sleepHours: 'Horas de Sono por Noite',
  stressLevel: 'Nível de Estresse (1–10)',
}

const NUMBER_FIELDS = new Set<keyof AnamnesisData>(['weeklyFrequency', 'sleepHours', 'stressLevel'])

export default function AnamnesePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: studentId } = use(params)
  const [form, setForm] = useState<AnamnesisData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exists, setExists] = useState(false)

  useEffect(() => {
    fetch(`/api/alunos/${studentId}/anamnese`)
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) {
          setExists(true)
          setForm({
            mainObjective: data.mainObjective ?? '',
            weightTrainingExperience: data.weightTrainingExperience ?? '',
            weeklyFrequency: data.weeklyFrequency ?? undefined,
            healthIssues: data.healthIssues ?? '',
            injuries: data.injuries ?? '',
            previousSurgeries: data.previousSurgeries ?? '',
            medications: data.medications ?? '',
            dietaryRestrictions: data.dietaryRestrictions ?? '',
            sleepHours: data.sleepHours ?? undefined,
            stressLevel: data.stressLevel ?? undefined,
          })
        }
      })
      .catch(() => toast.error('Erro ao carregar anamnese'))
      .finally(() => setLoading(false))
  }, [studentId])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/alunos/${studentId}/anamnese`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setExists(true)
      toast.success('Anamnese salva com sucesso')
    } catch {
      toast.error('Erro ao salvar anamnese')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="py-8 text-center text-sm text-gray-400">Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {exists ? 'Anamnese registrada' : 'Nenhuma anamnese registrada ainda'}
        </p>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          <Save size={14} className="mr-1.5" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList size={16} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Questionário de Anamnese</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(Object.keys(FIELD_LABELS) as (keyof AnamnesisData)[]).map((field) => {
            const isNumber = NUMBER_FIELDS.has(field)
            const value = form[field] ?? ''
            return (
              <div key={field} className={field === 'mainObjective' || field === 'weightTrainingExperience' ? 'sm:col-span-2' : ''}>
                <Label className="text-xs text-gray-600">{FIELD_LABELS[field]}</Label>
                {isNumber ? (
                  <Input
                    type="number"
                    className="mt-1 h-8 text-sm"
                    value={value}
                    min={field === 'stressLevel' ? 1 : field === 'weeklyFrequency' ? 1 : 1}
                    max={field === 'stressLevel' ? 10 : field === 'weeklyFrequency' ? 7 : 24}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [field]: e.target.value ? Number(e.target.value) : undefined }))
                    }
                  />
                ) : (
                  <textarea
                    className="mt-1 w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    rows={field === 'mainObjective' || field === 'weightTrainingExperience' ? 2 : 2}
                    value={String(value)}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    placeholder="—"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
