import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireTrainerSession } from '@/lib/session'
import { listComments, createComment } from '@/services/comment.service'
import type { CommentType } from '@/generated/prisma'

const COMMENT_TYPES = ['OBSERVATION', 'FEEDBACK', 'INJURY', 'ADAPTATION', 'DISCOMFORT'] as const

const createCommentSchema = z.object({
  content: z.string().min(1, 'Conteúdo obrigatório'),
  type: z.enum(COMMENT_TYPES),
})

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    const type = request.nextUrl.searchParams.get('type') as CommentType | null
    const comments = await listComments(id, session.sub, type ?? undefined)
    return NextResponse.json({ data: comments })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    const body = await request.json()
    const parsed = createCommentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const comment = await createComment(id, session.sub, parsed.data)
    return NextResponse.json({ data: comment }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
