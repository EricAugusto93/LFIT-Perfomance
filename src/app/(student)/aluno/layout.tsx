import Link from 'next/link'
import { Dumbbell, TrendingUp, ClipboardList, LogOut } from 'lucide-react'

const NAV = [
  { href: '/aluno/treino', icon: Dumbbell, label: 'Treino' },
  { href: '/aluno/evolucao', icon: TrendingUp, label: 'Evolução' },
  { href: '/aluno/avaliacoes', icon: ClipboardList, label: 'Avaliações' },
]

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <span className="font-bold text-gray-900">LFit</span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700">
              <LogOut size={14} />
              Sair
            </button>
          </form>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-5 pb-24">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-white">
        <div className="mx-auto flex max-w-lg">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-3 text-gray-500 hover:text-gray-900"
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
