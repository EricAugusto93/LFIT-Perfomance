import * as repo from '@/repositories/student.repository'
import type { CreateStudentInput, UpdateStudentInput } from '@/lib/validations/student.schema'
import type { StudentStatus } from '@/generated/prisma'

export async function listStudents(
  trainerId: string,
  filters?: { status?: StudentStatus; search?: string }
) {
  return repo.findMany(trainerId, filters)
}

export async function getStudent(id: string, trainerId: string) {
  const student = await repo.findById(id, trainerId)
  if (!student) throw new Error('NOT_FOUND')
  return student
}

export async function createStudent(trainerId: string, data: CreateStudentInput) {
  return repo.create(trainerId, {
    trainerId,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    photoUrl: data.photoUrl || null,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    sex: data.sex ?? null,
    height: data.height ?? null,
    weight: data.weight ?? null,
    objective: data.objective ?? null,
    status: data.status,
    observations: data.observations || null,
    physicalRestrictions: data.physicalRestrictions || null,
    pathologies: data.pathologies || null,
    medications: data.medications || null,
  })
}

export async function updateStudent(id: string, trainerId: string, data: UpdateStudentInput) {
  const existing = await repo.findById(id, trainerId)
  if (!existing) throw new Error('NOT_FOUND')

  return repo.update(id, trainerId, {
    ...(data.name && { name: data.name }),
    ...(data.email !== undefined && { email: data.email || null }),
    ...(data.phone !== undefined && { phone: data.phone || null }),
    ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl || null }),
    ...(data.dateOfBirth !== undefined && {
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    }),
    ...(data.sex !== undefined && { sex: data.sex ?? null }),
    ...(data.height !== undefined && { height: data.height ?? null }),
    ...(data.weight !== undefined && { weight: data.weight ?? null }),
    ...(data.objective !== undefined && { objective: data.objective ?? null }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.observations !== undefined && { observations: data.observations || null }),
    ...(data.physicalRestrictions !== undefined && {
      physicalRestrictions: data.physicalRestrictions || null,
    }),
    ...(data.pathologies !== undefined && { pathologies: data.pathologies || null }),
    ...(data.medications !== undefined && { medications: data.medications || null }),
  })
}

export async function changeStudentStatus(id: string, trainerId: string, status: StudentStatus) {
  const existing = await repo.findById(id, trainerId)
  if (!existing) throw new Error('NOT_FOUND')
  return repo.updateStatus(id, trainerId, status)
}
