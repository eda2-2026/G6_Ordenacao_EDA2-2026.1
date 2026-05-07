# KONTA — Development SPEC
> Documento de especificação técnica para uso com **Claude Code (terminal)**.
> Stack: Next.js 14 · TypeScript · Prisma · PostgreSQL · Docker · NextAuth · Gemini Vision

---

## Instruções para o Claude Code

Ao usar este documento no Claude Code, informe sempre o contexto da fase em que está:

```
"Estou na Fase 2 — Core Financeiro. Implemente o CRUD de lançamentos conforme a SPEC."
```

Regras gerais que o Claude Code deve seguir neste projeto:
- Sempre usar **TypeScript strict mode** — sem `any`
- Validação de inputs com **Zod** em todas as API routes
- Toda rota de API deve verificar a sessão com `getServerSession(authOptions)`
- Componentes de servidor (RSC) por padrão — `"use client"` apenas quando necessário
- Erros tratados com `try/catch` e retorno padronizado `{ error: string }`
- Nomes de arquivos: `camelCase` para utils/hooks, `PascalCase` para componentes
- Commits semânticos: `feat:`, `fix:`, `chore:`, `refactor:`
- Evite criar arquivos .md para descrever o que foi feito. Use os comentários do código para descrever o que foi feito.
- Nao mexer em codigo que já foi escrito só se necessario
---

## Visão Geral do Produto

**KONTA** é um sistema de controle financeiro multi-tenant para grupos e empresas.
Permite registrar entradas e saídas, reconhecer comprovantes via IA (Gemini Vision),
visualizar o fluxo financeiro em tempo real e exportar relatórios em PDF e Excel.

| Item | Decisão |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript (strict) |
| ORM | Prisma |
| Banco | PostgreSQL 16 |
| Auth | NextAuth v5 (Auth.js) |
| IA | Google Gemini Vision |
| Estilo | Tailwind CSS + shadcn/ui |
| Containers | Docker + Docker Compose |
| Gráficos | Recharts |
| PDF | @react-pdf/renderer |
| Excel | xlsx (SheetJS) |
| Validação | Zod |
| Estado global | Zustand |

---

## Arquitetura de Pastas

```
KONTA/
├── .env
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   └── icons/
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── cadastro/page.tsx
    │   ├── (dashboard)/
    │   │   ├── layout.tsx
    │   │   ├── dashboard/page.tsx
    │   │   ├── lancamentos/
    │   │   │   ├── page.tsx
    │   │   │   ├── novo/page.tsx
    │   │   │   └── [id]/page.tsx
    │   │   ├── comprovante/page.tsx
    │   │   ├── categorias/page.tsx
    │   │   ├── relatorios/page.tsx
    │   │   └── grupo/
    │   │       ├── page.tsx
    │   │       └── membros/page.tsx
    │   └── api/
    │       ├── auth/[...nextauth]/route.ts
    │       ├── lancamentos/
    │       │   ├── route.ts
    │       │   └── [id]/route.ts
    │       ├── categorias/
    │       │   ├── route.ts
    │       │   └── [id]/route.ts
    │       ├── grupos/
    │       │   ├── route.ts
    │       │   └── [id]/
    │       │       ├── route.ts
    │       │       └── membros/route.ts
    │       ├── ia/extrair/route.ts
    │       └── relatorios/
    │           ├── pdf/route.ts
    │           └── excel/route.ts
    ├── components/
    │   ├── ui/                  # shadcn/ui components
    │   ├── dashboard/
    │   ├── lancamentos/
    │   ├── comprovante/
    │   ├── categorias/
    │   └── layout/
    ├── lib/
    │   ├── prisma.ts
    │   ├── auth.ts
    │   ├── gemini.ts
    │   ├── validations/
    │   └── utils/
    ├── hooks/
    ├── store/
    ├── types/
    └── middleware.ts
```

---

## Schema Prisma (Completo)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  FINANCEIRO
  VISUALIZADOR
}

