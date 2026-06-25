import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const CONFIG = {
  ACTIVE: { label: 'Ativo', className: 'bg-green-100 text-green-700 border-green-200' },
  PAUSED: { label: 'Pausado', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  INACTIVE: { label: 'Inativo', className: 'bg-gray-100 text-gray-500 border-gray-200' },
}

interface StatusBadgeProps {
  status: keyof typeof CONFIG
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = CONFIG[status] ?? CONFIG.INACTIVE
  return (
    <Badge variant="outline" className={cn('font-medium', className)}>
      {label}
    </Badge>
  )
}
