'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { loginSchema, type LoginInput } from '@/lib/validations/auth.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function AlunoLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/aluno/treino'
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginInput) {
    try {
      const res = await fetch('/api/auth/aluno/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? 'Erro ao entrar')
        return
      }
      router.push(next)
      router.refresh()
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mb-3 flex justify-center">
          <Image
            src="/logo.png"
            alt="LFit Performance"
            width={140}
            height={140}
            className="rounded-2xl shadow-2xl shadow-black/60"
            priority
          />
        </div>
        <p className="mt-1 text-sm text-gray-400">Área do Aluno</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-gray-300">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            className="border-gray-700 bg-gray-900 text-white placeholder:text-gray-500"
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-gray-300">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className="border-gray-700 bg-gray-900 pr-10 text-white placeholder:text-gray-500"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-white text-gray-900 hover:bg-gray-100"
        >
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          Entrar
        </Button>
      </form>
    </div>
  )
}

export default function AlunoLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-6">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            Carregando...
          </div>
        }
      >
        <AlunoLoginForm />
      </Suspense>
    </div>
  )
}
