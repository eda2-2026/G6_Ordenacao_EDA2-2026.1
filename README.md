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
