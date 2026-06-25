import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, backHref, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="mb-1 flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-gray-600"
          >
            <ChevronLeft size={16} />
            Voltar
          </Link>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  )
}
