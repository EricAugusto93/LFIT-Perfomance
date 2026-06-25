import { z } from 'zod'

export const MUSCLE_GROUPS = [
  'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS',
  'QUADRICEPS', 'HAMSTRINGS', 'CALVES', 'GLUTES', 'ABS',
] as const

export const DIFFICULTY_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const

export const createExerciseSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  muscleGroup: z.enum(MUSCLE_GROUPS),
  imageUrl: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  equipment: z.string().optional(),
  difficultyLevel: z.enum(DIFFICULTY_LEVELS).optional(),
})

export const updateExerciseSchema = createExerciseSchema.partial()

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>

export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  CHEST: 'Peito',
  BACK: 'Costas',
  SHOULDERS: 'Ombros',
  BICEPS: 'Bíceps',
  TRICEPS: 'Tríceps',
  QUADRICEPS: 'Quadríceps',
  HAMSTRINGS: 'Posterior de Coxa',
  CALVES: 'Panturrilha',
  GLUTES: 'Glúteos',
  ABS: 'Abdômen',
}

export const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
}
