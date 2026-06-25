# LFit — Checklist de Implementação

> Marque cada item com `[x]` conforme for concluído.
> Siga a ordem das etapas — cada uma é pré-requisito da próxima.

## Progresso Geral

| Etapa | Módulo | Status |
|-------|--------|--------|
| 1 | Setup do Projeto | ✅ Completo |
| 2 | Schema do Banco | ✅ Completo |
| 3 | Autenticação | ✅ Completo |
| 4 | Cadastro de Alunos | ✅ Completo |
| 5 | Biblioteca de Exercícios | ✅ Completo |
| 6 | Gestão de Treinos | ✅ Completo |
| 7 | Avaliação Física | ✅ Completo |
| 8 | Evolução e Gráficos | ✅ Completo |
| 9 | Dashboard | ✅ Completo |
| 10 | Comentários e Acompanhamento | ⬜ Pendente |
| 11 | Agenda | 🔶 Parcial (repository criado) |
| 12 | Notificações | ⬜ Pendente |
| 13 | Área do Aluno | ✅ Completo |
| 14 | Relatórios PDF | ✅ Completo |
| 15 | Sistema de Metas | ⬜ Pendente |
| 16 | Anamnese | ⬜ Pendente |
| 17 | Controle Financeiro | ⬜ Opcional |
| 18 | IA para Evolução | ⬜ Opcional |
| — | Infraestrutura & Deploy | 🔶 Parcial |

**10 de 18 etapas concluídas. Supabase conectado. Rodar `npx prisma db seed` para ativar login.**

---

## Etapa 1 — Setup do Projeto

- [x] Criar projeto Next.js 14+ com TypeScript — Next.js 16.2.9 + React 19 + TS 5
- [x] Configurar Tailwind CSS — Tailwind v4 (configuração via CSS, sem tailwind.config.ts)
- [x] Configurar Shadcn/UI — v4.11, detectou Tailwind v4 automaticamente
- [x] Configurar ESLint + Prettier — `.prettierrc` + `prettier-plugin-tailwindcss`
- [x] Configurar estrutura de pastas (`src/app`, `services`, `repositories`, `lib`, `types`)
- [x] Configurar variáveis de ambiente (`.env.local` + `.env.example`)
- [x] Configurar Prisma ORM — Prisma 7.8, client gerado em `src/generated/prisma`
- [x] Conectar ao PostgreSQL — Supabase configurado em `.env.local`
- [x] Migration executada — `npx prisma migrate dev --name init` no Supabase

---

## Etapa 2 — Schema do Banco de Dados

- [x] Entidade `User` (Personal Trainer)
- [x] Entidade `Student`
- [x] Entidade `Anamnesis`
- [x] Entidade `Exercise` (Biblioteca)
- [x] Entidade `Workout`
- [x] Entidade `WorkoutExercise` (exercício dentro do treino)
- [x] Entidade `WorkoutHistory`
- [x] Entidade `PhysicalEvaluation`
- [x] Entidade `BodyMeasurement`
- [x] Entidade `EvolutionPhoto`
- [x] Entidade `Comment`
- [x] Entidade `Goal`
- [x] Entidade `ScheduleEvent`
- [x] Entidade `Notification`
- [x] Entidade `WeightRecord`
- [x] Entidade `LoadRecord`
- [x] Entidade `Payment`
- [x] `prisma generate` executado — client gerado em `src/generated/prisma`
- [x] Rodar primeira migration — `npx prisma migrate dev --name init` executado no Supabase
- [x] Criar seed (`prisma/seed.ts`) — usuário admin + 33 exercícios globais
- [ ] **`npx prisma db seed` — RODAR PARA ATIVAR O LOGIN** (admin@lfit.com / lfit@2024)

---

## Etapa 3 — Autenticação (Personal Trainer)

- [x] Rota `POST /api/auth/login` — gerar JWT + Refresh Token (cookies httpOnly)
- [x] Rota `POST /api/auth/refresh` — renovar access token silenciosamente
- [x] Middleware de autenticação — protege rotas trainer e student, renova token automaticamente
- [x] Página de Login (`/login`) — formulário com react-hook-form + Zod
- [x] Persistência do token (cookie httpOnly `lfit_access` + `lfit_refresh`)
- [x] Logout (`POST /api/auth/logout` limpa os dois cookies)

