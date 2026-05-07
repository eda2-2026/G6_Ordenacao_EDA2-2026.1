# KONTA — Documento Técnico Completo
### Requisitos Funcionais, Não Funcionais, Arquitetura de Software e Arquitetura de Pastas

| Campo | Detalhe |
|---|---|
| Versão | 2.0 — Técnico |
| Data | Maio de 2026 |
| Stack Principal | Next.js 14 · TypeScript · PostgreSQL · Docker |
| Autenticação | NextAuth / Auth.js |
| IA | Google Gemini Vision |
| Deploy | Docker Compose (local/VPS) |

---

## 1. Atualização do Roadmap

| # | Item | Status | Decisão |
|---|---|---|---|
| 1 | Validação do documento com cliente | ✅ Concluído | Validado pelo cliente |
| 2 | Definição de tecnologias | ✅ Concluído | Next.js · TypeScript · PostgreSQL · Docker |
| 3 | Prototipação de telas | ✅ Concluído | Frontend gerado via Lovable |
| 4 | Planejamento de sprints e MVP | ✅ Concluído | Definido neste documento |
| 5 | Entregas iterativas quinzenais | ➖ N/A | Projeto pessoal — sem sprints formais |

---

## 2. Requisitos Funcionais

### RF01 — Autenticação e Usuários

| ID | Requisito |
|---|---|
| RF01.1 | O sistema deve permitir cadastro de usuário com nome, e-mail e senha |
| RF01.2 | O sistema deve autenticar usuários via NextAuth com sessão JWT |
| RF01.3 | O sistema deve suportar login social (Google OAuth via NextAuth) |
| RF01.4 | O sistema deve permitir recuperação de senha via e-mail |
| RF01.5 | Cada usuário pode pertencer a um ou mais grupos |
| RF01.6 | O sistema deve suportar os perfis: **Admin**, **Financeiro** e **Visualizador** |
| RF01.7 | Apenas Admin pode convidar, remover usuários e gerenciar categorias do grupo |

### RF02 — Grupos / Empresa

| ID | Requisito |
|---|---|
| RF02.1 | Admin pode criar um grupo com nome e descrição |
| RF02.2 | O sistema deve gerar um código de convite único por grupo |
| RF02.3 | Usuários podem entrar em um grupo via código ou link de convite |
| RF02.4 | Cada grupo possui ambiente de dados isolado (multi-tenant) |
| RF02.5 | Admin pode alterar o perfil de qualquer membro do grupo |
| RF02.6 | Admin pode remover membros do grupo |

### RF03 — Lançamentos Financeiros

| ID | Requisito |
|---|---|
| RF03.1 | O usuário deve poder criar lançamentos do tipo **Entrada** ou **Saída** |
| RF03.2 | Campos obrigatórios: tipo, valor, data, descrição e categoria |
| RF03.3 | Campos opcionais: observações, anexo (comprovante), recorrência |
| RF03.4 | Lançamentos recorrentes devem suportar frequência: diária, semanal, mensal |
| RF03.5 | O usuário pode editar ou excluir seus próprios lançamentos |
| RF03.6 | Admin e Financeiro podem editar/excluir qualquer lançamento do grupo |
| RF03.7 | O sistema deve exibir histórico paginado com filtros por: data, tipo, categoria e usuário |
| RF03.8 | O sistema deve calcular e exibir o saldo atual em tempo real |

### RF04 — Reconhecimento de Comprovante por IA

| ID | Requisito |
|---|---|
| RF04.1 | O usuário pode fazer upload de foto ou capturar pela câmera do dispositivo |
| RF04.2 | O sistema deve enviar a imagem para a API do Google Gemini Vision |
| RF04.3 | A IA deve extrair: valor, data, tipo (entrada/saída), estabelecimento e descrição |
| RF04.4 | A IA deve sugerir automaticamente uma categoria com base no conteúdo |
| RF04.5 | O formulário deve ser pré-preenchido com os dados extraídos pela IA |
| RF04.6 | O usuário deve revisar e confirmar (ou corrigir) antes de salvar |
| RF04.7 | Formatos suportados: JPG, PNG, WEBP e PDF de página única |
| RF04.8 | Em caso de falha na extração, o formulário abre em branco para preenchimento manual |

