/**
 * Supabase Storage — substitui Cloudinary para upload de imagens.
 * Buckets públicos: lfit-students, lfit-evaluations, lfit-exercises
 * URL pública: https://{ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
 */

const SUPABASE_URL = process.env.SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

export type StorageBucket = 'lfit-students' | 'lfit-evaluations' | 'lfit-exercises'

export async function uploadImage(
  file: Buffer,
  bucket: StorageBucket,
  fileName: string,
  mimeType: string
): Promise<string> {
  const path = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': mimeType,
      'Cache-Control': '3600',
      'x-upsert': 'true',
    },
    body: new Uint8Array(file),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Storage upload falhou: ${err}`)
  }

  // URL pública permanente
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}

export async function deleteImage(url: string): Promise<void> {
  // Extrair bucket e path da URL pública
  const match = url.match(/\/object\/public\/(lfit-[^/]+)\/(.+)$/)
  if (!match) return

  const [, bucket, path] = match

  await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${SERVICE_KEY}` },
  })
}