---

## Etapa 4 — Cadastro de Alunos

- [x] Repository: `student.repository.ts`
- [x] Service: `student.service.ts`
- [x] Rota `GET /api/alunos` — listar com filtros (status + search)
- [x] Rota `POST /api/alunos` — criar aluno
- [x] Rota `GET /api/alunos/[id]` — buscar aluno com última avaliação e treino ativo
- [x] Rota `PUT /api/alunos/[id]` — editar aluno
- [x] Rota `PATCH /api/alunos/[id]/status` — alterar status
- [x] Página: Listagem de alunos (`/alunos`) com tabela e estado vazio
- [x] Página: Formulário de criação (`/alunos/novo`)
- [x] Página: Perfil do aluno (`/alunos/[id]`) com layout e tabs
- [x] Página: Editar aluno (`/alunos/[id]/editar`)
- [x] Formulário: dados pessoais, objetivo, status, saúde (StudentForm reutilizável)
- [x] Upload de foto do aluno (Cloudinary via `/api/upload`)
- [x] Filtro por status (tabs: Todos / Ativos / Pausados / Inativos)
- [x] Busca por nome com debounce de 300ms

---

## Etapa 5 — Biblioteca de Exercícios

- [x] Repository: `exercise.repository.ts`
- [x] Service: `exercise.service.ts`
- [x] Rota `GET /api/exercicios` — listar com filtro por grupo muscular + busca
- [x] Rota `POST /api/exercicios` — criar exercício
- [x] Rota `PUT /api/exercicios/[id]` — editar exercício
- [x] Rota `DELETE /api/exercicios/[id]` — remover exercício (apenas próprios)
- [x] Página: Biblioteca de exercícios (`/biblioteca`) com grid e modal CRUD
- [x] Filtro por grupo muscular (chips)
- [x] Campo de vídeo (URL YouTube)
- [x] Seed com ~33 exercícios globais (todos os grupos musculares)
- [ ] Upload de imagem do exercício via Cloudinary (sprint de infraestrutura)

---

## Etapa 6 — Gestão de Treinos

- [x] Repository: `workout.repository.ts`
- [x] Service: `workout.service.ts`
- [x] Rota `GET /api/alunos/[id]/treinos` — treinos do aluno
- [x] Rota `POST /api/alunos/[id]/treinos` — criar treino
- [x] Rota `GET /api/treinos/[id]` — treino detalhado com exercícios e histórico
- [x] Rota `PUT /api/treinos/[id]` — editar treino (salva snapshot no histórico)
- [x] Rota `DELETE /api/treinos/[id]` — desativar treino
- [x] Rota `POST /api/treinos/[id]/duplicar` — duplicar treino
- [x] Adicionar exercícios ao treino (WorkoutExercise via modal de busca)
- [x] Reordenar exercícios com botões ▲▼
- [x] Salvar histórico de alterações (WorkoutHistory com snapshot JSON)
- [x] Página: Listagem de treinos (`/alunos/[id]/treinos`) — ativos e inativos
- [x] Página: Formulário de treino (`/novo` e `/[workoutId]/editar`)
- [x] Página: Detalhe do treino (`/[workoutId]`) com exercícios, histórico e ações
- [x] Divisão por letra (A–F) com seletor
- [x] Seleção de exercícios da biblioteca via modal com busca e filtro por grupo muscular

---

## Etapa 7 — Avaliação Física

- [x] Repository: `evaluation.repository.ts` — CRUD + findLatestByStudent + upsert de medidas
- [x] Service: `evaluation.service.ts` — IMC, comparação entre avaliações, lógica de diff
- [x] Rota `GET /api/alunos/[id]/avaliacoes` — histórico de avaliações
- [x] Rota `POST /api/alunos/[id]/avaliacoes` — nova avaliação
- [x] Rota `GET /api/avaliacoes/[id]` — avaliação + anterior + comparação completa
- [x] Rota `PUT /api/avaliacoes/[id]` — editar avaliação (recalcula IMC)
- [x] Cálculo automático de IMC em tempo real (frontend) e persistido (backend)
- [x] Registro de medidas corporais — 11 campos via BodyMeasurement
- [x] Upload de fotos de evolução — 4 ângulos via Cloudinary (requer credenciais)
- [x] Comparação entre avaliações — diff colorido (verde/vermelho) em peso, gordura, massa e medidas
- [x] Página: Listagem de avaliações — timeline com diff de peso entre avaliações
- [x] Página: Formulário de nova avaliação — 3 seções (dados, medidas, fotos)
- [x] Página: Detalhe com comparação lado a lado — cards de diff + fotos comparativas
- [x] Página: Editar avaliação — form pré-preenchido

