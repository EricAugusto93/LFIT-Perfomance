import { requireTrainerSession } from '@/lib/session'
import { generateActiveStudentsPDF } from '@/services/report.service'

export async function GET() {
  try {
    const session = await requireTrainerSession()
    const buffer = await generateActiveStudentsPDF(session.sub)

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="alunos-ativos.pdf"',
      },
    })
  } catch {
    return Response.json({ error: 'Erro ao gerar PDF' }, { status: 500 })
  }
}
