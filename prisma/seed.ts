import { PrismaClient } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { hashPassword } from '../src/lib/auth'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const GLOBAL_EXERCISES = [
  // CHEST
  { name: 'Supino Reto com Barra', muscleGroup: 'CHEST', equipment: 'Barra + Banco', difficultyLevel: 'INTERMEDIATE' },
  { name: 'Supino Inclinado com Halteres', muscleGroup: 'CHEST', equipment: 'Halteres + Banco', difficultyLevel: 'INTERMEDIATE' },
  { name: 'Crucifixo com Halteres', muscleGroup: 'CHEST', equipment: 'Halteres + Banco', difficultyLevel: 'BEGINNER' },
  { name: 'Flexão de Braços', muscleGroup: 'CHEST', equipment: 'Nenhum', difficultyLevel: 'BEGINNER' },

  // BACK
  { name: 'Puxada Frontal', muscleGroup: 'BACK', equipment: 'Polia', difficultyLevel: 'BEGINNER' },
  { name: 'Remada Curvada com Barra', muscleGroup: 'BACK', equipment: 'Barra', difficultyLevel: 'INTERMEDIATE' },
  { name: 'Remada Unilateral com Halter', muscleGroup: 'BACK', equipment: 'Halter + Banco', difficultyLevel: 'BEGINNER' },
  { name: 'Levantamento Terra', muscleGroup: 'BACK', equipment: 'Barra', difficultyLevel: 'ADVANCED' },

  // SHOULDERS
  { name: 'Desenvolvimento com Halteres', muscleGroup: 'SHOULDERS', equipment: 'Halteres', difficultyLevel: 'BEGINNER' },
  { name: 'Elevação Lateral com Halteres', muscleGroup: 'SHOULDERS', equipment: 'Halteres', difficultyLevel: 'BEGINNER' },
  { name: 'Elevação Frontal com Halteres', muscleGroup: 'SHOULDERS', equipment: 'Halteres', difficultyLevel: 'BEGINNER' },
  { name: 'Desenvolvimento Arnold', muscleGroup: 'SHOULDERS', equipment: 'Halteres', difficultyLevel: 'INTERMEDIATE' },

  // BICEPS
  { name: 'Rosca Direta com Barra', muscleGroup: 'BICEPS', equipment: 'Barra', difficultyLevel: 'BEGINNER' },
  { name: 'Rosca Alternada com Halteres', muscleGroup: 'BICEPS', equipment: 'Halteres', difficultyLevel: 'BEGINNER' },
  { name: 'Rosca Martelo', muscleGroup: 'BICEPS', equipment: 'Halteres', difficultyLevel: 'BEGINNER' },

  // TRICEPS
  { name: 'Tríceps Testa com Barra', muscleGroup: 'TRICEPS', equipment: 'Barra + Banco', difficultyLevel: 'INTERMEDIATE' },
  { name: 'Tríceps Pulley', muscleGroup: 'TRICEPS', equipment: 'Polia', difficultyLevel: 'BEGINNER' },
  { name: 'Mergulho entre Bancos', muscleGroup: 'TRICEPS', equipment: 'Bancos', difficultyLevel: 'BEGINNER' },

  // QUADRICEPS
  { name: 'Agachamento Livre', muscleGroup: 'QUADRICEPS', equipment: 'Barra', difficultyLevel: 'INTERMEDIATE' },
  { name: 'Leg Press 45°', muscleGroup: 'QUADRICEPS', equipment: 'Leg Press', difficultyLevel: 'BEGINNER' },
  { name: 'Extensora', muscleGroup: 'QUADRICEPS', equipment: 'Cadeira Extensora', difficultyLevel: 'BEGINNER' },
  { name: 'Avanço com Halteres', muscleGroup: 'QUADRICEPS', equipment: 'Halteres', difficultyLevel: 'INTERMEDIATE' },

  // HAMSTRINGS
  { name: 'Mesa Flexora', muscleGroup: 'HAMSTRINGS', equipment: 'Mesa Flexora', difficultyLevel: 'BEGINNER' },
  { name: 'Stiff com Barra', muscleGroup: 'HAMSTRINGS', equipment: 'Barra', difficultyLevel: 'INTERMEDIATE' },
  { name: 'Cadeira Flexora', muscleGroup: 'HAMSTRINGS', equipment: 'Cadeira Flexora', difficultyLevel: 'BEGINNER' },

  // CALVES
  { name: 'Panturrilha em Pé', muscleGroup: 'CALVES', equipment: 'Aparelho ou Banco', difficultyLevel: 'BEGINNER' },
  { name: 'Panturrilha Sentado', muscleGroup: 'CALVES', equipment: 'Aparelho', difficultyLevel: 'BEGINNER' },

  // GLUTES
  { name: 'Glúteo no Cabo', muscleGroup: 'GLUTES', equipment: 'Polia', difficultyLevel: 'BEGINNER' },
  { name: 'Hip Thrust com Barra', muscleGroup: 'GLUTES', equipment: 'Barra + Banco', difficultyLevel: 'INTERMEDIATE' },
  { name: 'Abdução de Quadril', muscleGroup: 'GLUTES', equipment: 'Aparelho', difficultyLevel: 'BEGINNER' },

  // ABS
  { name: 'Abdominal Crunch', muscleGroup: 'ABS', equipment: 'Nenhum', difficultyLevel: 'BEGINNER' },
  { name: 'Prancha', muscleGroup: 'ABS', equipment: 'Nenhum', difficultyLevel: 'BEGINNER' },
  { name: 'Abdominal no Cabo', muscleGroup: 'ABS', equipment: 'Polia', difficultyLevel: 'INTERMEDIATE' },
] as const

async function main() {
  console.log('🌱 Iniciando seed...')

  // Criar usuário admin (Personal Trainer)
  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@lfit.com' },
  })

  if (!existingUser) {
    const passwordHash = await hashPassword('lfit@2024')
    await prisma.user.create({
      data: {
        name: 'Personal Trainer',
        email: 'admin@lfit.com',
        passwordHash,
      },
    })
    console.log('✅ Usuário admin criado: admin@lfit.com / lfit@2024')
  } else {
    console.log('ℹ️  Usuário admin já existe')
  }

  // Criar exercícios globais
  let created = 0
  for (const ex of GLOBAL_EXERCISES) {
    const existing = await prisma.exercise.findFirst({
      where: { name: ex.name, trainerId: null },
    })
    if (!existing) {
      await prisma.exercise.create({
        data: { ...ex, trainerId: null },
      })
      created++
    }
  }

  console.log(`✅ ${created} exercício(s) global(is) criado(s) (${GLOBAL_EXERCISES.length - created} já existiam)`)
  console.log('🎉 Seed concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
