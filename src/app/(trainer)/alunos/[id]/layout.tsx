import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireTrainerSession } from '@/lib/session'
import { getStudent } from '@/services/student.service'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { OBJECTIVE_LABELS } from '@/lib/validations/student.schema'
import { StudentTabs } from './StudentTabs'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function StudentProfileLayout({ children, params }: LayoutProps) {
  const session = await requireTrainerSession()
  const { id } = await params

  let student
  try {
    student = await getStudent(id, session.sub)
  } catch {
    notFound()
  }

  const age = student.dateOfBirth
    ? Math.floor(
        (Date.now() - new Date(student.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      )
    : null

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400">
        <Link href="/alunos" className="hover:text-gray-600">
          Alunos
        </Link>
        {' / '}
        <span className="text-gray-700">{student.name}</span>
      </nav>

      {/* Profile header */}
      <div className="flex flex-col gap-4 rounded-lg border bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-200">
            {student.photoUrl ? (
              <Image src={student.photoUrl} alt={student.name} fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xl font-semibold text-gray-500">
                {student.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
              <StatusBadge status={student.status} />
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-sm text-gray-500">
              {age && <span>{age} anos</span>}
              {student.objective && (
                <span>{OBJECTIVE_LABELS[student.objective]}</span>
              )}
              {student.phone && <span>{student.phone}</span>}
            </div>
          </div>
        </div>

        <Link
          href={`/alunos/${id}/editar`}
          className="shrink-0 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Editar dados
        </Link>
      </div>

      {/* Tabs */}
      <StudentTabs studentId={id} />

      {/* Content */}
      <div>{children}</div>
    </div>
  )
}
