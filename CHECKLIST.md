# LFit — Checklist de Implementação

> Atualizado em: 2026-06-30
> Baseado na leitura real do código-fonte + estado do deploy em produção.

## Progresso Geral

| Etapa | Módulo | Status |
|-------|--------|--------|
| 1 | Setup do Projeto | ✅ Completo |
| 2 | Schema do Banco | ✅ Completo |
| 3 | Autenticação | ✅ Completo |
| 4 | Cadastro de Alunos | ✅ Completo |
| 5 | Biblioteca de Exercícios | ✅ Completo (upload de imagem do exercício pendente) |
| 6 | Gestão de Treinos | ✅ Completo |
| 7 | Avaliação Física | ✅ Completo |
| 8 | Evolução e Gráficos | ✅ Completo |
| 9 | Dashboard | ✅ Completo + redesign premium |
| 10 | Comentários e Acompanhamento | ✅ Completo |
| 11 | Agenda | ✅ Completo |
| 12 | Notificações | ✅ Completo |
| 13 | Área do Aluno | ✅ Completo |
| 14 | Relatórios PDF | ✅ Completo |
| 15 | Sistema de Metas | ✅ Completo |
| 16 | Anamnese | ✅ Completo |
| 17 | Controle Financeiro | ⚪ Opcional — schema pronto, CRUD pendente |
| 18 | IA para Evolução | ⚪ Opcional — não iniciado |
| — | Design & UX | ✅ Dark/Light + vermelho + logo + redesigns |
| — | Deploy & Infra | ✅ Vercel + Supabase + RLS + Índices |
| — | Cloudinary (uploads) | 🟡 Credenciais pendentes |

**16 de 16 etapas do MVP concluídas. Sistema em produção: https://lfit-performance.vercel.app**

---

## Etapa 1 — Setup do Projeto ✅

- [x] Next.js 16.2.9 + React 19 + TypeScript 5 + Tailwind v4
- [x] Shadcn/UI v4 com base-ui
- [x] ESLint + Prettier + `prettier-plugin-tailwindcss`
- [x] Estrutura de pastas: `services/`, `repositories/`, `lib/`, `types/`, `components/`
- [x] `.env.local` + `.env.example` configurados com JWT secrets seguros
- [x] Prisma 7.8 com client gerado em `src/generated/prisma`
- [x] PostgreSQL via Supabase — conectado e migration executada
- [x] `npm run dev:r` — reinicia servidor matando porta 3000 automaticamente
- [x] `postinstall: prisma generate` — Prisma client gerado no build do Vercel

---

## Etapa 2 — Schema do Banco ✅

- [x] Todos os 11 enums criados
- [x] Todas as 17 entidades criadas no Prisma schema
- [x] Migration executada no Supabase (`npx prisma migrate dev --name init`)
- [x] `prisma/seed.ts` — usuário admin + 33 exercícios globais
- [x] Seed executado via Supabase MCP — `admin@lfit.com` / `123456`
- [x] RLS (Row Level Security) habilitado em todas as 18 tabelas via MCP
- [x] 10 índices de FK adicionados via MCP (performance)

---

## Etapa 3 — Autenticação ✅

- [x] `src/lib/auth.ts` — hash, JWT, verify (try-catch retorna null em expirado)
- [x] `POST /api/auth/login` — gera JWT + Refresh Token em cookies httpOnly
- [x] `POST /api/auth/refresh` — renovação silenciosa do access token
- [x] `POST /api/auth/logout` — limpa os dois cookies
- [x] `src/proxy.ts` — proteção de rotas (Next.js 16, renomeado de middleware.ts)
  - [x] Fix: `/alunos` não confundido com `/aluno/` (bug crítico corrigido)
  - [x] Fix: arquivos estáticos (png, jpg, svg…) bypassam o proxy
- [x] `(auth)/login/page.tsx` — Suspense + Logo LFit Performance
- [x] `(trainer)/layout.tsx` + `AppSidebar.tsx` com logo, dark/light toggle, badge notificações
- [x] `src/lib/session.ts` — `requireTrainerSession()` + `requireStudentSession()`
- [x] JWT secrets seguros gerados e configurados no Vercel

---

## Etapa 4 — Cadastro de Alunos ✅

