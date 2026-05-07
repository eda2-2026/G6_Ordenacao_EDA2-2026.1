# 💳 Konta

Konta é um sistema de controle financeiro multi-tenant colaborativo projetado para grupos e empresas que buscam inteligência e velocidade em suas operações diárias.

Com uma arquitetura robusta baseada em **Next.js 14**, o sistema não apenas permite gerenciar o fluxo de caixa com múltiplas permissões e usuários isolados, mas também integra a API do Google **Gemini Vision** para transformar imediatamente fotos de recibos, comprovantes e notas fiscais em lançamentos prontos para revisão, eliminando o trabalho manual com planilhas.

---

## 🛠 Tech Stack

O Konta foi construído aplicando modernas metodologias do ecossistema JavaScript:

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Shadcn/ui
- **Backend:** Next.js Serverless Functions (API Routes), Prisma ORM
- **Database:** PostgreSQL 16
- **Autenticação e Segurança:** NextAuth.js v5 (Auth.js), Bcryptjs, JWT httpOnly, Strict Security Headers (CSP, HSTS)
- **Inteligência Artificial:** Google Generative AI SDK (Gemini 1.5 Pro Vision)
- **Estado Global:** Zustand
- **Validação de Inputs:** Zod
- **Infraestrutura:** Docker & Docker Compose

---

## ✨ Features Principais

- **Dashboard ao vivo:** Receitas, Despesas e Saldo calculados do lado do servidor e visualizados dinamicamente via `recharts`.
- **Inteligência Artificial:** Envio de imagens (Drag & Drop) e extração inteligente de metadados de comprovantes (fornecedor, data, categoria, valor).
- **Multi-tenant e RBAC:** Ambientes encapsulados para grupos. Suporte para papéis: Admin, Financeiro e Visualizador.
- **Relatórios:** Filtros por período com exportação imediata para PDF (`@react-pdf/renderer`) e Excel (`xlsx`).
- **Lançamentos Ágeis:** Lançamentos com recorrência, tags customizadas, notas e busca em tempo real.
- **Segurança de Perímetro (Defense in Depth):** SQL Injection defense, NextAuth cookies selados e cabeçalhos XSS/Frame prevenidos out of the box.

---

## 📚 EDA2 — Ordenação de Lançamentos

Para a disciplina de Estrutura de Dados 02, o módulo de **Lançamentos** recebeu uma camada de ordenação em memória, com comparação entre três algoritmos clássicos:

- **Quicksort**
- **Mergesort**
- **Radix Sort** (para chaves numéricas)

### Onde foi integrado

- **API:** `GET /api/lancamentos` aceita os parâmetros `sortAlgo`, `sortBy` e `sortOrder`.
- **UI:** o filtro de Lançamentos inclui seleção de **Algoritmo**, **Ordenar por** e **Ordem**.
- **Modo padrão:** quando `sortAlgo` não é enviado, a ordenação continua no Postgres (mais eficiente para produção).

Parâmetros suportados:

- `sortAlgo`: `quicksort` | `mergesort` | `radix`
- `sortBy`: `date` | `value`
- `sortOrder`: `asc` | `desc`

Exemplo:

```bash
GET /api/lancamentos?page=1&perPage=20&sortAlgo=radix&sortBy=value&sortOrder=desc
```

### Benchmark (mock)

O benchmark roda localmente com dados mockados para comparar desempenho entre algoritmos.

```bash
npm install
npm run sort:bench
```

### Evidências

Print do terminal (benchmark):

```text
Sorting benchmark - lancamentos (mock data)

Sorting benchmark (key=date, order=desc)
size=1000
   quicksort avg=6.37ms min=5.46ms
   mergesort avg=5.06ms min=4.69ms
   radix     avg=2.22ms min=1.39ms
   winner=radix
size=5000
   quicksort avg=41.48ms min=39.78ms
   mergesort avg=28.52ms min=27.54ms
   radix     avg=8.17ms min=7.34ms
   winner=radix
size=10000
   quicksort avg=110.93ms min=109.07ms
   mergesort avg=63.08ms min=61.32ms
   radix     avg=16.40ms min=15.90ms
   winner=radix
size=25000
   quicksort avg=475.61ms min=470.29ms
   mergesort avg=173.16ms min=172.11ms
   radix     avg=45.31ms min=43.35ms
   winner=radix

Sorting benchmark (key=value, order=desc)
size=1000
   quicksort avg=1.20ms min=0.53ms
   mergesort avg=1.01ms min=0.59ms
   radix     avg=0.44ms min=0.40ms
   winner=radix
size=5000
   quicksort avg=2.00ms min=1.50ms
   mergesort avg=3.51ms min=2.94ms
   radix     avg=1.87ms min=1.84ms
   winner=radix
size=10000
   quicksort avg=3.15ms min=3.10ms
   mergesort avg=6.89ms min=6.13ms
   radix     avg=4.13ms min=3.84ms
   winner=quicksort
size=25000
   quicksort avg=9.14ms min=8.99ms
   mergesort avg=18.99ms min=18.07ms
   radix     avg=13.58ms min=12.97ms
   winner=quicksort
```

Print da UI (Lançamentos com algoritmo selecionado):

- [Docs/prints/ordenacao-ui-placeholder.svg](Docs/prints/ordenacao-ui-placeholder.svg)

---

## 🚀 Como iniciar com Docker

O ambiente já está perfeitamente orquestrado com Docker. Não é necessário possuir nada instalado na máquina exceto o Docker Compose.

1. **Clone o repositório:**
   ```bash
   git clone <repo_url>
   cd konta
   ```

2. **Configure suas chaves ambientais:**
   Copie o arquivo padrão e edite-o (você precisará de uma API Key do Google Gemini):
   ```bash
   cp .env.example .env
   ```
   > Certifique-se de configurar o seu `GEMINI_API_KEY` dentro do `.env` para que as automações de comprovantes funcionem.

3. **Inicie os containers:**
   A compilação e migração das tabelas (`npx prisma migrate`) e o carregamento do banco de dados (Seed) ocorrerão automaticamente no primeiro build.
   ```bash
   docker compose up --build -d
   ```

4. **Acesse a plataforma:**
   Abra seu navegador e visite:
   👉 **http://localhost:3001**

---

## 🔒 Boas Práticas de Segurança e Produção

- O `docker-compose.yml` local provê um ambiente rápido expondo as portas 3001 e 5434. Em produção, você deverá colocar este container atrás de um proxy reverso (como NGINX ou Traefik) fornecendo TLS certificado (HTTPS) ou diretamente em um WAF como o Cloudflare.
- Todo o armazenamento e análise das imagens de comprovantes obedece a políticas rígidas de descarte de memória, visando atender normas como a LGPD. O Konta não retém o arquivo original da foto no banco de dados.

---

*Desenvolvido com excelência técnica.*
