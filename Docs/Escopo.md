# Konta — Sistema de Controle de Contas
### Documento de Levantamento de Requisitos

| Campo | Detalhe |
|---|---|
| Versão | 1.0 — Inicial |
| Data | Maio de 2026 |
| Status | Em definição |
| Tipo | Sistema Web — Múltiplos usuários por grupo/empresa |

---

## 1. Visão Geral do Sistema

O **Konta** é um sistema de controle financeiro voltado para grupos e empresas. Seu foco é permitir que múltiplos usuários registrem entradas e saídas financeiras de forma simples e visual, com suporte ao reconhecimento de comprovantes e notas fiscais via foto, dashboards em tempo real e relatórios completos para tomada de decisão.

---

## 2. Objetivos do Produto

- Permitir o registro ágil de entradas e saídas financeiras por múltiplos usuários
- Automatizar a criação de lançamentos a partir de fotos de comprovantes, recibos e notas fiscais via IA
- Oferecer visualização em tempo real do fluxo financeiro por usuário, grupo ou empresa
- Possibilitar a criação de categorias personalizadas para classificação dos lançamentos
- Gerar relatórios mensais, gráficos analíticos e exportações em PDF e Excel

---

## 3. Módulos do Sistema

### 3.1 Autenticação e Gestão de Usuários

- Cadastro e login de usuários com autenticação segura
- Criação de grupos (empresas/equipes) com convite por e-mail ou código
- Perfis com diferentes níveis de permissão: **Administrador**, **Financeiro** e **Visualizador**
- Cada grupo possui seu próprio ambiente isolado de dados

### 3.2 Lançamentos Financeiros (Entrada e Saída)

- Registro manual de lançamentos com: tipo (entrada/saída), valor, data, descrição, categoria e responsável
- Confirmação ou edição dos dados antes de salvar o lançamento
- Suporte a lançamentos recorrentes (mensalidades, salários, aluguel)
- Histórico completo de lançamentos com filtros por data, tipo, categoria e usuário

### 3.3 Reconhecimento de Comprovantes por IA (Foto)

- Upload de foto diretamente pelo app ou câmera do dispositivo
- A IA analisa a imagem e extrai automaticamente: valor, data, tipo (entrada/saída), estabelecimento e descrição
- O sistema sugere a categoria com base no conteúdo reconhecido
- O usuário revisa e confirma (ou edita) os dados antes de salvar
- Suporte a comprovantes de PIX, notas fiscais, recibos e cupons

### 3.4 Dashboard em Tempo Real

- Painel principal com: saldo atual, total de entradas e total de saídas do período
- Gráfico de fluxo de caixa por dia/semana/mês
- Gráfico de pizza com distribuição por categoria
- Indicadores visuais de variação em relação ao período anterior
- Filtros por usuário, grupo, período e categoria

### 3.5 Categorias Personalizadas

- Categorias padrão pré-definidas: Alimentação, Transporte, Salário, Fornecedores, Impostos, Outros
- Criação ilimitada de categorias personalizadas com nome, ícone e cor
- Categorias compartilhadas dentro do grupo ou privadas do usuário
- Edição e desativação de categorias sem perda do histórico

### 3.6 Relatórios e Exportações

- Resumo mensal com comparativo mês a mês
- Gráficos de tendência de gastos e receitas
- Exportação de relatórios em PDF (formatado) e Excel (.xlsx)
- Relatório por usuário, por categoria e por período personalizado
- Envio de relatório por e-mail diretamente pelo sistema

---

## 4. Requisitos Não Funcionais

| Atributo | Descrição |
|---|---|
| Desempenho | Dashboard deve atualizar em tempo real (< 2s de latência) |
| Segurança | Dados criptografados em trânsito (HTTPS) e em repouso |
| Escalabilidade | Suporte a múltiplos grupos simultâneos sem degradação |
| Usabilidade | Interface responsiva para web e mobile (PWA ou app nativo) |
| Disponibilidade | Uptime mínimo de 99,5% mensais |
| Acessibilidade | Suporte a leitores de tela e contraste WCAG AA |

---

## 5. Fluxo Principal do Usuário

| Etapa | Ação do Usuário | Resposta do Sistema |
|---|---|---|
| 1 | Faz login e acessa o grupo | Exibe dashboard com saldo e lançamentos recentes |
| 2 | Envia foto de comprovante | IA interpreta e preenche o formulário automaticamente |
| 3 | Revisa e confirma os dados | Lançamento salvo e dashboard atualizado em tempo real |
| 4 | Acessa relatórios do mês | Exibe gráficos e permite exportar PDF/Excel |
| 5 | Admin cria nova categoria | Categoria disponível para todo o grupo imediatamente |

---

## 6. Premissas e Restrições

- O sistema será desenvolvido como aplicação web responsiva (possibilidade de app mobile futuro)
- O reconhecimento de imagens utilizará uma API de IA (ex: Claude Vision, GPT-4 Vision ou similar)
- O armazenamento de imagens de comprovantes deve respeitar a LGPD — dados de terceiros não devem ser retidos além do necessário
- Cada grupo terá plano de uso com limite de usuários e armazenamento conforme tier contratado
- Integração com bancos e Open Finance está fora do escopo da versão inicial

---

## 7. Próximos Passos

1. Validação deste documento com o cliente/stakeholders
2. Definição de tecnologias (stack frontend, backend e banco de dados)
3. Prototipação das telas principais (wireframes e mockups)
4. Planejamento de sprints e definição do MVP (versão mínima viável)
5. Início do desenvolvimento com entregas iterativas quinzenais