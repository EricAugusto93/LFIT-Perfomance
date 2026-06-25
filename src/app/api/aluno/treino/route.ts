import { NextResponse } from 'next/server'
import { requireStudentSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await requireStudentSession()

    const workouts = await prisma.workout.findMany({
      where: { studentId: session.sub, isActive: true },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { division: 'asc' },
    })

    // Para cada exercício, busca o último load registrado
    const workoutsWithLastLoad = await Promise.all(
      workouts.map(async (workout) => ({
        ...workout,
        exercises: await Promise.all(
          workout.exercises.map(async (we) => {
            const lastLoad = await prisma.loadRecord.findFirst({
              where: { studentId: session.sub, workoutExerciseId: we.id },
              orderBy: { recordedAt: 'desc' },
              select: { load: true, reps: true, recordedAt: true },
            })
            return { ...we, lastLoad }
          })
        ),
      }))
    )

    return NextResponse.json({ data: workoutsWithLastLoad })
  } catch {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
}
