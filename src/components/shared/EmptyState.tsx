import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  message: string
}

export function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
      <Icon size={28} className="mb-2" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
