import { prisma } from '@/lib/prisma'
import {
  createDoc, docToBuffer, addHeader, addFooter, addSectionTitle,
  addFieldGrid, addStudentMeta, addDivider,
  fmtDate, fmtNum, objectiveLabel, PAGE_MARGIN, CONTENT_WIDTH, COLORS,
} from '@/lib/pdf'
import { MEASUREMENT_LABELS, MEASUREMENT_KEYS, bmiLabel } from '@/lib/validations/evaluation.schema'
import type { MeasurementsInput } from '@/lib/validations/evaluation.schema'

// ─── Helpers internos ─────────────────────────────────────────────────────────

async function getTrainer(trainerId: string) {
  return prisma.user.findUnique({ where: { id: trainerId }, select: { name: true } })
}

// ─── PDF: Avaliação Física ────────────────────────────────────────────────────

export async function generateEvaluationPDF(evalId: string, trainerId: string): Promise<Buffer> {
  const evaluation = await prisma.physicalEvaluation.findUnique({
    where: { id: evalId },
    include: { measurements: true, student: true },
  })

  if (!evaluation || evaluation.trainerId !== trainerId) throw new Error('NOT_FOUND')

  const trainer = await getTrainer(trainerId)
  const doc = createDoc()

  addHeader(doc, 'Avaliação Física', fmtDate(evaluation.date))
  addStudentMeta(
    doc,
    { name: evaluation.student.name, objective: evaluation.student.objective },
    fmtDate(evaluation.date),
    trainer?.name
  )

  // Dados básicos
  addSectionTitle(doc, 'Dados Básicos')
  addFieldGrid(doc, [
    { label: 'Peso', value: fmtNum(evaluation.weight, ' kg') },
    { label: 'Altura', value: fmtNum(evaluation.height, ' cm') },
    { label: 'IMC', value: evaluation.bmi ? `${evaluation.bmi} — ${bmiLabel(evaluation.bmi)}` : null },
    { label: '% Gordura Corporal', value: fmtNum(evaluation.bodyFatPercentage, '%') },
    { label: 'Massa Magra', value: fmtNum(evaluation.leanMass, ' kg') },
    { label: 'Massa Muscular', value: fmtNum(evaluation.muscleMass, ' kg') },
  ])

  // Medidas corporais
  if (evaluation.measurements) {
    addSectionTitle(doc, 'Medidas Corporais (cm)')
    const m = evaluation.measurements as unknown as Record<string, number | null>
    addFieldGrid(doc, MEASUREMENT_KEYS.map((key) => ({
      label: MEASUREMENT_LABELS[key],
      value: fmtNum(m[key], ' cm'),
    })))
  }

  // Observações
  if (evaluation.notes) {
    addSectionTitle(doc, 'Observações')
    doc.fillColor(COLORS.text).fontSize(9).font('Helvetica').text(evaluation.notes, PAGE_MARGIN)
  }

  addFooter(doc, trainer?.name)
  return docToBuffer(doc)
}

// ─── PDF: Treino ──────────────────────────────────────────────────────────────

