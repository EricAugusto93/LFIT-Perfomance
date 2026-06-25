import { NextRequest, NextResponse } from 'next/server'
import { requireTrainerSession } from '@/lib/session'
import { uploadImage, type CloudinaryFolder } from '@/lib/cloudinary'

const ALLOWED_FOLDERS: CloudinaryFolder[] = ['students', 'exercises', 'evaluations']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(request: NextRequest) {
  try {
    await requireTrainerSession()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = formData.get('folder') as CloudinaryFolder | null

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }

    if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json({ error: 'Pasta inválida' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Imagem deve ter no máximo 5 MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadImage(buffer, folder)

    return NextResponse.json({ data: { url } }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    console.error('[upload]', error)
    return NextResponse.json({ error: 'Falha ao fazer upload' }, { status: 500 })
  }
}