---

## Etapa 8 — Evolução do Aluno

- [x] Página: Evolução (`/alunos/[id]/evolucao`)
- [x] Gráfico: Peso + IMC ao longo do tempo (WeightChart — Recharts)
- [x] Gráfico: % Gordura + Massa Muscular (BodyCompositionChart — dois eixos Y)
- [x] Gráfico: Medidas corporais com seletor de qual exibir (MeasurementsChart)
- [x] Indicador de status (Evoluindo / Estável / Regressão) com lógica de threshold
- [x] Cards de resumo: variação total desde a 1ª avaliação (peso, gordura, massa)
- [x] Service: `evolution.service.ts` — agrega dados e calcula indicador
- [x] Rota `GET /api/alunos/[id]/evolucao` — dados formatados para os gráficos
- [x] Estado vazio com CTA para registrar primeira avaliação
- [ ] Comparação lado a lado de fotos na evolução (disponível no detalhe da avaliação)

---

## Etapa 9 — Dashboard

- [x] Rota `GET /api/dashboard` — dados agregados
- [x] Card: Total de alunos
- [x] Card: Alunos ativos / pausados / inativos
- [x] Card: Treinos vencidos (lista clicável)
- [x] Lista: Alunos com avaliação vencida (> 30 dias)
- [x] Lista: Agenda da semana (próximos 7 dias)
- [x] Estado vazio: banner boas-vindas sem alunos
- [x] Estado positivo: banner "tudo em dia"
- [ ] Gráfico: Evolução geral dos alunos (Sprint futura)

---

## Etapa 10 — Comentários e Acompanhamento

- [ ] Repository: `comment.repository.ts`
- [ ] Service: `comment.service.ts`
- [ ] Rota `GET /api/alunos/[id]/comentarios`
- [ ] Rota `POST /api/alunos/[id]/comentarios`
- [ ] Rota `DELETE /api/comentarios/[id]`
- [ ] Página: Comentários do aluno (`/alunos/[id]/comentarios`)
- [ ] Filtro por tipo (observação, feedback, lesão, adaptação, desconforto)
- [ ] Organização por data

---

## Etapa 11 — Agenda

- [x] Repository: `schedule.repository.ts` — criado na Sprint 3 (dashboard)
- [ ] Service: `schedule.service.ts`
- [ ] Rota `GET /api/agenda`
- [ ] Rota `POST /api/agenda`
- [ ] Rota `PUT /api/agenda/[id]`
- [ ] Rota `DELETE /api/agenda/[id]`
- [ ] Página: Agenda em calendário mensal (`/agenda`)
- [ ] Tipos de evento: avaliação, renovação de treino, consulta, disponibilidade

---

## Etapa 12 — Notificações

- [ ] Repository: `notification.repository.ts`
- [ ] Service: `notification.service.ts`
- [ ] Rota `GET /api/notificacoes`
- [ ] Rota `PATCH /api/notificacoes/[id]/lida`
- [ ] Geração automática: avaliação vencida (> 30 dias sem avaliação)
- [ ] Geração automática: treino expirado
- [ ] Geração automática: aluno sem atualização (configurável)
- [ ] Geração automática: aniversário do aluno
- [ ] Sino de notificações no header com badge de não lidas
- [ ] Página: Central de notificações (`/notificacoes`)

---

## Etapa 13 — Área do Aluno

