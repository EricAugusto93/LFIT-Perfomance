'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

import {
  createEvaluationSchema,
  type CreateEvaluationInput,
  MEASUREMENT_LABELS,
  MEASUREMENT_KEYS,
  PHOTO_LABELS,
  calcBMI,
  bmiLabel,
} from '@/lib/validations/evaluation.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EvaluationFormProps {
  studentId: string
  evaluationId?: string
  defaultValues?: Partial<CreateEvaluationInput>
}

type PhotoKey = 'frontUrl' | 'backUrl' | 'leftProfileUrl' | 'rightProfileUrl'

export function EvaluationForm({ studentId, evaluationId, defaultValues }: EvaluationFormProps) {
  const router = useRouter()
  const isEditing = !!evaluationId
  const fileRefs = useRef<Record<PhotoKey, HTMLInputElement | null>>({
    frontUrl: null, backUrl: null, leftProfileUrl: null, rightProfileUrl: null,
  })

  const [photoPreviews, setPhotoPreviews] = useState<Partial<Record<PhotoKey, string>>>({
    frontUrl: defaultValues?.photos?.frontUrl ?? '',
    backUrl: defaultValues?.photos?.backUrl ?? '',
    leftProfileUrl: defaultValues?.photos?.leftProfileUrl ?? '',
    rightProfileUrl: defaultValues?.photos?.rightProfileUrl ?? '',
  })
  const [uploadingPhoto, setUploadingPhoto] = useState<PhotoKey | null>(null)
  const [bmiDisplay, setBmiDisplay] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateEvaluationInput>({
    resolver: zodResolver(createEvaluationSchema) as never,
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      ...defaultValues,
    },
  })

  const weight = watch('weight')
  const height = watch('height')

  useEffect(() => {
    setBmiDisplay(calcBMI(Number(weight), Number(height)))
  }, [weight, height])

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>, key: PhotoKey) {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoPreviews((p) => ({ ...p, [key]: URL.createObjectURL(file) }))
    setUploadingPhoto(key)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'evaluations')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setValue(`photos.${key}`, json.data.url)
      toast.success('Foto enviada')
    } catch {
      toast.error('Falha ao enviar foto. Verifique credenciais do Cloudinary.')
      setPhotoPreviews((p) => ({ ...p, [key]: '' }))
    } finally {
      setUploadingPhoto(null)
    }
  }

  function removePhoto(key: PhotoKey) {
    setPhotoPreviews((p) => ({ ...p, [key]: '' }))
    setValue(`photos.${key}`, '')
    const ref = fileRefs.current[key]
    if (ref) ref.value = ''
  }

  async function onSubmit(data: CreateEvaluationInput) {
    try {
      const url = isEditing ? `/api/avaliacoes/${evaluationId}` : `/api/alunos/${studentId}/avaliacoes`
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      toast.success(isEditing ? 'Avaliação atualizada!' : 'Avaliação registrada!')
      router.push(`/alunos/${studentId}/avaliacoes/${json.data.id}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* ── Dados Básicos ── */}
      <Card>
        <CardHeader><CardTitle className="text-base">Dados Básicos</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Data *</Label>
            <Input type="date" {...register('date')} />
            {errors.date && <p className="text-destructive text-xs">{errors.date.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Peso (kg)</Label>
            <Input type="number" step="0.1" placeholder="70.0" {...register('weight')} />
          </div>

          <div className="space-y-1.5">
            <Label>Altura (cm)</Label>
            <Input type="number" step="0.1" placeholder="170" {...register('height')} />
          </div>

          {/* IMC calculado automaticamente */}
          <div className="space-y-1.5">
            <Label>IMC (calculado)</Label>
            <div className="flex h-9 items-center rounded-md border bg-gray-50 px-3 text-sm">
              {bmiDisplay ? (
                <span className="font-medium text-gray-700">
                  {bmiDisplay} — {bmiLabel(bmiDisplay)}
                </span>
              ) : (
                <span className="text-gray-400">Preencha peso e altura</span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>% Gordura Corporal</Label>
            <Input type="number" step="0.1" placeholder="20.0" {...register('bodyFatPercentage')} />
          </div>

          <div className="space-y-1.5">
            <Label>Massa Magra (kg)</Label>
            <Input type="number" step="0.1" placeholder="55.0" {...register('leanMass')} />
          </div>

          <div className="space-y-1.5">
            <Label>Massa Muscular (kg)</Label>
            <Input type="number" step="0.1" placeholder="30.0" {...register('muscleMass')} />
          </div>

          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label>Observações</Label>
            <Input placeholder="Notas sobre a avaliação..." {...register('notes')} />
          </div>
        </CardContent>
      </Card>

      {/* ── Medidas Corporais ── */}
      <Card>
        <CardHeader><CardTitle className="text-base">Medidas Corporais (cm)</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {MEASUREMENT_KEYS.map((key) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs">{MEASUREMENT_LABELS[key]}</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="—"
                className="h-8 text-sm"
                {...register(`measurements.${key}`)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Fotos de Evolução ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fotos de Evolução</CardTitle>
          <p className="text-xs text-gray-400">Requer Cloudinary configurado. Campos opcionais.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(Object.keys(PHOTO_LABELS) as PhotoKey[]).map((key) => (
            <div key={key} className="space-y-2">
              <Label className="text-xs">{PHOTO_LABELS[key]}</Label>
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-gray-50">
                {photoPreviews[key] ? (
                  <>
                    <Image src={photoPreviews[key]!} alt={PHOTO_LABELS[key]} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(key)}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-0.5 text-white"
                    >
                      <X size={10} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRefs.current[key]?.click()}
                    disabled={uploadingPhoto === key}
                    className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-300 hover:text-gray-400"
                  >
                    {uploadingPhoto === key
                      ? <Loader2 size={20} className="animate-spin" />
                      : <Upload size={20} />}
                    <span className="text-xs">Carregar</span>
                  </button>
                )}
              </div>
              <input
                ref={(el) => { fileRefs.current[key] = el }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoChange(e, key)}
              />
              <input type="hidden" {...register(`photos.${key}`)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting || !!uploadingPhoto}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEditing ? 'Salvar alterações' : 'Registrar avaliação'}
        </Button>
      </div>
    </form>
  )
}