### RF05 — Dashboard em Tempo Real

| ID | Requisito |
|---|---|
| RF05.1 | O dashboard deve exibir: saldo atual, total de entradas e total de saídas do período |
| RF05.2 | O sistema deve atualizar o dashboard ao salvar qualquer novo lançamento |
| RF05.3 | Deve exibir gráfico de linha com fluxo de caixa (dia/semana/mês) |
| RF05.4 | Deve exibir gráfico de pizza com distribuição por categoria |
| RF05.5 | Deve exibir os últimos 5 lançamentos na tela inicial |
| RF05.6 | Deve exibir indicador de variação percentual em relação ao período anterior |
| RF05.7 | O usuário pode filtrar o dashboard por: período, categoria e membro do grupo |

### RF06 — Categorias Personalizadas

| ID | Requisito |
|---|---|
| RF06.1 | O sistema deve ter categorias padrão: Alimentação, Transporte, Salário, Fornecedores, Impostos, Outros |
| RF06.2 | Admin pode criar categorias personalizadas com nome, ícone (emoji) e cor (hex) |
| RF06.3 | Categorias criadas ficam disponíveis para todos os membros do grupo |
| RF06.4 | Admin pode editar ou desativar categorias sem apagar o histórico |
| RF06.5 | Categorias desativadas não aparecem na seleção, mas mantêm o vínculo com lançamentos antigos |

### RF07 — Relatórios e Exportações

| ID | Requisito |
|---|---|
| RF07.1 | O sistema deve gerar resumo mensal com total de entradas, saídas e saldo |
| RF07.2 | O sistema deve permitir comparativo entre dois períodos |
| RF07.3 | O usuário pode exportar relatório em **PDF** formatado |
| RF07.4 | O usuário pode exportar relatório em **Excel (.xlsx)** |
| RF07.5 | Filtros disponíveis: período personalizado, categoria, membro do grupo |
| RF07.6 | O sistema deve permitir envio do relatório por e-mail diretamente pela plataforma |

---

## 3. Requisitos Não Funcionais

### RNF01 — Desempenho

| ID | Requisito |
|---|---|
| RNF01.1 | O dashboard deve carregar em menos de 2 segundos |
| RNF01.2 | A resposta da API do Gemini Vision deve ter timeout de 15 segundos |
| RNF01.3 | Listagens com paginação de até 50 itens por página |
| RNF01.4 | Queries ao PostgreSQL devem usar índices nas colunas de filtro principais |

### RNF02 — Segurança

| ID | Requisito |
|---|---|
| RNF02.1 | Toda comunicação deve usar HTTPS (TLS 1.2+) |
| RNF02.2 | Senhas armazenadas com bcrypt (salt rounds ≥ 12) |
| RNF02.3 | Sessões gerenciadas via NextAuth com tokens JWT assinados |
| RNF02.4 | Rotas da API protegidas por middleware de autenticação |
| RNF02.5 | Validação e sanitização de todos os inputs no servidor (Zod) |
| RNF02.6 | Chaves de API (Gemini, SMTP) armazenadas exclusivamente em variáveis de ambiente |
| RNF02.7 | Imagens de comprovantes armazenadas de forma segura e não acessíveis publicamente sem autenticação |

### RNF03 — Conformidade e Privacidade (LGPD)

| ID | Requisito |
|---|---|
| RNF03.1 | Imagens de comprovantes não devem ser retidas após a extração dos dados pela IA |
| RNF03.2 | O usuário deve poder solicitar exclusão dos seus dados (direito ao esquecimento) |
| RNF03.3 | Logs de acesso não devem armazenar dados sensíveis (valores, descrições) |

### RNF04 — Usabilidade e Acessibilidade

| ID | Requisito |
|---|---|
| RNF04.1 | Interface responsiva para desktop e mobile |
| RNF04.2 | Contraste mínimo WCAG AA em todos os textos |
| RNF04.3 | Feedback visual em todas as ações (loading, sucesso, erro) |
| RNF04.4 | Suporte a leitores de tela com uso correto de aria-labels |

