'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, PowerOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface WorkoutActionsProps {
  workoutId: string
  studentId: string
  isActive: boolean
}

export function WorkoutActions({ workoutId, studentId, isActive }: WorkoutActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'duplicate' | 'deactivate' | null>(null)

  async function handleDuplicate() {
    setLoading('duplicate')
    try {
      const res = await fetch(`/api/treinos/${workoutId}/duplicar`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Treino duplicado!')
      router.push(`/alunos/${studentId}/treinos/${json.data.id}`)
      router.refresh()
    } catch {
      toast.error('Erro ao duplicar treino')
    } finally {
      setLoading(null)
    }
  }

  async function handleDeactivate() {
    if (!confirm('Deseja desativar este treino?')) return
    setLoading('deactivate')
    try {
      const res = await fetch(`/api/treinos/${workoutId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Treino desativado')
      router.push(`/alunos/${studentId}/treinos`)
      router.refresh()
    } catch {
      toast.error('Erro ao desativar treino')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={!!loading}>
        {loading === 'duplicate' ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Copy size={14} className="mr-1.5" />}
        Duplicar
      </Button>
      {isActive && (
        <Button variant="outline" size="sm" onClick={handleDeactivate}
          disabled={!!loading}
          className="border-red-200 text-red-600 hover:bg-red-50">
          {loading === 'deactivate' ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <PowerOff size={14} className="mr-1.5" />}
          Desativar
        </Button>
      )}
    </div>
  )
}
