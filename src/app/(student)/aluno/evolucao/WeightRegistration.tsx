'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function WeightRegistration() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const num = parseFloat(weight)
    if (isNaN(num) || num <= 0) {
      toast.error('Informe um peso válido')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/aluno/peso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: num }),
      })
      if (!res.ok) throw new Error()
      toast.success('Peso registrado!')
      setOpen(false)
      setWeight('')
      router.refresh()
    } catch {
      toast.error('Erro ao registrar peso')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus size={14} className="mr-1" />
        Registrar peso
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="number"
          step="0.1"
          min="0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="kg"
          autoFocus
          className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>
      <Button size="sm" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 size={14} className="animate-spin" /> : 'Salvar'}
      </Button>
      <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">
        Cancelar
      </button>
    </div>
  )
}