enum TransactionType {
  ENTRADA
  SAIDA
}

enum RecurrenceFrequency {
  DIARIA
  SEMANAL
  MENSAL
}

model User {
  id            String        @id @default(cuid())
  name          String
  email         String        @unique
  password      String?
  image         String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  groups        GroupMember[]
  transactions  Transaction[]
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Group {
  id           String        @id @default(cuid())
  name         String
  description  String?
  inviteCode   String        @unique @default(cuid())
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  members      GroupMember[]
  categories   Category[]
  transactions Transaction[]
}

model GroupMember {
  id        String   @id @default(cuid())
  role      Role     @default(VISUALIZADOR)
  joinedAt  DateTime @default(now())
  userId    String
  groupId   String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  group     Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@unique([userId, groupId])
}

model Category {
  id           String        @id @default(cuid())
  name         String
  icon         String        @default("💰")
  color        String        @default("#1A7F5A")
  isDefault    Boolean       @default(false)
  isActive     Boolean       @default(true)
  createdAt    DateTime      @default(now())
  groupId      String?
  group        Group?        @relation(fields: [groupId], references: [id], onDelete: Cascade)
  transactions Transaction[]
}

model Transaction {
  id                  String               @id @default(cuid())
  type                TransactionType
  value               Decimal              @db.Decimal(12, 2)
  date                DateTime
  description         String
  notes               String?
  isRecurring         Boolean              @default(false)
  recurrenceFrequency RecurrenceFrequency?
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
  userId              String
  groupId             String
  categoryId          String
  user                User                 @relation(fields: [userId], references: [id])
  group               Group                @relation(fields: [groupId], references: [id], onDelete: Cascade)
  category            Category             @relation(fields: [categoryId], references: [id])

  @@index([groupId, date])
  @@index([groupId, type])
  @@index([categoryId])
}

model AuditLog {
  id        String   @id @default(cuid())
  action    String
  entity    String
  entityId  String
  userId    String
  createdAt DateTime @default(now())

  @@index([entity, entityId])
}
```

---

## Variáveis de Ambiente

```bash
# .env.example

# Banco de dados
DATABASE_URL="postgresql://KONTA:KONTA_secret@localhost:5432/KONTA_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere_com_openssl_rand_base64_32"

# Google OAuth (opcional no MVP)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Google Gemini Vision
GEMINI_API_KEY=""

# SMTP (pós-MVP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
```

---

## Docker Compose

```yaml
# docker-compose.yml
version: '3.9'

services:
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: KONTA
      POSTGRES_PASSWORD: KONTA_secret
      POSTGRES_DB: KONTA_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - db

volumes:
  postgres_data:
```

---

## Padrão de API Routes

Todas as rotas seguem este padrão:

```ts
// src/app/api/exemplo/route.ts
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    // lógica aqui

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
```

---

## Padrão de Resposta da API

```ts
// Sucesso
{ data: T }

// Erro
{ error: string }

// Listagem paginada
{
  data: T[],
  pagination: {
    page: number,
    perPage: number,
    total: number,
    totalPages: number
  }
}
```

---

## Fase 1 — Setup e Base do Projeto

### Objetivo
Configurar toda a infraestrutura base do projeto: Next.js, Docker, Prisma, NextAuth e estrutura de pastas.

### Contexto para o Claude Code
> "Configure o projeto KONTA do zero. É um sistema Next.js 14 com App Router, TypeScript strict, Prisma + PostgreSQL rodando em Docker e autenticação via NextAuth v5."

### Checklist

#### Infraestrutura
- [ ] Inicializar projeto Next.js 14 com TypeScript: `npx create-next-app@latest KONTA --typescript --tailwind --app`
- [ ] Configurar `tsconfig.json` com `strict: true` e path alias `@/*`
- [ ] Criar `docker-compose.yml` com serviço PostgreSQL 16
- [ ] Criar `.env` e `.env.example` com todas as variáveis necessárias
- [ ] Instalar dependências: `prisma @prisma/client next-auth@beta zod zustand`
- [ ] Instalar dependências de UI: `shadcn/ui recharts`
- [ ] Instalar dependências de exportação: `@react-pdf/renderer xlsx`
- [ ] Instalar Gemini SDK: `@google/generative-ai`

#### Banco de Dados
- [ ] Inicializar Prisma: `npx prisma init`
- [ ] Implementar `prisma/schema.prisma` completo conforme spec
- [ ] Criar singleton do Prisma Client em `src/lib/prisma.ts`
- [ ] Rodar primeira migration: `npx prisma migrate dev --name init`
- [ ] Criar seed com categorias padrão em `prisma/seed.ts`

#### Autenticação
- [ ] Configurar `src/lib/auth.ts` com NextAuth (Credentials + Google OAuth)
- [ ] Criar API route `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Implementar `src/middleware.ts` protegendo rotas `/dashboard/**` e `/api/**` (exceto `/api/auth`)
- [ ] Estender tipos do NextAuth para incluir `id`, `groupId` e `role` na sessão

#### Estrutura Base
- [ ] Criar estrutura de pastas conforme arquitetura definida na spec
- [ ] Configurar layout raiz `src/app/layout.tsx` com providers (SessionProvider, Zustand)
- [ ] Criar `src/app/page.tsx` com redirect para `/dashboard` se autenticado ou `/login` se não

---

## Fase 2 — Autenticação e Usuários

### Objetivo
Telas de cadastro, login e gerenciamento de sessão.

### Contexto para o Claude Code
> "Implemente as telas de autenticação do KONTA: cadastro e login com e-mail/senha via NextAuth. Use shadcn/ui para os componentes de formulário."

### Checklist

#### API
- [ ] `POST /api/auth/cadastro` — criar usuário com hash bcrypt da senha (salt 12)
- [ ] Validar dados com Zod: nome (min 2), email (válido), senha (min 8)
- [ ] Retornar erro 409 se e-mail já cadastrado

#### Páginas
- [ ] `(auth)/cadastro/page.tsx` — formulário: nome, email, senha, confirmar senha
- [ ] `(auth)/login/page.tsx` — formulário: email, senha + link "esqueci a senha"
- [ ] Feedback visual: loading no botão, toast de erro/sucesso
- [ ] Redirect para `/dashboard` após login bem-sucedido
- [ ] Página 404 customizada

#### Componentes
- [ ] `components/layout/AuthLayout.tsx` — layout centralizado para telas de auth
- [ ] Formulários com React Hook Form + Zod resolver

---

## Fase 3 — Grupos

### Objetivo
Criação de grupos, sistema de convite e isolamento de dados multi-tenant.

### Contexto para o Claude Code
> "Implemente o sistema de grupos do KONTA. Cada usuário pode criar um grupo ou entrar em um via código de convite. Todos os dados (lançamentos, categorias) são isolados por grupo."

### Checklist

#### API
- [ ] `POST /api/grupos` — criar grupo (usuário vira ADMIN automaticamente)
- [ ] `GET /api/grupos` — listar grupos do usuário autenticado
- [ ] `POST /api/grupos/entrar` — entrar em grupo pelo `inviteCode`
- [ ] `GET /api/grupos/[id]` — detalhes do grupo (apenas membros)
- [ ] `PUT /api/grupos/[id]` — editar nome/descrição (apenas ADMIN)
- [ ] `GET /api/grupos/[id]/membros` — listar membros com roles
- [ ] `PUT /api/grupos/[id]/membros` — alterar role de membro (apenas ADMIN)
- [ ] `DELETE /api/grupos/[id]/membros` — remover membro (apenas ADMIN)

#### Páginas
- [ ] `(dashboard)/grupo/page.tsx` — painel do grupo: info, código de convite com botão copiar
- [ ] `(dashboard)/grupo/membros/page.tsx` — lista de membros com roles e ações de admin
- [ ] Tela de onboarding: criar grupo ou entrar com código (exibida quando usuário não tem grupo)

#### Lógica
- [ ] Armazenar `groupId` ativo na sessão/store do Zustand
- [ ] Middleware de grupo: verificar se usuário pertence ao grupo em toda API route
- [ ] Helper `requireRole(session, groupId, roles[])` para verificar permissão

---

## Fase 4 — Categorias

### Objetivo
Categorias padrão do sistema + categorias personalizadas por grupo.

### Contexto para o Claude Code
> "Implemente o módulo de categorias do KONTA. Deve ter categorias padrão globais e permitir que o Admin do grupo crie categorias personalizadas com nome, emoji e cor hex."

### Checklist

#### Seed
- [ ] Criar seed com categorias padrão (sem `groupId`): Alimentação 🍽️, Transporte 🚗, Salário 💼, Fornecedores 📦, Impostos 🏛️, Outros 💰

#### API
- [ ] `GET /api/categorias` — retornar categorias padrão + categorias do grupo ativo
- [ ] `POST /api/categorias` — criar categoria personalizada (apenas ADMIN)
- [ ] `PUT /api/categorias/[id]` — editar categoria do grupo (apenas ADMIN)
- [ ] `DELETE /api/categorias/[id]` — desativar categoria (`isActive: false`) (apenas ADMIN)

#### Páginas
- [ ] `(dashboard)/categorias/page.tsx` — lista de categorias com badge de cor e emoji
- [ ] Modal de criação/edição: nome, emoji picker (input), color picker (hex)
- [ ] Categorias desativadas exibidas com opacidade, sem aparecer em selects

#### Componentes
- [ ] `components/categorias/FormCategoria.tsx`
- [ ] `components/categorias/CategoriaTag.tsx` — badge com cor e emoji

---

## Fase 5 — Lançamentos Financeiros

### Objetivo
CRUD completo de lançamentos com filtros, paginação e cálculo de saldo.

### Contexto para o Claude Code
> "Implemente o módulo de lançamentos do KONTA. Lançamentos têm tipo (ENTRADA/SAIDA), valor, data, descrição, categoria e podem ser recorrentes. Todos os dados são filtrados pelo groupId da sessão."

### Checklist

#### Validação (Zod)
```ts
// src/lib/validations/lancamento.ts
const lancamentoSchema = z.object({
  type: z.enum(["ENTRADA", "SAIDA"]),
  value: z.number().positive(),
  date: z.string().datetime(),
  description: z.string().min(3).max(255),
  notes: z.string().max(500).optional(),
  categoryId: z.string().cuid(),
  isRecurring: z.boolean().default(false),
  recurrenceFrequency: z.enum(["DIARIA", "SEMANAL", "MENSAL"]).optional(),
})
```

#### API
- [ ] `GET /api/lancamentos` — listagem paginada com filtros: `?page&perPage&type&categoryId&startDate&endDate&userId`
- [ ] `POST /api/lancamentos` — criar lançamento (validar com Zod)
- [ ] `GET /api/lancamentos/[id]` — buscar lançamento por ID (verificar groupId)
- [ ] `PUT /api/lancamentos/[id]` — editar (próprio ou ADMIN/FINANCEIRO)
- [ ] `DELETE /api/lancamentos/[id]` — excluir (próprio ou ADMIN/FINANCEIRO)
- [ ] `GET /api/lancamentos/saldo` — retornar `{ totalEntradas, totalSaidas, saldo }` do período

#### Páginas
- [ ] `(dashboard)/lancamentos/page.tsx` — lista com filtros, paginação e indicador de tipo
- [ ] `(dashboard)/lancamentos/novo/page.tsx` — formulário de criação
- [ ] `(dashboard)/lancamentos/[id]/page.tsx` — formulário de edição

#### Componentes
- [ ] `components/lancamentos/FormLancamento.tsx` — formulário completo com toggle ENTRADA/SAIDA
- [ ] `components/lancamentos/ListaLancamentos.tsx` — tabela com paginação
- [ ] `components/lancamentos/CardLancamento.tsx` — item da lista com valor colorido (verde/vermelho)
- [ ] `components/lancamentos/FiltrosLancamento.tsx` — barra de filtros

---

## Fase 6 — Dashboard

### Objetivo
Painel principal com saldo em tempo real, gráficos e últimos lançamentos.

### Contexto para o Claude Code
> "Implemente o dashboard do KONTA. Deve exibir saldo atual, total de entradas e saídas, gráfico de linha do fluxo de caixa e gráfico de pizza por categoria. Dados filtrados pelo groupId. Use Recharts para os gráficos."

### Checklist

#### API
- [ ] `GET /api/dashboard/resumo` — retornar `{ saldo, totalEntradas, totalSaidas, variacaoPercentual }` com query `?startDate&endDate`
- [ ] `GET /api/dashboard/fluxo` — retornar array `[{ date, entradas, saidas }]` agrupado por dia/semana/mês
- [ ] `GET /api/dashboard/categorias` — retornar array `[{ categoryId, name, color, icon, total }]`
- [ ] `GET /api/dashboard/recentes` — últimos 5 lançamentos do grupo

#### Páginas
- [ ] `(dashboard)/dashboard/page.tsx` — layout com grid de cards + gráficos

#### Componentes
- [ ] `components/dashboard/SaldoCard.tsx` — card com saldo, variação percentual e ícone de tendência
- [ ] `components/dashboard/ResumoCards.tsx` — cards de total entrada e saída
- [ ] `components/dashboard/GraficoFluxo.tsx` — LineChart com Recharts (entrada vs saída por período)
- [ ] `components/dashboard/GraficoCategorias.tsx` — PieChart com Recharts por categoria
- [ ] `components/dashboard/UltimosLancamentos.tsx` — lista dos 5 últimos
- [ ] `components/dashboard/FiltrosPeriodo.tsx` — seletor: hoje / semana / mês / personalizado

---

## Fase 7 — Reconhecimento por IA (Gemini Vision)

### Objetivo
Upload de comprovante → extração automática de dados → formulário pré-preenchido.

### Contexto para o Claude Code
> "Implemente a feature de reconhecimento de comprovantes por IA no KONTA. O usuário faz upload de uma imagem, ela é enviada para o Google Gemini Vision, que retorna os dados estruturados. A imagem não deve ser armazenada (LGPD)."

### Checklist

#### Integração Gemini
```ts
// src/lib/gemini.ts
// Prompt estruturado que o Gemini deve receber com a imagem:
const EXTRACTION_PROMPT = `
Analise este comprovante/nota fiscal e retorne um JSON com exatamente este formato:
{
  "type": "ENTRADA" | "SAIDA",
  "value": number,
  "date": "YYYY-MM-DD",
  "description": "string",
  "establishment": "string",
  "suggestedCategory": "Alimentação" | "Transporte" | "Salário" | "Fornecedores" | "Impostos" | "Outros"
}
Retorne apenas o JSON, sem explicações.
`
```

#### API
- [ ] `POST /api/ia/extrair` — receber imagem (multipart/form-data), converter para base64, enviar ao Gemini
- [ ] Validar tipo de arquivo: JPG, PNG, WEBP, PDF (página única)
- [ ] Validar tamanho máximo: 10MB
- [ ] Retornar dados extraídos ou `{ error: "Não foi possível extrair os dados" }` em caso de falha
- [ ] **Não armazenar a imagem** — processar em memória e descartar (LGPD)
- [ ] Timeout de 15 segundos para chamada ao Gemini

#### Páginas
- [ ] `(dashboard)/comprovante/page.tsx` — área de upload com drag-and-drop ou câmera

#### Componentes
- [ ] `components/comprovante/UploadComprovante.tsx` — drag-and-drop com preview da imagem
- [ ] `components/comprovante/FormConfirmacao.tsx` — formulário pré-preenchido pela IA para revisão
- [ ] Loading state com mensagem: "Analisando comprovante..." durante chamada à IA

#### Fluxo completo
1. Usuário faz upload da imagem
2. Preview exibido na tela
3. Botão "Analisar com IA" → spinner
4. API retorna dados → formulário pré-preenchido
5. Usuário revisa e edita se necessário
6. Confirma → lançamento criado → redirect para `/lancamentos`

---

## Fase 8 — Relatórios e Exportações

### Objetivo
Geração de resumo mensal, gráficos de tendência, exportação PDF e Excel.

### Contexto para o Claude Code
> "Implemente o módulo de relatórios do KONTA. Deve gerar resumo mensal, permitir exportar em PDF formatado e Excel. Use @react-pdf/renderer para PDF e SheetJS para Excel."

### Checklist

#### API
- [ ] `GET /api/relatorios/resumo` — retornar dados consolidados por período: `?startDate&endDate&categoryId&userId`
- [ ] `GET /api/relatorios/pdf` — gerar e retornar PDF binário (header `Content-Type: application/pdf`)
- [ ] `GET /api/relatorios/excel` — gerar e retornar XLSX (header `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)

#### PDF (estrutura)
```
Cabeçalho: Logo KONTA + Nome do Grupo + Período
Resumo: Saldo | Total Entradas | Total Saídas
Tabela: Data | Descrição | Categoria | Tipo | Valor
Rodapé: Data de geração + página
```

#### Excel (estrutura)
```
Aba 1 - Resumo: cards com totais
Aba 2 - Lançamentos: tabela completa com todos os campos
Aba 3 - Por Categoria: agrupamento com subtotais
```

#### Páginas
- [ ] `(dashboard)/relatorios/page.tsx` — filtros de período, categoria, membro + botões exportar

#### Componentes
- [ ] `components/relatorios/FiltrosRelatorio.tsx`
- [ ] `components/relatorios/TabelaResumo.tsx` — prévia dos dados antes de exportar
- [ ] `lib/utils/pdf.ts` — função `gerarPDF(dados): Buffer`
- [ ] `lib/utils/excel.ts` — função `gerarExcel(dados): Buffer`

---

## Fase 9 — Lançamentos Recorrentes (Pós-MVP)

### Objetivo
Suporte a lançamentos que se repetem automaticamente.

### Contexto para o Claude Code
> "Implemente lançamentos recorrentes no KONTA. Um lançamento recorrente deve gerar automaticamente cópias nas datas futuras conforme a frequência definida."

### Checklist

- [ ] Adicionar campo `recurrenceFrequency` no formulário de lançamento
- [ ] `POST /api/lancamentos/recorrentes/processar` — endpoint chamado por cron job para gerar lançamentos do dia
- [ ] Criar script de cron job (ou GitHub Action) para chamar o endpoint diariamente
- [ ] Lançamentos gerados automaticamente devem ter flag `isRecurring: true` e referência ao lançamento pai
- [ ] UI para listar e cancelar recorrências ativas

---

## Fase 10 — Login Social Google OAuth (Pós-MVP)

### Objetivo
Adicionar login com Google via NextAuth.

### Contexto para o Claude Code
> "Adicione o provider Google OAuth ao NextAuth do KONTA. Usuários que entram via Google não têm senha."

### Checklist

- [ ] Criar projeto no Google Cloud Console e obter `CLIENT_ID` e `CLIENT_SECRET`
- [ ] Adicionar `GoogleProvider` ao `authOptions` em `src/lib/auth.ts`
- [ ] Adicionar botão "Entrar com Google" na tela de login
- [ ] Tratar callback: se usuário não existe, criar automaticamente (sem senha)
- [ ] Garantir que usuário OAuth possa pertencer a grupos normalmente

---

## Fase 11 — Envio de Relatório por E-mail (Pós-MVP)

### Objetivo
Enviar relatório em PDF diretamente por e-mail pela plataforma.

### Contexto para o Claude Code
> "Adicione a funcionalidade de envio de relatório por e-mail no KONTA. Use Nodemailer com SMTP configurado via variáveis de ambiente."

### Checklist

- [ ] Instalar: `npm install nodemailer @types/nodemailer`
- [ ] Criar `src/lib/mailer.ts` com configuração Nodemailer
- [ ] `POST /api/relatorios/enviar-email` — gerar PDF e enviar como anexo
- [ ] Validar destinatário com Zod (email válido)
- [ ] Adicionar botão "Enviar por e-mail" na tela de relatórios com modal de confirmação

---

## Fase 12 — Auditoria e Logs (Pós-MVP)

### Objetivo
Registrar ações críticas no `AuditLog` para rastreabilidade.

### Contexto para o Claude Code
> "Implemente o sistema de auditoria do KONTA. Ações como criar/editar/excluir lançamentos e alterar membros devem ser registradas na tabela AuditLog."

### Checklist

- [ ] Criar helper `src/lib/utils/audit.ts` com função `logAction(action, entity, entityId, userId)`
- [ ] Adicionar log nas ações: criar lançamento, editar lançamento, excluir lançamento, alterar role de membro, remover membro
- [ ] `GET /api/admin/audit` — endpoint para ADMIN consultar logs com filtro por período e ação
- [ ] Página de auditoria em `(dashboard)/grupo/auditoria/page.tsx` (apenas ADMIN)

---

## Regras de Negócio Críticas

```
1. ISOLAMENTO DE DADOS
   Todo acesso ao banco deve filtrar por groupId da sessão.
   Nunca retornar dados de outros grupos.

2. PERMISSÕES
   VISUALIZADOR → apenas leitura
   FINANCEIRO   → leitura + criar/editar/excluir lançamentos
   ADMIN        → tudo + gerenciar membros e categorias

3. SALDO
   saldo = SUM(ENTRADA) - SUM(SAIDA) do grupo no período

4. CATEGORIAS
   Ao desativar categoria, lançamentos antigos mantêm o vínculo.
   Categoria desativada não aparece em selects de criação.

5. LGPD — IMAGENS
   Imagens de comprovantes são processadas em memória e descartadas.
   Nunca armazenar no banco ou storage.

6. LANÇAMENTO RECORRENTE
   Ao editar um lançamento recorrente, perguntar:
   "Editar apenas este" ou "Editar todos os futuros"

7. EXCLUSÃO DE GRUPO
   Ao excluir grupo (futuro), cascata em: membros, categorias, lançamentos.
   Implementar soft delete para segurança.
```

---

## Comandos Úteis

```bash
# Subir banco de dados
docker compose up -d db

# Rodar migrations
npx prisma migrate dev

# Abrir Prisma Studio
npx prisma studio

# Rodar seed de categorias padrão
npx prisma db seed

# Iniciar projeto em dev
npm run dev

# Build de produção
npm run build

# Subir tudo com Docker
docker compose up -d

# Ver logs do app
docker compose logs -f app
```

---

## Checklist Geral de Progresso

### MVP
- [ ] **Fase 1** — Setup e Base do Projeto
- [ ] **Fase 2** — Autenticação e Usuários
- [ ] **Fase 3** — Grupos
- [ ] **Fase 4** — Categorias
- [ ] **Fase 5** — Lançamentos Financeiros
- [ ] **Fase 6** — Dashboard
- [ ] **Fase 7** — Reconhecimento por IA (Gemini Vision)
- [ ] **Fase 8** — Relatórios e Exportações

### Pós-MVP
- [ ] **Fase 9** — Lançamentos Recorrentes
- [ ] **Fase 10** — Login Social Google OAuth
- [ ] **Fase 11** — Envio de Relatório por E-mail
- [ ] **Fase 12** — Auditoria e Logs