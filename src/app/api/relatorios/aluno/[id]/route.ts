import { NextRequest } from 'next/server'
import { requireTrainerSession } from '@/lib/session'
import { generateStudentReportPDF } from '@/services/report.service'
import { withRetry } from '@/lib/with-retry'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    const buffer = await withRetry(() => generateStudentReportPDF(id, session.sub))

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-aluno-${id}.pdf"`,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return Response.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }
    return Response.json({ error: 'Erro ao gerar PDF' }, { status: 500 })
  }
}
