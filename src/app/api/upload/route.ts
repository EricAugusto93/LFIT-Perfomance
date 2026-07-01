import { NextRequest, NextResponse } from 'next/server'
import { requireTrainerSession } from '@/lib/session'
import { uploadImage, type StorageBucket } from '@/lib/storage'

const ALLOWED_BUCKETS: StorageBucket[] = ['lfit-students', 'lfit-evaluations', 'lfit-exercises']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(request: NextRequest) {
  try {
    await requireTrainerSession()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    // Aceita 'folder' (legado) ou 'bucket'
    const folderOrBucket = (formData.get('folder') ?? formData.get('bucket')) as string | null

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }

    // Mapeia nomes legados do Cloudinary para buckets do Supabase
    const bucketMap: Record<string, StorageBucket> = {
      students:          'lfit-students',
      evaluations:       'lfit-evaluations',
      exercises:         'lfit-exercises',
      'lfit-students':    'lfit-students',
      'lfit-evaluations': 'lfit-evaluations',
      'lfit-exercises':   'lfit-exercises',
    }

    const bucket = folderOrBucket ? bucketMap[folderOrBucket] : undefined

    if (!bucket || !ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: 'Bucket inválido' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Imagem deve ter no máximo 5 MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadImage(buffer, bucket, file.name, file.type)

    return NextResponse.json({ data: { url } }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    console.error('[upload]', error)
    return NextResponse.json({ error: 'Falha ao fazer upload' }, { status: 500 })
  }
}
