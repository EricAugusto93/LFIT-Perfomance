import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  color?: 'default' | 'green' | 'yellow' | 'red'
}

const colorMap = {
  default: 'text-gray-600 bg-gray-100',
  green: 'text-green-600 bg-green-100',
  yellow: 'text-yellow-600 bg-yellow-100',
  red: 'text-red-600 bg-red-100',
}

export function StatCard({ title, value, icon: Icon, color = 'default' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={cn('rounded-lg p-3', colorMap[color])}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
