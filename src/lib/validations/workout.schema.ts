import { z } from 'zod'

export const DIVISIONS = ['A', 'B', 'C', 'D', 'E', 'F'] as const

export const workoutExerciseSchema = z.object({
  exerciseId: z.string().min(1, 'Selecione um exercício'),
  sets: z.coerce.number().int().min(1, 'Mínimo 1 série'),
  reps: z.string().min(1, 'Informe as repetições'),
  restTime: z.coerce.number().int().min(0).optional(),
  load: z.coerce.number().min(0).optional(),
  observations: z.string().optional(),
  order: z.number().int(),
})

export const createWorkoutSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  division: z.enum(DIVISIONS),
  description: z.string().optional(),
  expiresAt: z.string().optional(),
  exercises: z.array(workoutExerciseSchema).min(1, 'Adicione ao menos 1 exercício'),
})

export const updateWorkoutSchema = createWorkoutSchema.partial()

export type WorkoutExerciseInput = z.infer<typeof workoutExerciseSchema>
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>
