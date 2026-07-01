import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // PDFKit usa fs.readFileSync para carregar dados de fontes (.afm).
  // Sem isso, o Next.js tenta fazer bundle do pdfkit e os arquivos .afm
  // não são incluídos → crash em produção no Vercel.
  serverExternalPackages: ['pdfkit'],
}

export default nextConfig