- [x] Auth separada para aluno — JWT com `role: 'student'` e `sub: studentId`
- [x] Rota `POST /api/auth/aluno/login` — autentica via `Student.email + passwordHash`
- [x] Middleware já protege `/aluno/**` e valida `role: 'student'`
- [x] `requireStudentSession()` em `session.ts`
- [x] Página: Login do aluno (`/aluno/login`) — dark theme mobile-first
- [x] Layout com bottom navigation (Treino / Evolução / Avaliações)
- [x] Página: Treino atual (`/aluno/treino`)
  - [x] Tabs por divisão (A, B, C...)
  - [x] Cards de exercício com séries, reps, descanso, carga sugerida
  - [x] Player YouTube inline (toggle mostrar/fechar)
  - [x] Registro de carga com feedback visual (botão OK → ✓ verde)
  - [x] Exibe última carga registrada por exercício
- [x] Página: Evolução (`/aluno/evolucao`)
  - [x] Peso atual em destaque
  - [x] Registrar peso corporal (WeightRecord) inline
  - [x] Gráfico de peso (combina PhysicalEvaluation + WeightRecord)
  - [x] Cards de % gordura e massa muscular da última avaliação
- [x] Página: Avaliações (`/aluno/avaliacoes`) — histórico completo somente leitura
- [x] Repositórios: `load.repository.ts`, `weight.repository.ts`
- [x] Rotas: `/api/aluno/treino`, `/api/aluno/cargas`, `/api/aluno/peso`, `/api/aluno/evolucao`, `/api/aluno/avaliacoes`

---

## Etapa 14 — Relatórios PDF

- [x] Configurar PDFKit + helpers base (`src/lib/pdf.ts`) — header, footer, grid de campos, separadores
- [x] Rota `GET /api/relatorios/avaliacao/[id]` — PDF com dados básicos + medidas corporais
- [x] Rota `GET /api/relatorios/treino/[id]` — PDF com todos os exercícios e parâmetros
- [x] Rota `GET /api/relatorios/aluno/[id]` — PDF com dados pessoais + última avaliação + treinos
- [x] Rota `GET /api/relatorios/alunos-ativos` — tabela paginada de todos os alunos ativos
- [x] `report.service.ts` — 4 funções geradoras com dados do Prisma + PDFKit
- [x] Página: Central de relatórios (`/relatorios`) — select de aluno + 4 botões de download

---

## Etapa 15 — Sistema de Metas

- [ ] Repository: `goal.repository.ts`
- [ ] Service: `goal.service.ts`
- [ ] Rota `GET /api/alunos/[id]/metas`
- [ ] Rota `POST /api/alunos/[id]/metas`
- [ ] Rota `PUT /api/metas/[id]`
- [ ] Barra de progresso automática (currentValue / targetValue)
- [ ] Marcar meta como atingida
- [ ] Exibir metas no perfil do aluno

---

## Etapa 16 — Anamnese

- [ ] Rota `GET /api/alunos/[id]/anamnese`
- [ ] Rota `POST /api/alunos/[id]/anamnese`
- [ ] Rota `PUT /api/alunos/[id]/anamnese`
- [ ] Formulário de anamnese completo
- [ ] Exibir anamnese no perfil do aluno

---

## Etapa 17 — Controle Financeiro (Opcional)

- [ ] Repository: `payment.repository.ts`
- [ ] Service: `payment.service.ts`
- [ ] Rota `GET /api/pagamentos`
- [ ] Rota `POST /api/pagamentos`
- [ ] Rota `PATCH /api/pagamentos/[id]` — marcar como pago
- [ ] Listagem de inadimplentes
- [ ] Alerta de vencimento próximo
- [ ] Relatório financeiro mensal

---

## Etapa 18 — IA para Evolução (Diferencial)

- [ ] Integração com API de IA (Claude / OpenAI)
- [ ] Análise automática de progresso entre avaliações
- [ ] Geração de resumo textual da evolução do aluno
- [ ] Exibir insight na tela de evolução

---

## Infraestrutura & Deploy

- [x] Supabase configurado como banco de dados em produção
- [x] Migration executada — todas as 17 tabelas criadas
- [ ] `npx prisma db seed` — criar usuário admin + 33 exercícios
- [ ] Cloudinary — configurar CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET
- [ ] JWT secrets — trocar para valores seguros (32+ chars)
- [ ] Deploy na Vercel — variáveis de ambiente configuradas no painel
- [ ] Testes de smoke em produção

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| `[ ]`   | Não iniciado |
| `[~]`   | Em andamento |
| `[x]`   | Concluído |
| `[!]`   | Bloqueado / problema |
