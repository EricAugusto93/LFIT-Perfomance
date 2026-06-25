import { z } from 'zod'

export const measurementsSchema = z.object({
  shoulder: z.coerce.number().positive().optional(),
  chest: z.coerce.number().positive().optional(),
  waist: z.coerce.number().positive().optional(),
  abdomen: z.coerce.number().positive().optional(),
  hip: z.coerce.number().positive().optional(),
  rightArm: z.coerce.number().positive().optional(),
  leftArm: z.coerce.number().positive().optional(),
  rightThigh: z.coerce.number().positive().optional(),
  leftThigh: z.coerce.number().positive().optional(),
  rightCalf: z.coerce.number().positive().optional(),
  leftCalf: z.coerce.number().positive().optional(),
})

export const photosSchema = z.object({
  frontUrl: z.string().url().optional().or(z.literal('')),
  backUrl: z.string().url().optional().or(z.literal('')),
  leftProfileUrl: z.string().url().optional().or(z.literal('')),
  rightProfileUrl: z.string().url().optional().or(z.literal('')),
})

export const createEvaluationSchema = z.object({
  date: z.string().min(1, 'Data obrigatória'),
  weight: z.coerce.number().positive('Peso inválido').optional(),
  height: z.coerce.number().positive('Altura inválida').optional(),
  bodyFatPercentage: z.coerce.number().min(0).max(100).optional(),
  leanMass: z.coerce.number().min(0).optional(),
  muscleMass: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  measurements: measurementsSchema.optional(),
  photos: photosSchema.optional(),
})

export const updateEvaluationSchema = createEvaluationSchema.partial()

export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>
export type UpdateEvaluationInput = z.infer<typeof updateEvaluationSchema>
export type MeasurementsInput = z.infer<typeof measurementsSchema>

export const MEASUREMENT_LABELS: Record<string, string> = {
  shoulder: 'Ombro',
  chest: 'Peito',
  waist: 'Cintura',
  abdomen: 'Abdômen',
  hip: 'Quadril',
  rightArm: 'Braço Direito',
  leftArm: 'Braço Esquerdo',
  rightThigh: 'Coxa Direita',
  leftThigh: 'Coxa Esquerda',
  rightCalf: 'Panturrilha Direita',
  leftCalf: 'Panturrilha Esquerda',
}

export const MEASUREMENT_KEYS = Object.keys(MEASUREMENT_LABELS) as (keyof MeasurementsInput)[]

export const PHOTO_LABELS: Record<string, string> = {
  frontUrl: 'Frente',
  backUrl: 'Costas',
  leftProfileUrl: 'Perfil Esquerdo',
  rightProfileUrl: 'Perfil Direito',
}

// Calcula IMC
export function calcBMI(weight?: number, height?: number): number | null {
  if (!weight || !height || height <= 0) return null
  return parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1))
}

// Classifica IMC
export function bmiLabel(bmi: number): string {
  if (bmi < 18.5) return 'Abaixo do peso'
  if (bmi < 25) return 'Peso normal'
  if (bmi < 30) return 'Sobrepeso'
  if (bmi < 35) return 'Obesidade grau I'
  if (bmi < 40) return 'Obesidade grau II'
  return 'Obesidade grau III'
}
