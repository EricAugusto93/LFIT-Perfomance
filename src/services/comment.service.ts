import * as repo from '@/repositories/comment.repository'
import * as studentRepo from '@/repositories/student.repository'
import type { CommentType } from '@/generated/prisma'

export async function listComments(studentId: string, trainerId: string, type?: CommentType) {
  const student = await studentRepo.findById(studentId, trainerId)
  if (!student) throw new Error('NOT_FOUND')
  return repo.findByStudent(studentId, trainerId, type)
}

export async function createComment(
  studentId: string,
  trainerId: string,
  data: { content: string; type: CommentType }
) {
  const student = await studentRepo.findById(studentId, trainerId)
  if (!student) throw new Error('NOT_FOUND')
  return repo.create({ studentId, trainerId, ...data })
}

export async function deleteComment(id: string, trainerId: string) {
  const result = await repo.remove(id, trainerId)
  if (result.count === 0) throw new Error('NOT_FOUND')
}