export async function generateWorkoutPDF(workoutId: string, trainerId: string): Promise<Buffer> {
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: {
      exercises: { include: { exercise: true }, orderBy: { order: 'asc' } },
      student: true,
    },
  })

  if (!workout || workout.trainerId !== trainerId) throw new Error('NOT_FOUND')

  const trainer = await getTrainer(trainerId)
  const doc = createDoc()

  addHeader(doc, `Treino ${workout.division}`, workout.name)
  addStudentMeta(
    doc,
    { name: workout.student.name, objective: workout.student.objective },
    undefined,
    trainer?.name
  )

  if (workout.description) {
    doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica').text(workout.description, PAGE_MARGIN)
    doc.moveDown(0.5)
  }

  if (workout.expiresAt) {
    doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica')
      .text(`Válido até: ${fmtDate(workout.expiresAt)}`, PAGE_MARGIN)
    doc.moveDown(0.5)
  }

  addSectionTitle(doc, 'Exercícios')

  workout.exercises.forEach((we, index) => {
    const ex = we.exercise
    const y = doc.y

    // Número + nome
    doc.fillColor(COLORS.brand).fontSize(10).font('Helvetica-Bold')
      .text(`${index + 1}. ${ex.name}`, PAGE_MARGIN)

    // Parâmetros em linha
    const params: string[] = [
      `${we.sets} séries × ${we.reps} reps`,
      we.restTime ? `${we.restTime}s descanso` : '',
      we.load ? `${we.load} kg` : '',
    ].filter(Boolean)

    doc.fillColor(COLORS.text).fontSize(9).font('Helvetica')
      .text(params.join('   ·   '), PAGE_MARGIN + 12)

    // Grupo + equipamento
    const meta = [
      ex.muscleGroup ? muscleLabel(ex.muscleGroup) : '',
      ex.equipment ? ex.equipment : '',
    ].filter(Boolean).join(' · ')

    if (meta) {
      doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica')
        .text(meta, PAGE_MARGIN + 12)
    }

    // Observações do exercício
    if (we.observations) {
      doc.fillColor('#B45309').fontSize(8).font('Helvetica-Oblique')
        .text(`★ ${we.observations}`, PAGE_MARGIN + 12)
    }

    doc.moveDown(0.5)
    if (index < workout.exercises.length - 1) {
      doc.moveTo(PAGE_MARGIN + 12, doc.y)
        .lineTo(PAGE_MARGIN + CONTENT_WIDTH, doc.y)
        .strokeColor(COLORS.border).lineWidth(0.3).stroke()
      doc.moveDown(0.3)
    }
  })

  addFooter(doc, trainer?.name)
  return docToBuffer(doc)
}

// ─── PDF: Histórico Completo do Aluno ────────────────────────────────────────

export async function generateStudentReportPDF(studentId: string, trainerId: string): Promise<Buffer> {
  const student = await prisma.student.findFirst({ where: { id: studentId, trainerId } })
  if (!student) throw new Error('NOT_FOUND')

  const [evaluations, workouts, trainer] = await Promise.all([
    prisma.physicalEvaluation.findMany({
      where: { studentId },
      include: { measurements: true },
      orderBy: { date: 'desc' },
    }),
    prisma.workout.findMany({
      where: { studentId, isActive: true },
      include: { exercises: { include: { exercise: true }, orderBy: { order: 'asc' } } },
    }),
    getTrainer(trainerId),
  ])

  const doc = createDoc()
  addHeader(doc, 'Relatório do Aluno', fmtDate(new Date()))
  addStudentMeta(doc, student, undefined, trainer?.name)

  // Dados pessoais
  addSectionTitle(doc, 'Dados Pessoais')
  addFieldGrid(doc, [
    { label: 'Status', value: statusLabel(student.status) },
    { label: 'Objetivo', value: student.objective ? objectiveLabel(student.objective) : null },
    { label: 'E-mail', value: student.email },
    { label: 'Telefone', value: student.phone },
    { label: 'Altura', value: fmtNum(student.height, ' cm') },
    { label: 'Peso atual', value: fmtNum(student.weight, ' kg') },
  ])

  if (student.physicalRestrictions) {
    doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica').text('Restrições físicas', PAGE_MARGIN)
    doc.fillColor(COLORS.text).fontSize(9).font('Helvetica').text(student.physicalRestrictions, PAGE_MARGIN)
    doc.moveDown(0.5)
  }

  // Última avaliação
  if (evaluations.length > 0) {
    const latest = evaluations[0]
    addSectionTitle(doc, `Última Avaliação — ${fmtDate(latest.date)}`)
    addFieldGrid(doc, [
      { label: 'Peso', value: fmtNum(latest.weight, ' kg') },
      { label: 'IMC', value: latest.bmi ? `${latest.bmi}` : null },
      { label: '% Gordura', value: fmtNum(latest.bodyFatPercentage, '%') },
      { label: 'Massa Muscular', value: fmtNum(latest.muscleMass, ' kg') },
    ])

    doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica')
      .text(`Total de avaliações: ${evaluations.length}`, PAGE_MARGIN)
    doc.moveDown(0.5)
  }

  // Treinos ativos
  if (workouts.length > 0) {
    addSectionTitle(doc, 'Treinos Ativos')
    workouts.forEach((w) => {
      doc.fillColor(COLORS.brand).fontSize(9).font('Helvetica-Bold')
        .text(`Treino ${w.division} — ${w.name}`, PAGE_MARGIN)
      doc.fillColor(COLORS.text).fontSize(8).font('Helvetica')
        .text(`${w.exercises.length} exercício${w.exercises.length !== 1 ? 's' : ''}`, PAGE_MARGIN + 8)
      doc.moveDown(0.3)
    })
  }

  addFooter(doc, trainer?.name)
  return docToBuffer(doc)
}

