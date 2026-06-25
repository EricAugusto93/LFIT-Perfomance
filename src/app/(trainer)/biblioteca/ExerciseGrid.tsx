'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Trash2, CirclePlay, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

import {
  createExerciseSchema,
  type CreateExerciseInput,
  MUSCLE_GROUP_LABELS,
  DIFFICULTY_LABELS,
  MUSCLE_GROUPS,
  DIFFICULTY_LEVELS,
} from '@/lib/validations/exercise.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Exercise = {
  id: string
  name: string
  muscleGroup: string
  imageUrl: string | null
  videoUrl: string | null
  equipment: string | null
  difficultyLevel: string | null
  trainerId: string | null
}

interface ExerciseGridProps {
  exercises: Exercise[]
}

const EMPTY_FORM: CreateExerciseInput = {
  name: '',
  muscleGroup: 'CHEST',
  imageUrl: '',
  videoUrl: '',
  equipment: '',
}

export function ExerciseGrid({ exercises }: ExerciseGridProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateExerciseInput>({
    resolver: zodResolver(createExerciseSchema) as never,
    defaultValues: EMPTY_FORM,
  })

  function openCreate() {
    setEditingId(null)
    reset(EMPTY_FORM)
    setOpen(true)
  }

  function openEdit(ex: Exercise) {
    setEditingId(ex.id)
    reset({
      name: ex.name,
      muscleGroup: ex.muscleGroup as CreateExerciseInput['muscleGroup'],
      imageUrl: ex.imageUrl ?? '',
      videoUrl: ex.videoUrl ?? '',
      equipment: ex.equipment ?? '',
      difficultyLevel: (ex.difficultyLevel as CreateExerciseInput['difficultyLevel']) ?? undefined,
    })
    setOpen(true)
  }

  async function onSubmit(data: CreateExerciseInput) {
    const url = editingId ? `/api/exercicios/${editingId}` : '/api/exercicios'
    const method = editingId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      toast.error('Erro ao salvar exercício')
      return
    }

    toast.success(editingId ? 'Exercício atualizado!' : 'Exercício criado!')
    setOpen(false)
    router.refresh()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Deseja excluir "${name}"?`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/exercicios/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        toast.error(json.error ?? 'Erro ao excluir')
        return
      }
      toast.success('Exercício excluído')
      router.refresh()
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" />
          Novo exercício
        </Button>
      </div>

      {exercises.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-sm text-gray-400">
          Nenhum exercício encontrado.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="flex flex-col gap-2 rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{ex.name}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {MUSCLE_GROUP_LABELS[ex.muscleGroup]}
                  </Badge>
                </div>
                {ex.trainerId && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => openEdit(ex)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(ex.id, ex.name)}
                      disabled={deleting === ex.id}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      {deleting === ex.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-0.5 text-xs text-gray-400">
                {ex.equipment && <p>{ex.equipment}</p>}
                {ex.difficultyLevel && <p>{DIFFICULTY_LABELS[ex.difficultyLevel]}</p>}
              </div>

              {ex.videoUrl && (
                <a
                  href={ex.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-red-500 hover:underline"
                >
                  <CirclePlay size={12} />
                  Ver vídeo
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Exercício' : 'Novo Exercício'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input placeholder="Nome do exercício" {...register('name')} />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Grupo muscular *</Label>
                <Select
                  defaultValue="CHEST"
                  onValueChange={(v) => setValue('muscleGroup', v as CreateExerciseInput['muscleGroup'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSCLE_GROUPS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {MUSCLE_GROUP_LABELS[g]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Dificuldade</Label>
                <Select
                  onValueChange={(v) =>
                    setValue('difficultyLevel', v as CreateExerciseInput['difficultyLevel'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {DIFFICULTY_LABELS[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Equipamento</Label>
              <Input placeholder="Ex: Barra, Halteres, Polia..." {...register('equipment')} />
            </div>

            <div className="space-y-1.5">
              <Label>Vídeo YouTube (URL)</Label>
              <Input
                placeholder="https://youtube.com/..."
                {...register('videoUrl')}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingId ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
