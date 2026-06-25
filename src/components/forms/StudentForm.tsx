'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

import {
  createStudentSchema,
  type CreateStudentInput,
  OBJECTIVE_LABELS,
  SEX_LABELS,
  STATUS_LABELS,
} from '@/lib/validations/student.schema'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StudentFormProps {
  defaultValues?: Partial<CreateStudentInput>
  studentId?: string
}

export function StudentForm({ defaultValues, studentId }: StudentFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string>(defaultValues?.photoUrl ?? '')
  const [uploading, setUploading] = useState(false)

  const isEditing = !!studentId

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema) as never,
    defaultValues: { status: 'ACTIVE' as const, ...defaultValues },
  })

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoPreview(URL.createObjectURL(file))
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'students')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error)

      setValue('photoUrl', json.data.url)
      toast.success('Foto enviada')
    } catch {
      toast.error('Falha ao enviar foto. Verifique as credenciais do Cloudinary.')
      setPhotoPreview('')
    } finally {
      setUploading(false)
    }
  }

  function removePhoto() {
    setPhotoPreview('')
    setValue('photoUrl', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function onSubmit(data: CreateStudentInput) {
    try {
      const url = isEditing ? `/api/alunos/${studentId}` : '/api/alunos'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      toast.success(isEditing ? 'Aluno atualizado!' : 'Aluno cadastrado!')
      router.push(`/alunos/${json.data.id}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar aluno')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Foto */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Foto do Aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-100">
              {photoPreview ? (
                <>
                  <Image src={photoPreview} alt="Foto" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute right-0 top-0 rounded-full bg-red-500 p-0.5 text-white"
                  >
                    <X size={10} />
                  </button>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  <Upload size={24} />
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading && <Loader2 className="mr-2 size-3 animate-spin" />}
                {uploading ? 'Enviando...' : 'Escolher foto'}
              </Button>
              <p className="mt-1 text-xs text-gray-400">JPG, PNG ou WebP · Máx. 5 MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Nome completo *</Label>
            <Input id="name" placeholder="Nome do aluno" {...register('name')} />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="email@exemplo.com" {...register('email')} />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="(11) 99999-9999" {...register('phone')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dateOfBirth">Data de nascimento</Label>
            <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
          </div>

          <div className="space-y-1.5">
            <Label>Sexo</Label>
            <Select
              defaultValue={defaultValues?.sex}
              onValueChange={(v) => setValue('sex', v as CreateStudentInput['sex'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SEX_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="height">Altura (cm)</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              placeholder="170"
              {...register('height')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="weight">Peso atual (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="70.0"
              {...register('weight')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Objetivo e Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Objetivo e Status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Objetivo</Label>
            <Select
              defaultValue={defaultValues?.objective}
              onValueChange={(v) => setValue('objective', v as CreateStudentInput['objective'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(OBJECTIVE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              defaultValue={watch('status') ?? 'ACTIVE'}
              onValueChange={(v) => setValue('status', v as CreateStudentInput['status'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Saúde */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saúde e Observações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="observations">Observações gerais</Label>
            <textarea
              id="observations"
              rows={2}
              placeholder="Notas sobre o aluno..."
              className="border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              {...register('observations')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="physicalRestrictions">Restrições físicas</Label>
            <textarea
              id="physicalRestrictions"
              rows={2}
              placeholder="Restrições de movimento, limitações físicas..."
              className="border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              {...register('physicalRestrictions')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pathologies">Patologias e lesões</Label>
            <textarea
              id="pathologies"
              rows={2}
              placeholder="Doenças, lesões anteriores..."
              className="border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              {...register('pathologies')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="medications">Medicamentos em uso</Label>
            <Input id="medications" placeholder="Medicamentos atuais..." {...register('medications')} />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEditing ? 'Salvar alterações' : 'Cadastrar aluno'}
        </Button>
      </div>
    </form>
  )
}
