'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface StudentTabsProps {
  studentId: string
}

export function StudentTabs({ studentId }: StudentTabsProps) {
  const pathname = usePathname()
  const base = `/alunos/${studentId}`

  const tabs = [
    { href: base, label: 'Visão Geral' },
    { href: `${base}/treinos`, label: 'Treinos' },
    { href: `${base}/avaliacoes`, label: 'Avaliações' },
    { href: `${base}/evolucao`, label: 'Evolução' },
    { href: `${base}/comentarios`, label: 'Comentários' },
    { href: `${base}/metas`, label: 'Metas' },
    { href: `${base}/anamnese`, label: 'Anamnese' },
  ]

  return (
    <div className="flex gap-1 border-b">
      {tabs.map(({ href, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
