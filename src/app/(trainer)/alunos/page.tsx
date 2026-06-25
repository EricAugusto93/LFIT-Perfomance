import Link from 'next/link'
import Image from 'next/image'
import { Plus, Users } from 'lucide-react'
import { requireTrainerSession } from '@/lib/session'
import { listStudents } from '@/services/student.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { StudentFilters } from './StudentFilters'
import type { StudentStatus } from '@/generated/prisma'
import { OBJECTIVE_LABELS } from '@/lib/validations/student.schema'

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>
}

export default async function AlunosPage({ searchParams }: PageProps) {
  const session = await requireTrainerSession()
  const { status, search } = await searchParams

  const students = await listStudents(session.sub, {
    status: status as StudentStatus | undefined,
    search,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alunos"
        description={`${students.length} aluno${students.length !== 1 ? 's' : ''} encontrado${students.length !== 1 ? 's' : ''}`}
        action={
          <Link href="/alunos/novo">
            <Button>
              <Plus size={16} className="mr-2" />
              Novo aluno
            </Button>
          </Link>
        }
      />

      <StudentFilters currentStatus={status} currentSearch={search} />

      {students.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12">
          <EmptyState
            icon={Users}
            message={
              status || search
                ? 'Nenhum aluno encontrado com esses filtros'
                : 'Nenhum aluno cadastrado ainda'
            }
          />
          {!status && !search && (
            <div className="mt-4 flex justify-center">
              <Link href="/alunos/novo">
                <Button variant="outline">Cadastrar primeiro aluno</Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">Objetivo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Cadastrado em</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((student) => (
                <tr key={student.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/alunos/${student.id}`} className="flex items-center gap-3">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-200">
                        {student.photoUrl ? (
                          <Image
                            src={student.photoUrl}
                            alt={student.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-500">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        {student.email && (
                          <p className="text-xs text-gray-400">{student.email}</p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {student.objective
                      ? OBJECTIVE_LABELS[student.objective]
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Intl.DateTimeFormat('pt-BR').format(new Date(student.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
