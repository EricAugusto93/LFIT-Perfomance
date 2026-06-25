import { z } from 'zod'

const OBJECTIVES = ['WEIGHT_LOSS', 'HYPERTROPHY', 'CONDITIONING', 'REHABILITATION', 'PERFORMANCE'] as const
const STATUSES = ['ACTIVE', 'PAUSED', 'INACTIVE'] as const
const SEXES = ['MALE', 'FEMALE', 'OTHER'] as const

export const createStudentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  sex: z.enum(SEXES).optional(),
  height: z.coerce.number().positive().optional(),
  weight: z.coerce.number().positive().optional(),
  objective: z.enum(OBJECTIVES).optional(),
  status: z.enum(STATUSES),
  observations: z.string().optional(),
  physicalRestrictions: z.string().optional(),
  pathologies: z.string().optional(),
  medications: z.string().optional(),
})

export const updateStudentSchema = createStudentSchema.partial().extend({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').optional(),
})

export const updateStatusSchema = z.object({
  status: z.enum(STATUSES),
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>

export const OBJECTIVE_LABELS: Record<string, string> = {
  WEIGHT_LOSS: 'Emagrecimento',
  HYPERTROPHY: 'Hipertrofia',
  CONDITIONING: 'Condicionamento',
  REHABILITATION: 'Reabilitação',
  PERFORMANCE: 'Performance',
}

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  PAUSED: 'Pausado',
  INACTIVE: 'Inativo',
}

export const SEX_LABELS: Record<string, string> = {
  MALE: 'Masculino',
  FEMALE: 'Feminino',
  OTHER: 'Outro',
}