### RNF05 — Confiabilidade e Manutenibilidade

| ID | Requisito |
|---|---|
| RNF05.1 | Cobertura mínima de testes unitários nas regras de negócio: 70% |
| RNF05.2 | Migrações de banco gerenciadas via Prisma Migrate |
| RNF05.3 | Logs estruturados em JSON para facilitar depuração |
| RNF05.4 | Variáveis de ambiente documentadas no `.env.example` |

---

## 4. Arquitetura de Software

### 4.1 Visão Geral

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER / MOBILE                  │
│              Next.js App (React + RSC)               │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP / Server Actions
┌───────────────────────▼─────────────────────────────┐
│               NEXT.JS API ROUTES (BFF)               │
│     /api/auth  /api/lancamentos  /api/relatorios     │
│            /api/grupos  /api/ia  /api/categorias     │
└──────┬─────────────────┬──────────────────┬──────────┘
       │                 │                  │
┌──────▼──────┐  ┌───────▼──────┐  ┌───────▼────────┐
│  NextAuth   │  │    Prisma    │  │  Gemini Vision │
│  Auth.js    │  │     ORM      │  │   Google API   │
└─────────────┘  └───────┬──────┘  └────────────────┘
                         │
                ┌────────▼────────┐
                │   PostgreSQL    │
                │   (Docker)      │
                └─────────────────┘
```

### 4.2 Decisões Arquiteturais

| Decisão | Escolha | Justificativa |
|---|---|---|
| Framework | Next.js 14 (App Router) | Fullstack TypeScript, RSC, Server Actions |
| ORM | Prisma | Type-safe, migrations, excelente DX com TypeScript |
| Banco de dados | PostgreSQL | Relacional, robusto, suporte nativo a JSON |
| Autenticação | NextAuth v5 (Auth.js) | Integração nativa com Next.js, suporte a OAuth |
| Validação | Zod | Schema validation no client e server com tipagem |
| IA | Google Gemini Vision | Multimodal, custo-benefício, suporte a imagens |
| Container | Docker + Docker Compose | Reprodutibilidade local e em produção (VPS) |
| Estilo | Tailwind CSS | Utilitário, compatível com Lovable |
| Estado global | Zustand ou Context API | Leve, sem overhead desnecessário |
| Gráficos | Recharts | Simples, baseado em React, boa documentação |
| Exportação PDF | @react-pdf/renderer | Geração server-side de PDFs |
| Exportação Excel | xlsx (SheetJS) | Geração de .xlsx no servidor |

### 4.3 Modelo de Dados (Entidades Principais)

```
User
├── id
├── name
├── email
├── password (hash)
├── createdAt
└── groups[] → GroupMember

Group
├── id
├── name
├── description
├── inviteCode (único)
├── createdAt
└── members[] → GroupMember

GroupMember
├── userId
├── groupId
└── role: ADMIN | FINANCEIRO | VISUALIZADOR

Category
├── id
├── name
├── icon (emoji)
├── color (hex)
├── isDefault (bool)
├── isActive (bool)
└── groupId

Transaction
├── id
├── type: ENTRADA | SAIDA
├── value (Decimal)
├── date
├── description
├── notes (opcional)
├── isRecurring (bool)
├── recurrenceFrequency: DIARIA | SEMANAL | MENSAL
├── createdAt
├── userId
├── groupId
└── categoryId

AuditLog
├── id
├── action
├── entity
├── entityId
├── userId
└── createdAt
```

### 4.4 Fluxo de Reconhecimento por IA

```
1. Usuário faz upload da imagem
        ↓
2. Next.js recebe via API Route (/api/ia/extrair)
        ↓
3. Imagem convertida para base64
        ↓
4. Enviada ao Google Gemini Vision com prompt estruturado
        ↓
5. Gemini retorna JSON com: valor, data, tipo, estabelecimento, descrição
        ↓
6. Sistema sugere categoria com base na descrição/estabelecimento
        ↓
7. Formulário pré-preenchido exibido ao usuário
        ↓
8. Usuário revisa → confirma → lançamento salvo no banco
        ↓