- [x] `student.repository.ts` + `student.service.ts`
- [x] `GET/POST /api/alunos`, `GET/PUT /api/alunos/[id]`, `PATCH /api/alunos/[id]/status`
- [x] `StudentForm.tsx` — CRUD com null guard nos Selects do base-ui (bug corrigido)
- [x] `StudentFilters.tsx` — busca por nome com debounce
- [x] Páginas: listagem, novo, perfil, editar + tabs (Visão Geral, Treinos, Avaliações, Evolução, Comentários, Metas, Anamnese)
- [x] Upload de foto via Cloudinary (`/api/upload`) — requer credenciais

---

## Etapa 5 — Biblioteca de Exercícios ✅

- [x] `exercise.repository.ts` + `exercise.service.ts`
- [x] CRUD completo via `/api/exercicios`
- [x] `ExerciseGrid.tsx` — grid com modal CRUD, filtro por grupo muscular, player YouTube
- [x] 33 exercícios globais no seed
- [ ] **Upload de imagem do exercício via Cloudinary** — campo URL existe, upload direto pendente

---

## Etapa 6 — Gestão de Treinos ✅

- [x] `workout.repository.ts` + `workout.service.ts`
- [x] Rotas CRUD + duplicar treino
- [x] `WorkoutForm.tsx` — seleção de exercícios, séries/reps/carga, reordenação ▲▼
- [x] Histórico de alterações com snapshot JSON
- [x] Páginas: listagem, novo, detalhe, editar

---

## Etapa 7 — Avaliação Física ✅

- [x] `evaluation.repository.ts` + `evaluation.service.ts`
- [x] Rotas CRUD de avaliações
- [x] Cálculo automático de IMC (frontend + backend)
- [x] 11 medidas corporais (BodyMeasurement)
- [x] Upload de 4 fotos de evolução via Cloudinary (requer credenciais)
- [x] Comparação automática entre avaliações — diff colorido
- [x] Páginas: listagem, nova avaliação, detalhe, editar

---

## Etapa 8 — Evolução do Aluno ✅

- [x] `evolution.service.ts` + `GET /api/alunos/[id]/evolucao`
- [x] `WeightChart.tsx`, `BodyCompositionChart.tsx`, `MeasurementsChart.tsx` (Recharts)
- [x] Indicador Evoluindo / Estável / Regressão
- [x] Cards de variação total desde a 1ª avaliação

---

## Etapa 9 — Dashboard ✅

- [x] `dashboard.service.ts` + `GET /api/dashboard` (com `withRetry`)
- [x] Redesign premium: MetricChips + layout 2/3+1/3 + hierarquia visual
- [x] Alertas com borda esquerda colorida (amber = avaliações, vermelho = treinos)
- [x] Agenda da semana agrupada por dia
- [x] 3 estados: onboarding, all-clear, alertas pendentes
- [x] `error.tsx` — error boundary com "Tentar novamente" e digest visível
- [x] Retry com backoff (3 tentativas) para cold start do Prisma

---

## Etapa 10 — Comentários e Acompanhamento ✅

- [x] `comment.repository.ts` + `comment.service.ts`
- [x] `GET/POST /api/alunos/[id]/comentarios`, `DELETE /api/comentarios/[id]`
- [x] `ComentariosClient.tsx` — filtro por tipo, formulário inline, exclusão
- [x] deleteComment retorna 404 quando comentário não existe

---

## Etapa 11 — Agenda ✅

- [x] `schedule.repository.ts` + `schedule.service.ts`
- [x] `GET/POST /api/agenda`, `PUT/DELETE /api/agenda/[id]` (com `withRetry`)
- [x] IDOR corrigido — DELETE/PUT verificam `trainerId`
- [x] Calendário mensal interativo com 4 tipos de evento coloridos
- [x] Seletor de aluno no formulário de evento

---

## Etapa 12 — Notificações ✅

- [x] `notification.repository.ts` + `notification.service.ts`
- [x] `generateNotifications()` — 4 tipos: avaliação vencida, treino vencido, sem update, aniversário (UTC-safe)
- [x] `GET /api/notificacoes` (com `withRetry`), `PATCH /api/notificacoes/[id]/lida`, `PATCH lidas-todas`
- [x] Badge vermelho no sidebar com contagem de não lidas
- [x] Geração automática no login em background
- [x] `NotificacoesClient.tsx` + página central

---

## Etapa 13 — Área do Aluno ✅

