import { prisma } from '@/lib/prisma'
import type { CreateEvaluationInput } from '@/lib/validations/evaluation.schema'

const WITH_DETAILS = {
  measurements: true,
  photos: true,
}

export async function findByStudent(studentId: string) {
  return prisma.physicalEvaluation.findMany({
    where: { studentId },
    include: WITH_DETAILS,
    orderBy: { date: 'desc' },
  })
}

export async function findById(id: string) {
  return prisma.physicalEvaluation.findUnique({
    where: { id },
    include: WITH_DETAILS,
  })
}

export async function findLatestByStudent(studentId: string, limit = 2) {
  return prisma.physicalEvaluation.findMany({
    where: { studentId },
    include: WITH_DETAILS,
    orderBy: { date: 'desc' },
    take: limit,
  })
}

export async function create(
  studentId: string,
  trainerId: string,
  data: CreateEvaluationInput,
  bmi: number | null
) {
  return prisma.physicalEvaluation.create({
    data: {
      studentId,
      trainerId,
      date: new Date(data.date),
      weight: data.weight ?? null,
      height: data.height ?? null,
      bmi,
      bodyFatPercentage: data.bodyFatPercentage ?? null,
      leanMass: data.leanMass ?? null,
      muscleMass: data.muscleMass ?? null,
      notes: data.notes || null,
      measurements: data.measurements
        ? {
            create: {
              shoulder: data.measurements.shoulder ?? null,
              chest: data.measurements.chest ?? null,
              waist: data.measurements.waist ?? null,
              abdomen: data.measurements.abdomen ?? null,
              hip: data.measurements.hip ?? null,
              rightArm: data.measurements.rightArm ?? null,
              leftArm: data.measurements.leftArm ?? null,
              rightThigh: data.measurements.rightThigh ?? null,
              leftThigh: data.measurements.leftThigh ?? null,
              rightCalf: data.measurements.rightCalf ?? null,
              leftCalf: data.measurements.leftCalf ?? null,
            },
          }
        : undefined,
      photos: data.photos
        ? {
            create: {
              studentId,
              frontUrl: data.photos.frontUrl || null,
              backUrl: data.photos.backUrl || null,
              leftProfileUrl: data.photos.leftProfileUrl || null,
              rightProfileUrl: data.photos.rightProfileUrl || null,
            },
          }
        : undefined,
    },
    include: WITH_DETAILS,
  })
}

export async function update(
  id: string,
  data: Partial<CreateEvaluationInput>,
  bmi: number | null
) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.physicalEvaluation.update({
      where: { id },
      data: {
        ...(data.date && { date: new Date(data.date) }),
        ...(data.weight !== undefined && { weight: data.weight ?? null }),
        ...(data.height !== undefined && { height: data.height ?? null }),
        ...(bmi !== undefined && { bmi }),
        ...(data.bodyFatPercentage !== undefined && { bodyFatPercentage: data.bodyFatPercentage ?? null }),
        ...(data.leanMass !== undefined && { leanMass: data.leanMass ?? null }),
        ...(data.muscleMass !== undefined && { muscleMass: data.muscleMass ?? null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
      },
    })

    if (data.measurements) {
      const m = data.measurements
      await tx.bodyMeasurement.upsert({
        where: { evaluationId: id },
        create: {
          evaluationId: id,
          shoulder: m.shoulder ?? null,
          chest: m.chest ?? null,
          waist: m.waist ?? null,
          abdomen: m.abdomen ?? null,
          hip: m.hip ?? null,
          rightArm: m.rightArm ?? null,
          leftArm: m.leftArm ?? null,
          rightThigh: m.rightThigh ?? null,
          leftThigh: m.leftThigh ?? null,
          rightCalf: m.rightCalf ?? null,
          leftCalf: m.leftCalf ?? null,
        },
        update: {
          shoulder: m.shoulder ?? null,
          chest: m.chest ?? null,
          waist: m.waist ?? null,
          abdomen: m.abdomen ?? null,
          hip: m.hip ?? null,
          rightArm: m.rightArm ?? null,
          leftArm: m.leftArm ?? null,
          rightThigh: m.rightThigh ?? null,
          leftThigh: m.leftThigh ?? null,
          rightCalf: m.rightCalf ?? null,
          leftCalf: m.leftCalf ?? null,
        },
      })
    }

    return tx.physicalEvaluation.findUnique({
      where: { id },
      include: WITH_DETAILS,
    })
  })
}