9. Imagem descartada (não armazenada — LGPD)
```

### 4.5 Estratégia de Autenticação

```
NextAuth v5 (Auth.js)
├── Provider: Credentials (e-mail + senha)
├── Provider: Google OAuth
├── Sessão: JWT strategy
├── Middleware: matcher em /dashboard/** e /api/**
└── Callbacks: enriquecer token com groupId e role
```

---

## 5. Arquitetura de Pastas

```
KONTA/
├── .env                          # Variáveis de ambiente (não commitado)
├── .env.example                  # Template das variáveis
├── docker-compose.yml            # PostgreSQL + app em containers
├── Dockerfile                    # Imagem de produção Next.js
├── next.config.ts                # Configuração do Next.js
├── tailwind.config.ts            # Configuração do Tailwind
├── tsconfig.json
├── prisma/
│   ├── schema.prisma             # Modelos do banco de dados
│   └── migrations/               # Histórico de migrações
│
├── public/
│   └── icons/                    # Ícones e imagens estáticas
│
└── src/
    ├── app/                      # App Router (Next.js 14)
    │   ├── layout.tsx            # Layout raiz
    │   ├── page.tsx              # Landing page / redirect
    │   │
    │   ├── (auth)/               # Grupo de rotas públicas
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   └── cadastro/
    │   │       └── page.tsx
    │   │
    │   ├── (dashboard)/          # Grupo de rotas protegidas
    │   │   ├── layout.tsx        # Layout com sidebar/navbar
    │   │   ├── dashboard/
    │   │   │   └── page.tsx      # Dashboard principal
    │   │   ├── lancamentos/
    │   │   │   ├── page.tsx      # Listagem de lançamentos
    │   │   │   ├── novo/
    │   │   │   │   └── page.tsx  # Criar lançamento manual
    │   │   │   └── [id]/
    │   │   │       └── page.tsx  # Editar lançamento
    │   │   ├── comprovante/
    │   │   │   └── page.tsx      # Upload e análise por IA
    │   │   ├── categorias/
    │   │   │   └── page.tsx      # Gerenciar categorias
    │   │   ├── relatorios/
    │   │   │   └── page.tsx      # Relatórios e exportações
    │   │   └── grupo/
    │   │       ├── page.tsx      # Painel do grupo
    │   │       └── membros/
    │   │           └── page.tsx  # Gerenciar membros
    │   │
    │   └── api/                  # API Routes (BFF)
    │       ├── auth/
    │       │   └── [...nextauth]/
    │       │       └── route.ts  # Handler do NextAuth
    │       ├── lancamentos/
    │       │   ├── route.ts      # GET (listar) / POST (criar)
    │       │   └── [id]/
    │       │       └── route.ts  # GET / PUT / DELETE
    │       ├── categorias/
    │       │   ├── route.ts
    │       │   └── [id]/
    │       │       └── route.ts
    │       ├── grupos/
    │       │   ├── route.ts
    │       │   └── [id]/
    │       │       ├── route.ts
    │       │       └── membros/
    │       │           └── route.ts
    │       ├── ia/
    │       │   └── extrair/
    │       │       └── route.ts  # Recebe imagem → chama Gemini
    │       └── relatorios/
    │           ├── pdf/
    │           │   └── route.ts  # Geração de PDF
    │           └── excel/
    │               └── route.ts  # Geração de XLSX
    │
    ├── components/               # Componentes React reutilizáveis
    │   ├── ui/                   # Componentes base (shadcn/ui)
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── modal.tsx
    │   │   └── ...
    │   ├── dashboard/
    │   │   ├── SaldoCard.tsx
    │   │   ├── GraficoFluxo.tsx
    │   │   └── GraficoCategorias.tsx
    │   ├── lancamentos/
    │   │   ├── FormLancamento.tsx
    │   │   ├── ListaLancamentos.tsx
    │   │   └── CardLancamento.tsx
    │   ├── comprovante/
    │   │   └── UploadComprovante.tsx
    │   ├── categorias/
    │   │   └── FormCategoria.tsx
    │   └── layout/
    │       ├── Sidebar.tsx
    │       ├── Navbar.tsx
    │       └── PageHeader.tsx
    │
    ├── lib/                      # Utilitários e integrações
    │   ├── prisma.ts             # Instância singleton do Prisma Client
    │   ├── auth.ts               # Configuração do NextAuth
    │   ├── gemini.ts             # Client e prompt do Gemini Vision
    │   ├── validations/          # Schemas Zod
    │   │   ├── lancamento.ts
    │   │   ├── categoria.ts
    │   │   └── grupo.ts
    │   └── utils/
    │       ├── formatters.ts     # Formatação de moeda, datas
    │       ├── pdf.ts            # Geração de PDF
    │       └── excel.ts          # Geração de Excel
    │
    ├── hooks/                    # Custom React Hooks
    │   ├── useLancamentos.ts
    │   ├── useDashboard.ts
    │   └── useGrupo.ts
    │
    ├── store/                    # Estado global (Zustand)
    │   ├── useAuthStore.ts
    │   └── useGrupoStore.ts
    │
    ├── types/                    # Tipos e interfaces TypeScript
    │   ├── lancamento.ts
    │   ├── usuario.ts
    │   ├── grupo.ts
    │   └── categoria.ts
    │
    └── middleware.ts             # Proteção de rotas (NextAuth)
```

---

## 6. Docker Compose

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
    environment:
      DATABASE_URL: postgresql://KONTA:KONTA_secret@db:5432/KONTA_db
    depends_on:
      - db

volumes:
  postgres_data:
```

---

## 7. Variáveis de Ambiente

```bash
# .env.example

# Banco de dados
DATABASE_URL="postgresql://KONTA:KONTA_secret@localhost:5432/KONTA_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua_chave_secreta_aqui"

# Google OAuth (NextAuth)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Google Gemini Vision
GEMINI_API_KEY="..."

# E-mail (para relatórios e recuperação de senha)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu@email.com"
SMTP_PASS="sua_senha_de_app"
```

---

## 8. MVP — Definição do Escopo Mínimo Viável

O MVP deve cobrir o ciclo principal do produto: **registrar, visualizar e exportar**.

### ✅ Incluso no MVP

| Módulo | Funcionalidades |
|---|---|
| Autenticação | Cadastro, login com e-mail/senha, sessão JWT |
| Grupos | Criar grupo, gerar código de convite, entrar no grupo |
| Lançamentos | Criar, listar, editar e excluir (entrada e saída) |
| IA (Foto) | Upload de comprovante → extração automática → confirmação |
| Dashboard | Saldo, total entrada/saída, gráfico de fluxo, últimos lançamentos |
| Categorias | Categorias padrão + criação de categorias personalizadas |
| Relatórios | Resumo mensal + exportação em PDF e Excel |

### ❌ Fora do MVP (versões futuras)

| Funcionalidade | Motivo |
|---|---|
| Login social Google OAuth | Pode ser adicionado depois do MVP estável |
| Lançamentos recorrentes | Complexidade adicional, não essencial no início |
| Envio de relatório por e-mail | Depende de configuração SMTP, segunda fase |
| Comparativo entre períodos | Feature de relatório avançado |
| Gestão avançada de membros (perfis) | MVP usa apenas Admin por padrão |
| Auditoria de ações (AuditLog) | Observabilidade avançada, pós-MVP |

### Ordem de Desenvolvimento Sugerida

```
Fase 1 — Base
  → Setup Next.js + Prisma + Docker + NextAuth
  → Modelos do banco (User, Group, Category, Transaction)
  → Autenticação (cadastro + login)

Fase 2 — Core Financeiro
  → CRUD de lançamentos
  → Sistema de categorias (padrão + personalizadas)
  → Listagem com filtros

Fase 3 — Dashboard
  → Cálculo de saldo em tempo real
  → Gráfico de fluxo de caixa
  → Gráfico de pizza por categoria

Fase 4 — IA
  → Integração com Gemini Vision
  → Upload de comprovante
  → Formulário pré-preenchido + confirmação

Fase 5 — Relatórios
  → Resumo mensal
  → Exportação PDF
  → Exportação Excel

Fase 6 — Grupos
  → Criar grupo + código de convite
  → Isolamento de dados por grupo
  → Perfis de permissão
```