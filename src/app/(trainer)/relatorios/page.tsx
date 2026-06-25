import { requireTrainerSession } from '@/lib/session'
import { listStudents } from '@/services/student.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { ReportsClient } from './ReportsClient'

export default async function RelatoriosPage() {
  const session = await requireTrainerSession()
  const students = await listStudents(session.sub, { status: 'ACTIVE' })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Gere e baixe relatórios em PDF"
      />
      <ReportsClient students={students} />
    </div>
  )
}
