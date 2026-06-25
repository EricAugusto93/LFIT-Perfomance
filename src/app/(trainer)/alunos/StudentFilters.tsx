'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useDebouncedCallback } from 'use-debounce'

const STATUS_TABS = [
  { value: '', label: 'Todos' },
  { value: 'ACTIVE', label: 'Ativos' },
  { value: 'PAUSED', label: 'Pausados' },
  { value: 'INACTIVE', label: 'Inativos' },
]

interface StudentFiltersProps {
  currentStatus?: string
  currentSearch?: string
}

export function StudentFilters({ currentStatus = '', currentSearch = '' }: StudentFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams()
      if (currentStatus && !('status' in updates)) params.set('status', currentStatus)
      if (currentSearch && !('search' in updates)) params.set('search', currentSearch)
      Object.entries(updates).forEach(([k, v]) => { if (v) params.set(k, v) })
      startTransition(() => router.push(`${pathname}?${params.toString()}`))
    },
    [currentStatus, currentSearch, pathname, router]
  )

  const handleSearch = useDebouncedCallback((value: string) => {
    updateParams({ search: value, status: currentStatus })
  }, 300)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar aluno..."
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status tabs */}
      <div className="flex shrink-0 rounded-md border bg-gray-50 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => updateParams({ status: tab.value, search: currentSearch })}
            className={cn(
              'rounded px-3 py-1.5 text-sm font-medium transition-colors',
              currentStatus === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