- [x] `POST /api/auth/aluno/login` + proxy com role 'student'
- [x] `load.repository.ts` + `weight.repository.ts`
- [x] Todas as rotas `/api/aluno/*`
- [x] Login do aluno com Logo LFit + Suspense
- [x] Treino: tabs por divisão, player YouTube, registro de carga
- [x] Evolução: gráfico de peso, registro inline, cards de composição
- [x] Avaliações: histórico somente leitura

---

## Etapa 14 — Relatórios PDF ✅

- [x] `pdf.ts` + `report.service.ts`
- [x] 4 relatórios: avaliação, treino, histórico do aluno, alunos ativos
- [x] `ReportsClient.tsx` + página central com download

---

## Etapa 15 — Sistema de Metas ✅

- [x] `goal.repository.ts` + `goal.service.ts`
- [x] CRUD + marcar como atingida + DELETE
- [x] Barras de progresso, prazo com countdown, ícone de troféu

---

## Etapa 16 — Anamnese ✅

- [x] `GET/POST/PUT /api/alunos/[id]/anamnese` (upsert)
- [x] Formulário completo com todos os 10 campos do DATABASE.md

---

## Etapa 17 — Controle Financeiro ⚪ (Opcional)

- [ ] `payment.repository.ts` + `payment.service.ts`
- [ ] Rotas CRUD `/api/pagamentos`
- [ ] Listagem de inadimplentes + alertas de vencimento
- **Nota:** Schema `Payment` já existe no banco com RLS ativo

---

## Etapa 18 — IA para Evolução ⚪ (Opcional)

- [ ] Integração com Claude API
- [ ] Análise automática de progresso entre avaliações
- [ ] Insight textual na tela de evolução
- **Nota:** MCP Supabase instalado — facilita contexto para queries de IA

---

## Design & UX ✅

- [x] Dark/Light mode com `ThemeProvider.tsx` + localStorage + FOUC prevenido
- [x] Vermelho como cor primária (oklch) em modo claro e escuro
- [x] Logo LFit Performance (`public/logo.png`) no login trainer, login aluno e sidebar
- [x] Sidebar com neon glow vermelho, logo no topo
- [x] Dashboard redesenhado — hierarquia, MetricChips, borda esquerda colorida
- [x] Dark mode overrides para classes Tailwind hardcoded
- [x] `error.tsx` — boundary com UI graciosa + digest + botões de retry

---

## Deploy & Infraestrutura ✅

- [x] Supabase: banco PostgreSQL na região us-east-1, 17 tabelas
- [x] RLS habilitado em todas as 18 tabelas
- [x] 10 índices de FK adicionados para performance
- [x] JWT secrets seguros (64 chars base64) no Vercel
- [x] Vercel MCP instalado no Claude Code
- [x] Supabase MCP instalado no Claude Code
- [x] Chrome DevTools MCP instalado no Claude Code
- [x] GitHub: https://github.com/EricAugusto93/LFIT-Perfomance.git
- [x] Vercel: https://lfit-performance.vercel.app
- [x] Credenciais: `admin@lfit.com` / `123456`
- [x] `prisma.ts` otimizado para serverless (cache global + pool max=1 + timeouts)
- [x] `with-retry.ts` — helper de retry com backoff para todas as rotas críticas
- [x] Bugs corrigidos em produção:
  - [x] proxy.ts: `/alunos` redirecionava para `/dashboard`
  - [x] proxy.ts: arquivos estáticos (logo.png) redirecionavam para login
  - [x] login: Suspense para `useSearchParams()` (trainer + aluno)
  - [x] `postinstall: prisma generate` para build no Vercel
  - [x] Cold start Prisma: pool otimizado + retry automático

---

## Cloudinary — Uploads 🟡

- [ ] **Criar conta em cloudinary.com** (gratuita)
- [ ] **Configurar variáveis no Vercel** (`Settings → Environment Variables`):
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- **Impacto sem Cloudinary:**
  - Upload de foto de aluno → erro silencioso (aluno criado sem foto)
  - Upload de fotos de avaliação → erro silencioso
  - Upload de imagem de exercício → não implementado de qualquer forma

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| `[x]` | Concluído |
| `[ ]` | Pendente |
| ✅ | Etapa completa |
| 🟡 | Parcial / requer configuração externa |
| ⚪ | Opcional / fora do MVP |
