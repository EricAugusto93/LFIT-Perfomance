import PDFDocument from 'pdfkit'

// ─── Cores e constantes ───────────────────────────────────────────────────────

const COLORS = {
  brand: '#111827',    // gray-900
  text: '#374151',     // gray-700
  muted: '#6B7280',    // gray-500
  light: '#F9FAFB',    // gray-50
  border: '#E5E7EB',   // gray-200
  accent: '#2563EB',   // blue-600
}

const PAGE_MARGIN = 50
const PAGE_WIDTH = 595   // A4
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2

// ─── Criar documento ─────────────────────────────────────────────────────────

export function createDoc() {
  return new PDFDocument({
    size: 'A4',
    margins: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN },
    info: { Creator: 'LFit', Producer: 'LFit' },
  })
}

// ─── Gerar buffer a partir do documento ──────────────────────────────────────

export function docToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    doc.end()
  })
}

// ─── Header da página ────────────────────────────────────────────────────────

export function addHeader(doc: PDFKit.PDFDocument, title: string, subtitle?: string) {
  const x = PAGE_MARGIN

  // Fundo do header
  doc.rect(0, 0, PAGE_WIDTH, 80).fill(COLORS.brand)

  // Marca LFit
  doc.fillColor('white').fontSize(22).font('Helvetica-Bold').text('LFit', x, 22)

  // Título do relatório
  doc.fillColor('white').fontSize(11).font('Helvetica')
    .text(title, x + 60, 27, { align: 'right', width: CONTENT_WIDTH - 60 })

  if (subtitle) {
    doc.fillColor('#9CA3AF').fontSize(9).font('Helvetica')
      .text(subtitle, x + 60, 44, { align: 'right', width: CONTENT_WIDTH - 60 })
  }

  doc.moveDown(3)
  doc.fillColor(COLORS.text)
}

// ─── Rodapé ──────────────────────────────────────────────────────────────────

export function addFooter(doc: PDFKit.PDFDocument, trainerName?: string) {
  const pageHeight = 842 // A4
  const y = pageHeight - PAGE_MARGIN - 15

  doc.moveTo(PAGE_MARGIN, y).lineTo(PAGE_WIDTH - PAGE_MARGIN, y)
    .strokeColor(COLORS.border).lineWidth(0.5).stroke()

  const dateStr = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date())

  doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica')
    .text(`Gerado em ${dateStr}${trainerName ? ` · ${trainerName}` : ''}`, PAGE_MARGIN, y + 5)
    .text('LFit — Sistema de Gestão para Personal Trainer', PAGE_MARGIN, y + 5, {
      align: 'right',
      width: CONTENT_WIDTH,
    })
}

// ─── Linha separadora ─────────────────────────────────────────────────────────

export function addDivider(doc: PDFKit.PDFDocument) {
  doc.moveTo(PAGE_MARGIN, doc.y)
    .lineTo(PAGE_WIDTH - PAGE_MARGIN, doc.y)
    .strokeColor(COLORS.border).lineWidth(0.5).stroke()
  doc.moveDown(0.5)
}

// ─── Título de seção ──────────────────────────────────────────────────────────

export function addSectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.5)
  doc.fillColor(COLORS.brand).fontSize(10).font('Helvetica-Bold').text(title.toUpperCase())
  addDivider(doc)
}

// ─── Campo valor ──────────────────────────────────────────────────────────────

export function addField(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string | null | undefined,
  inline = true
) {
  if (value == null || value === '') return

  if (inline) {
    const x = PAGE_MARGIN
    const labelWidth = 160
    const valueX = x + labelWidth

    doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica')
      .text(label, x, doc.y, { continued: false, width: labelWidth })

    doc.fillColor(COLORS.text).fontSize(9).font('Helvetica')
      .text(value, valueX, doc.y - doc.currentLineHeight(true))
  } else {
    doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica').text(label)
    doc.fillColor(COLORS.text).fontSize(9).font('Helvetica').text(value).moveDown(0.3)
  }
}

// ─── Grid de campos 2 colunas ─────────────────────────────────────────────────

export function addFieldGrid(
  doc: PDFKit.PDFDocument,
  fields: { label: string; value: string | null | undefined }[]
) {
  const colWidth = CONTENT_WIDTH / 2
  let col = 0
  let rowStartY = doc.y

  for (const { label, value } of fields) {
    if (!value) continue
    const x = PAGE_MARGIN + col * colWidth

    if (col === 0) rowStartY = doc.y

    doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica')
      .text(label, x, rowStartY, { width: colWidth - 10 })
    doc.fillColor(COLORS.text).fontSize(9).font('Helvetica-Bold')
      .text(value, x, doc.y, { width: colWidth - 10 })

    col++
    if (col >= 2) {
      col = 0
      doc.moveDown(0.8)
    }
  }

  if (col !== 0) doc.moveDown(0.8)
}

// ─── Meta info do aluno ───────────────────────────────────────────────────────

export function addStudentMeta(
  doc: PDFKit.PDFDocument,
  student: { name: string; objective?: string | null },
  date?: string,
  trainerName?: string
) {
  const x = PAGE_MARGIN
  doc.fillColor(COLORS.brand).fontSize(14).font('Helvetica-Bold').text(student.name, x)
  doc.moveDown(0.2)

  const meta: string[] = []
  if (student.objective) meta.push(objectiveLabel(student.objective))
  if (date) meta.push(`Avaliação: ${date}`)
  if (trainerName) meta.push(`Personal: ${trainerName}`)

  if (meta.length > 0) {
    doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica').text(meta.join('  ·  '), x)
  }

  doc.moveDown(1)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d: Date | string) =>
  new Intl.DateTimeFormat('pt-BR').format(new Date(d))

const fmtNum = (n: number | null | undefined, unit = '') =>
  n != null ? `${n}${unit}` : '—'

function objectiveLabel(obj: string) {
  const map: Record<string, string> = {
    WEIGHT_LOSS: 'Emagrecimento',
    HYPERTROPHY: 'Hipertrofia',
    CONDITIONING: 'Condicionamento',
    REHABILITATION: 'Reabilitação',
    PERFORMANCE: 'Performance',
  }
  return map[obj] ?? obj
}

export { fmtDate, fmtNum, objectiveLabel, CONTENT_WIDTH, PAGE_MARGIN, PAGE_WIDTH, COLORS }
