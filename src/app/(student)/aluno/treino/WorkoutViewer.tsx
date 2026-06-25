'use client'

import { useState } from 'react'
import { CirclePlay, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { MUSCLE_GROUP_LABELS } from '@/lib/validations/exercise.schema'
import { Badge } from '@/components/ui/badge'

type Exercise = {
  id: string
  name: string
  muscleGroup: string
  videoUrl: string | null
  equipment: string | null
}

type WorkoutExercise = {
  id: string
  sets: number
  reps: string
  restTime: number | null
  load: number | null
  observations: string | null
  exercise: Exercise
}

type Workout = {
  id: string
  name: string
  division: string
  exercises: WorkoutExercise[]
}

type LastLoad = { load: number; reps: number | null; recordedAt: Date }

interface WorkoutViewerProps {
  workouts: Workout[]
  lastLoads: Record<string, LastLoad>
}

// Extrai ID do YouTube de várias formas de URL
function extractYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

function ExerciseCard({
  we,
  lastLoad,
}: {
  we: WorkoutExercise
  lastLoad: LastLoad | undefined
}) {
  const [load, setLoad] = useState(lastLoad?.load?.toString() ?? we.load?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const videoId = we.exercise.videoUrl ? extractYoutubeId(we.exercise.videoUrl) : null

  async function handleSave() {
    const num = parseFloat(load)
    if (isNaN(num) || num <= 0) {
      toast.error('Informe uma carga válida')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/aluno/cargas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workoutExerciseId: we.id, load: num }),
      })
      if (!res.ok) throw new Error()
      setSaved(true)
      toast.success('Carga registrada!')
      setTimeout(() => setSaved(false), 2000)
    } catch {
      toast.error('Erro ao registrar carga')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900">{we.exercise.name}</p>
            <Badge variant="outline" className="mt-1 text-xs">
              {MUSCLE_GROUP_LABELS[we.exercise.muscleGroup]}
            </Badge>
          </div>
          {videoId && (
            <button
              onClick={() => setShowVideo((v) => !v)}
              className="shrink-0 flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs text-red-600 hover:bg-red-100"
            >
              <CirclePlay size={13} />
              {showVideo ? 'Fechar' : 'Vídeo'}
            </button>
          )}
        </div>

        {showVideo && videoId && (
          <div className="mt-3 aspect-video overflow-hidden rounded-lg">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="h-full w-full"
              allowFullScreen
              title={we.exercise.name}
            />
          </div>
        )}

        {/* Parâmetros */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-gray-50 py-2">
            <p className="text-lg font-bold text-gray-900">{we.sets}</p>
            <p className="text-xs text-gray-400">Séries</p>
          </div>
          <div className="rounded-lg bg-gray-50 py-2">
            <p className="text-lg font-bold text-gray-900">{we.reps}</p>
            <p className="text-xs text-gray-400">Reps</p>
          </div>
          <div className="rounded-lg bg-gray-50 py-2">
            <p className="text-lg font-bold text-gray-900">
              {we.restTime ? `${we.restTime}s` : '—'}
            </p>
            <p className="text-xs text-gray-400">Descanso</p>
          </div>
        </div>

        {we.load != null && (
          <p className="mt-2 text-center text-xs text-gray-400">
            Carga sugerida: <strong>{we.load} kg</strong>
          </p>
        )}

        {we.observations && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 italic">
            {we.observations}
          </p>
        )}

        {/* Registro de carga */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              step="0.5"
              min="0"
              value={load}
              onChange={(e) => setLoad(e.target.value)}
              placeholder="Carga utilizada"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 pr-8 text-sm focus:border-gray-400 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">kg</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
              saved
                ? 'bg-green-500 text-white'
                : 'bg-gray-900 text-white hover:bg-gray-700'
            )}
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : saved ? (
              <Check size={14} />
            ) : (
              <span className="text-xs font-bold">OK</span>
            )}
          </button>
        </div>

        {lastLoad && (
          <p className="mt-1.5 text-center text-xs text-gray-400">
            Última vez: {lastLoad.load} kg
            {lastLoad.reps ? ` · ${lastLoad.reps} reps` : ''}{' '}
            ({new Intl.DateTimeFormat('pt-BR').format(new Date(lastLoad.recordedAt))})
          </p>
        )}
      </div>
    </div>
  )
}

export function WorkoutViewer({ workouts, lastLoads }: WorkoutViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = workouts[activeIndex]

  return (
    <div className="space-y-4">
      {/* Tabs de divisão */}
      {workouts.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {workouts.map((w, i) => (
            <button
              key={w.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                i === activeIndex
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-200 text-gray-600 hover:border-gray-400'
              )}
            >
              Treino {w.division}
            </button>
          ))}
        </div>
      )}

      {/* Nome do treino */}
      <div className="rounded-xl bg-gray-900 px-4 py-3 text-white">
        <p className="text-xs text-gray-400">Treino {active.division}</p>
        <p className="font-semibold">{active.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{active.exercises.length} exercício{active.exercises.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Lista de exercícios */}
      <div className="space-y-3">
        {active.exercises.map((we) => (
          <ExerciseCard key={we.id} we={we} lastLoad={lastLoads[we.id]} />
        ))}
      </div>
    </div>
  )
}
