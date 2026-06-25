import { NextRequest } from 'next/server'
import { requireTrainerSession } from '@/lib/session'
import { generateEvaluationPDF } from '@/services/report.service'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    const buffer = await generateEvaluationPDF(id, session.sub)

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="avaliacao-${id}.pdf"`,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return Response.json({ error: 'Avaliação não encontrada' }, { status: 404 })
    }
    return Response.json({ error: 'Erro ao gerar PDF' }, { status: 500 })
  }
}
