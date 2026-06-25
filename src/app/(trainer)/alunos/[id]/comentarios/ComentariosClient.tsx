'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, MessageSquare, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'

type CommentType = 'OBSERVATION' | 'FEEDBACK' | 'INJURY' | 'ADAPTATION' | 'DISCOMFORT'

interface Comment {
  id: string
  content: string
  type: CommentType
  createdAt: Date
}

interface ComentariosClientProps {
  studentId: string
  initialComments: Comment[]
}

const TYPE_LABELS: Record<CommentType, string> = {
  OBSERVATION: 'Observação',
  FEEDBACK: 'Feedback',
  INJURY: 'Lesão',
  ADAPTATION: 'Adaptação',
  DISCOMFORT: 'Desconforto',
}

const TYPE_COLORS: Record<CommentType, string> = {
  OBSERVATION: 'bg-gray-100 text-gray-700 border-gray-200',
  FEEDBACK: 'bg-blue-50 text-blue-700 border-blue-200',
  INJURY: 'bg-red-50 text-red-700 border-red-200',
  ADAPTATION: 'bg-green-50 text-green-700 border-green-200',
  DISCOMFORT: 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

const COMMENT_TYPES: CommentType[] = ['OBSERVATION', 'FEEDBACK', 'INJURY', 'ADAPTATION', 'DISCOMFORT']

const fmt = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(d))

export function ComentariosClient({ studentId, initialComments }: ComentariosClientProps) {
  const router = useRouter()
  const [comments, setComments] = useState(initialComments)
  const [filter, setFilter] = useState<CommentType | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [type, setType] = useState<CommentType>('OBSERVATION')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = filter ? comments.filter((c) => c.type === filter) : comments

  async function handleAdd() {
    if (!content.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/alunos/${studentId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type }),
      })
      if (!res.ok) throw new Error()
      const { data } = await res.json()
      setComments((prev) => [data, ...prev])
      setContent('')
      setShowForm(false)
      toast.success('Comentário adicionado')
    } catch {
      toast.error('Erro ao adicionar comentário')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/comentarios/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setComments((prev) => prev.filter((c) => c.id !== id))
      toast.success('Comentário removido')
      router.refresh()
    } catch {
      toast.error('Erro ao remover comentário')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {comments.length} comentário{comments.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? (
            <>
              <X size={14} className="mr-1.5" />
              Cancelar
            </>
          ) : (
            <>
              <Plus size={14} className="mr-1.5" />
              Novo comentário
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-lg border bg-white p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {COMMENT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  type === t ? TYPE_COLORS[t] + ' ring-1 ring-offset-1' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                )}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <textarea
            className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            rows={3}
            placeholder="Escreva sua observação..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={saving || !content.trim()}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      )}

      {/* Filter chips */}
      {comments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter(null)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              !filter ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'
            )}
          >
            Todos
          </button>
          {COMMENT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(filter === t ? null : t)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filter === t ? TYPE_COLORS[t] : 'border-gray-200 text-gray-500 hover:border-gray-400'
              )}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      )}

      {/* Comments list */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12">
          <EmptyState icon={MessageSquare} message="Nenhum comentário registrado ainda." />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((comment) => (
            <div key={comment.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', TYPE_COLORS[comment.type])}>
                      {TYPE_LABELS[comment.type]}
                    </span>
                    <span className="text-xs text-gray-400">{fmt(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                  className="shrink-0 rounded p-1 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
