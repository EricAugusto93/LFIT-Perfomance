'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function TrainerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('[LFit] Trainer area error:', error?.digest)
  }, [error])

  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <AlertTriangle size={26} className="text-primary" />
      </div>
      <div>
        <h2 className="text-base font-bold text-foreground">Algo deu errado</h2>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Ocorreu um erro ao carregar esta página. Isso pode ser transitório — tente novamente.
        </p>
        {error?.digest && (
          <p className="mt-1 font-mono text-[10px] text-muted-foreground/50">
            digest: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => router.refresh()}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <RefreshCw size={14} />
          Recarregar
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/30 transition-opacity hover:opacity-90"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
