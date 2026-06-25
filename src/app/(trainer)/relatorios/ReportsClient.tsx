'use client'

import { useState } from 'react'
import { FileText, Users, ClipboardList, Dumbbell, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

type Student = {
  id: string
  name: string
  evaluations?: { id: string; date: Date }[]
  workouts?: { id: string; name: string; division: string }[]
}

interface ReportsClientProps {
  students: Student[]
}

async function downloadPDF(url: string, filename: string) {
  const res = await fetch(url)
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.error ?? 'Erro ao gerar PDF')
  }
  const blob = await res.blob()
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

interface ReportButtonProps {
  label: string
  icon: React.ElementType
  onClick: () => Promise<void>
  disabled?: boolean
}

function ReportButton({ label, icon: Icon, onClick, disabled }: ReportButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    try {
      await onClick()
      toast.success('PDF gerado com sucesso!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handle}
      disabled={disabled || loading}
      className="flex w-full items-center gap-3 rounded-lg border bg-white p-4 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        {loading ? <Loader2 size={18} className="animate-spin text-gray-500" /> : <Icon size={18} className="text-gray-600" />}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-400">Clique para baixar</p>
      </div>
      {!loading && <Download size={14} className="ml-auto shrink-0 text-gray-400" />}
    </button>
  )
}

export function ReportsClient({ students }: ReportsClientProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [evalId, setEvalId] = useState<string>('')
  const [workoutId, setWorkoutId] = useState<string>('')

  const selected = students.find((s) => s.id === selectedStudentId)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ── Relatório geral ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users size={18} />
            Relatórios Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ReportButton
            label="Lista de Alunos Ativos"
            icon={Users}
            onClick={() => downloadPDF('/api/relatorios/alunos-ativos', 'alunos-ativos.pdf')}
          />
        </CardContent>
      </Card>

      {/* ── Relatórios por aluno ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText size={18} />
            Relatórios por Aluno
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-700">Selecionar aluno</p>
            <Select
              onValueChange={(v) => {
                setSelectedStudentId(v as string)
                setEvalId('')
                setWorkoutId('')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha um aluno..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <ReportButton
              label="Histórico Completo do Aluno"
              icon={FileText}
              disabled={!selectedStudentId}
              onClick={() =>
                downloadPDF(
                  `/api/relatorios/aluno/${selectedStudentId}`,
                  `relatorio-${selected?.name ?? 'aluno'}.pdf`
                )
              }
            />
            <ReportButton
              label="Última Avaliação Física"
              icon={ClipboardList}
              disabled={!selectedStudentId}
              onClick={async () => {
                // Busca a última avaliação do aluno selecionado
                const res = await fetch(`/api/alunos/${selectedStudentId}/avaliacoes`)
                const json = await res.json()
                const evals = json.data as { id: string }[]
                if (!evals || evals.length === 0) throw new Error('Nenhuma avaliação encontrada')
                const latestId = evals[0].id
                await downloadPDF(
                  `/api/relatorios/avaliacao/${latestId}`,
                  `avaliacao-${selected?.name ?? 'aluno'}.pdf`
                )
              }}
            />
            <ReportButton
              label="Treinos Ativos"
              icon={Dumbbell}
              disabled={!selectedStudentId}
              onClick={async () => {
                // Busca os treinos ativos e gera PDF do primeiro
                const res = await fetch(`/api/alunos/${selectedStudentId}/treinos`)
                const json = await res.json()
                const workouts = json.data as { id: string; name: string; division: string; isActive: boolean }[]
                const active = workouts?.filter((w) => w.isActive !== false)
                if (!active || active.length === 0) throw new Error('Nenhum treino ativo encontrado')

                // Gera um PDF por treino ativo
                for (const w of active) {
                  await downloadPDF(
                    `/api/relatorios/treino/${w.id}`,
                    `treino-${w.division}-${selected?.name ?? 'aluno'}.pdf`
                  )
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
