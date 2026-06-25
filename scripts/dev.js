#!/usr/bin/env node
/**
 * dev:r — mata qualquer processo na porta 3000 e sobe o servidor Next.js.
 * Uso: npm run dev:r
 */
const { execSync, spawn } = require('child_process')

const GREEN  = '\x1b[32m'
const YELLOW = '\x1b[33m'
const DIM    = '\x1b[90m'
const RESET  = '\x1b[0m'
const BOLD   = '\x1b[1m'

function killPort(port) {
  try {
    if (process.platform === 'win32') {
      execSync(
        `powershell -NoProfile -Command ` +
        `"Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue ` +
        `| ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`,
        { stdio: 'ignore' }
      )
    } else {
      execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: 'ignore', shell: true })
    }
    return true
  } catch {
    return false
  }
}

console.log(`\n${BOLD}${YELLOW}⬡  LFit Dev${RESET} — reiniciando servidor...\n`)

const killed = killPort(3000)

if (killed) {
  console.log(`${GREEN}✓${RESET}  Servidor anterior encerrado (porta 3000 liberada)`)
} else {
  console.log(`${DIM}–  Porta 3000 já estava livre${RESET}`)
}

// Pausa para o SO liberar a porta
setTimeout(() => {
  console.log(`${GREEN}▶${RESET}  Iniciando ${BOLD}next dev${RESET}...\n`)

  // shell: true é necessário no Windows para executar .cmd / npm scripts
  const next = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
  })

  next.on('close', (code) => process.exit(code ?? 0))

  process.on('SIGINT',  () => next.kill('SIGINT'))
  process.on('SIGTERM', () => next.kill('SIGTERM'))
}, 400)
