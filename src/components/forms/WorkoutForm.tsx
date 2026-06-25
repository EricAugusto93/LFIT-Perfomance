'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowUp, ArrowDown, Trash2, Plus, Search, Loader2, CirclePlay,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  createWorkoutSchema,
  type CreateWorkoutInput,
  DIVISIONS,
} from '@/lib/validations/workout.schema'
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUPS } from '@/lib/validations/exercise.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

type Exercise = { id: string; name: string; muscleGroup: string; videoUrl: string | null; equipment: string | null }

interface WorkoutFormProps {
  studentId: string
  workoutId?: string
  defaultValues?: Partial<CreateWorkoutInput>
  exercises: Exercise[]
}

export function WorkoutForm({ studentId, workoutId, defaultValues, exercises }: WorkoutFormProps) {
  const router = useRouter()
  const isEditing = !!workoutId

  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerMuscle, setPickerMuscle] = useState('')

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkoutInput>({
    resolver: zodResolver(createWorkoutSchema) as never,
    defaultValues: { division: 'A', exercises: [], ...defaultValues },
  })

  const { fields, append, remove, move } = useFieldArray({ control, name: 'exercises' })

  const exerciseMap = Object.fromEntries(exercises.map((e) => [e.id, e]))

  const filteredExercises = exercises.filter((e) => {
    const matchName = e.name.toLowerCase().includes(pickerSearch.toLowerCase())
    const matchMuscle = !pickerMuscle || e.muscleGroup === pickerMuscle
    const alreadyAdded = fields.some((f) => f.exerciseId === e.id)
    return matchName && matchMuscle && !alreadyAdded
  })

  function addExercise(ex: Exercise) {
    append({
      exerciseId: ex.id,
      sets: 3,
      reps: '12',
      restTime: 60,
      load: undefined,
      observations: '',
      order: fields.length + 1,
    })
    setPickerOpen(false)
    setPickerSearch('')
  }

  async function onSubmit(data: CreateWorkoutInput) {
    const exercises = data.exercises.map((ex, i) => ({ ...ex, order: i + 1 }))
    const payload = { ...data, exercises }

    try {
      const url = isEditing
        ? `/api/treinos/${workoutId}`
        : `/api/alunos/${studentId}/treinos`
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      toast.success(isEditing ? 'Treino atualizado!' : 'Treino criado!')
      router.push(`/alunos/${studentId}/treinos/${json.data.id}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar treino')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Metadados */}
      <Card>
        <CardHeader><CardTitle className="text-base">Informações do Treino</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Nome *</Label>
            <Input placeholder="Ex: Treino A — Peito e Tríceps" {...register('name')} />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Divisão *</Label>
            <Select
              defaultValue={watch('division') ?? 'A'}
              onValueChange={(v) => setValue('division', v as CreateWorkoutInput['division'])}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DIVISIONS.map((d) => (
                  <SelectItem key={d} value={d}>Treino {d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Válido até</Label>
            <Input type="date" {...register('expiresAt')} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Observações gerais</Label>
            <Input placeholder="Notas sobre o treino..." {...register('description')} />
          </div>
        </CardContent>
      </Card>

      {/* Exercícios */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            Exercícios
            {fields.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">({fields.length})</span>
            )}
          </CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
            <Plus size={14} className="mr-1" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-400">
              Nenhum exercício adicionado. Clique em &ldquo;Adicionar&rdquo;.
            </p>
          )}

          {errors.exercises && typeof errors.exercises === 'object' && 'message' in errors.exercises && (
            <p className="text-destructive text-xs">{String(errors.exercises.message)}</p>
          )}

          {fields.map((field, index) => {
            const ex = exerciseMap[field.exerciseId]
            return (
              <div key={field.id} className="rounded-lg border bg-gray-50 p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{ex?.name ?? 'Exercício'}</p>
                    <div className="flex items-center gap-2">
                      {ex && (
                        <Badge variant="outline" className="text-xs">
                          {MUSCLE_GROUP_LABELS[ex.muscleGroup]}
                        </Badge>
                      )}
                      {ex?.videoUrl && (
                        <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-red-500 hover:underline">
                          <CirclePlay size={11} /> Vídeo
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" onClick={() => move(index, index - 1)}
                      disabled={index === 0}
                      className="rounded p-1 text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-30">
                      <ArrowUp size={13} />
                    </button>
                    <button type="button" onClick={() => move(index, index + 1)}
                      disabled={index === fields.length - 1}
                      className="rounded p-1 text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-30">
                      <ArrowDown size={13} />
                    </button>
                    <button type="button" onClick={() => remove(index)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Séries</Label>
                    <Input type="number" min={1} className="h-8 text-sm"
                      {...register(`exercises.${index}.sets`)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Repetições</Label>
                    <Input placeholder="12" className="h-8 text-sm"
                      {...register(`exercises.${index}.reps`)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Descanso (s)</Label>
                    <Input type="number" min={0} placeholder="60" className="h-8 text-sm"
                      {...register(`exercises.${index}.restTime`)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Carga (kg)</Label>
                    <Input type="number" min={0} step="0.5" placeholder="—" className="h-8 text-sm"
                      {...register(`exercises.${index}.load`)} />
                  </div>
                  <div className="col-span-2 space-y-1 sm:col-span-4">
                    <Label className="text-xs">Observações</Label>
                    <Input placeholder="Dicas, variações..." className="h-8 text-sm"
                      {...register(`exercises.${index}.observations`)} />
                  </div>
                </div>
                <input type="hidden" {...register(`exercises.${index}.exerciseId`)} />
                <input type="hidden" {...register(`exercises.${index}.order`)} value={index + 1} />
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEditing ? 'Salvar alterações' : 'Criar treino'}
        </Button>
      </div>

      {/* Exercise Picker Modal */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Exercício</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar exercício..."
                className="pl-9"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPickerMuscle('')}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${!pickerMuscle ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
              >
                Todos
              </button>
              {MUSCLE_GROUPS.map((g) => (
                <button key={g} type="button" onClick={() => setPickerMuscle(g)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${pickerMuscle === g ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                  {MUSCLE_GROUP_LABELS[g]}
                </button>
              ))}
            </div>

            <div className="max-h-64 space-y-1 overflow-y-auto">
              {filteredExercises.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">Nenhum exercício encontrado.</p>
              ) : (
                filteredExercises.map((ex) => (
                  <button key={ex.id} type="button"
                    onClick={() => addExercise(ex)}
                    className="flex w-full items-center justify-between rounded-md p-2.5 text-left transition-colors hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                      <p className="text-xs text-gray-400">{MUSCLE_GROUP_LABELS[ex.muscleGroup]}{ex.equipment ? ` · ${ex.equipment}` : ''}</p>
                    </div>
                    <Plus size={14} className="shrink-0 text-gray-400" />
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  )
}
