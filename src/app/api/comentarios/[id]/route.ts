import { NextRequest, NextResponse } from 'next/server'
import { requireTrainerSession } from '@/lib/session'
import { deleteComment } from '@/services/comment.service'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    await deleteComment(id, session.sub)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Comentário não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