// ─── PDF: Lista de Alunos Ativos ─────────────────────────────────────────────

export async function generateActiveStudentsPDF(trainerId: string): Promise<Buffer> {
  const [students, trainer] = await Promise.all([
    prisma.student.findMany({
      where: { trainerId, status: 'ACTIVE' },
      include: {
        evaluations: { orderBy: { date: 'desc' }, take: 1, select: { date: true } },
      },
      orderBy: { name: 'asc' },
    }),
    getTrainer(trainerId),
  ])

  const doc = createDoc()
  addHeader(doc, 'Alunos Ativos', fmtDate(new Date()))

  doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica')
    .text(`Total: ${students.length} aluno${students.length !== 1 ? 's' : ''} ativo${students.length !== 1 ? 's' : ''}`, PAGE_MARGIN)
  doc.moveDown(1)

  if (students.length === 0) {
    doc.fillColor(COLORS.muted).fontSize(10).text('Nenhum aluno ativo cadastrado.', PAGE_MARGIN)
  } else {
    // Cabeçalho da tabela
    const cols = { n: 30, name: 170, obj: 120, phone: 110, lastEval: 80 }
    const headerY = doc.y

    doc.rect(PAGE_MARGIN, headerY - 3, CONTENT_WIDTH, 16).fill('#F3F4F6')
    doc.fillColor(COLORS.brand).fontSize(8).font('Helvetica-Bold')
    doc.text('#', PAGE_MARGIN + 4, headerY)
    doc.text('Nome', PAGE_MARGIN + cols.n, headerY)
    doc.text('Objetivo', PAGE_MARGIN + cols.n + cols.name, headerY)
    doc.text('Telefone', PAGE_MARGIN + cols.n + cols.name + cols.obj, headerY)
    doc.text('Última Aval.', PAGE_MARGIN + cols.n + cols.name + cols.obj + cols.phone, headerY)
    doc.moveDown(0.8)

    students.forEach((s, i) => {
      const rowY = doc.y
      if (i % 2 === 1) {
        doc.rect(PAGE_MARGIN, rowY - 1, CONTENT_WIDTH, 13).fill('#F9FAFB')
      }

      const lastEval = s.evaluations[0]?.date
      doc.fillColor(COLORS.text).fontSize(8).font('Helvetica')
      doc.text(`${i + 1}`, PAGE_MARGIN + 4, rowY)
      doc.text(s.name, PAGE_MARGIN + cols.n, rowY, { width: cols.name - 5, ellipsis: true })
      doc.text(s.objective ? objectiveLabel(s.objective) : '—', PAGE_MARGIN + cols.n + cols.name, rowY)
      doc.text(s.phone ?? '—', PAGE_MARGIN + cols.n + cols.name + cols.obj, rowY)
      doc.text(lastEval ? fmtDate(lastEval) : '—', PAGE_MARGIN + cols.n + cols.name + cols.obj + cols.phone, rowY)
      doc.moveDown(0.55)
    })
  }

  addFooter(doc, trainer?.name)
  return docToBuffer(doc)
}

// ─── Helpers locais ───────────────────────────────────────────────────────────

function muscleLabel(m: string): string {
  const map: Record<string, string> = {
    CHEST: 'Peito', BACK: 'Costas', SHOULDERS: 'Ombros',
    BICEPS: 'Bíceps', TRICEPS: 'Tríceps', QUADRICEPS: 'Quadríceps',
    HAMSTRINGS: 'Posterior de Coxa', CALVES: 'Panturrilha',
    GLUTES: 'Glúteos', ABS: 'Abdômen',
  }
  return map[m] ?? m
}

function statusLabel(s: string): string {
  const map: Record<string, string> = { ACTIVE: 'Ativo', PAUSED: 'Pausado', INACTIVE: 'Inativo' }
  return map[s] ?? s
}
