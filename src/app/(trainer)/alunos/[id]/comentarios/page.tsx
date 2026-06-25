import { notFound } from 'next/navigation'
import { requireTrainerSession } from '@/lib/session'
import { getStudent } from '@/services/student.service'
import { listComments } from '@/services/comment.service'
import { ComentariosClient } from './ComentariosClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ComentariosPage({ params }: PageProps) {
  const session = await requireTrainerSession()
  const { id } = await params

  let comments
  try {
    await getStudent(id, session.sub)
    comments = await listComments(id, session.sub)
  } catch {
    notFound()
  }

  return <ComentariosClient studentId={id} initialComments={comments} />
}
