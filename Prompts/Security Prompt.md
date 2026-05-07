# 🔐 Security Prompt — App Web de Controle Financeiro

> **Filosofia:** Defense in Depth. Cada camada protege um vetor de ataque diferente. Se uma falhar, a próxima ainda bloqueia o invasor.

---

## Camada 1 — WAF & Rate Limiting (Perímetro)

### Objetivo
Bloquear tráfego malicioso antes de chegar na aplicação.

### Implementação

```
- Usar Cloudflare WAF ou AWS WAF na frente de toda a aplicação
- Configurar rate limiting por IP:
    · Máx. 100 req/min para rotas públicas
    · Máx. 10 req/min para /login, /register, /forgot-password
    · Máx. 5 req/min para /api/transactions (endpoints financeiros)
- Bloquear automaticamente IPs que disparam 429 por 15 minutos
- Geo-blocking: bloquear países sem usuários legítimos esperados
- Bloquear User-Agents de scanners conhecidos (sqlmap, nikto, dirbuster)
- Fail2ban no servidor para bloquear IPs após N tentativas falhas
```

### Proteção contra
`DDoS` · `Força bruta com wordlist` · `Varredura de rotas` · `Enumeração de usuários`

---

## Camada 2 — Autenticação & Autorização

### Objetivo
Garantir que só usuários legítimos acessem os recursos certos.

### Implementação

```
AUTENTICAÇÃO
- Senha com hash bcrypt (cost factor >= 12) ou Argon2id
- Nenhuma senha armazenada em texto plano, nunca
- MFA obrigatório (TOTP / FIDO2) para operações financeiras
- Tempo de sessão: 30 min idle, 8h absoluto
- Logout total: invalidar todos os tokens ativos do usuário
- Login apenas via HTTPS. Nunca HTTP

JWT / TOKENS
- Access token: expiração curta (15 min)
- Refresh token: rotação automática a cada uso
- Armazenar refresh token em httpOnly cookie, nunca em localStorage
- Invalidar tokens no logout (blacklist ou rotação de secret)
- Não colocar dados sensíveis no payload do JWT

AUTORIZAÇÃO (RBAC)
- Definir roles: admin, accountant, viewer, api_client
- Checar permissão em CADA endpoint no backend — nunca confiar no frontend
- Verificar ownership: user só acessa seus próprios recursos
    · GET /api/transactions/:id → validar que transaction.user_id == req.user.id
- Rejeitar qualquer rota não mapeada com 404 (não 403, para não revelar existência)

PROTEÇÃO CONTRA BRUTE FORCE
- Bloquear conta após 5 tentativas falhas por 15 minutos
- Captcha após 3 tentativas falhas
- Não informar se o email existe: sempre retornar "email/senha inválidos"
- Adicionar delay artificial de 200ms em respostas de login (timing attack)
```

### Proteção contra
`Força bruta` · `Wordlist` · `Credential stuffing` · `Session hijacking` · `IDOR` · `Privilege escalation` · `Burp Suite — auth bypass`

---

## Camada 3 — Validação & Sanitização de Input

### Objetivo
Garantir que nenhum dado malicioso entre na aplicação ou banco de dados.

### Implementação

```
SQL INJECTION
- NUNCA concatenar strings em queries SQL
- Usar SEMPRE prepared statements ou ORM parametrizado:
    · ✅ db.query("SELECT * FROM users WHERE id = ?", [userId])
    · ❌ db.query("SELECT * FROM users WHERE id = " + userId)
- Validar tipo de dado antes de qualquer query (int, uuid, string)
- Rejeitar inputs com caracteres SQL especiais quando não esperados: ' " ; -- /*

XSS (Cross-Site Scripting)
- Escapar todo output HTML — nunca inserir input do usuário direto no DOM
- Usar Content Security Policy (CSP) restritivo
- Sanitizar campos de texto com biblioteca validada (DOMPurify no frontend)
- Rejeitar tags HTML em campos que não aceitam HTML (nomes, descrições)

INPUT VALIDATION (ALLOWLIST, não blocklist)
- Validar no BACKEND sempre — frontend validation é apenas UX
- Campos financeiros:
    · amount: number, positivo, máx. 2 casas decimais, <= limite definido
    · currency: enum fixo ['BRL', 'USD', 'EUR'] — nunca string livre
    · date: formato ISO 8601, range razoável (não aceitar datas de 1900)
- Campos de texto:
    · name: máx. 100 chars, regex [a-zA-ZÀ-ú\s]
    · description: máx. 255 chars, strip HTML
- IDs: uuid v4 — nunca aceitar IDs incrementais expostos
- Rejeitar payloads maiores que o necessário (ex: body > 10KB para login)
- Usar schema validation: Zod (Node), Pydantic (Python), joi, etc.

PATH TRAVERSAL
- Nunca usar input do usuário para montar caminhos de arquivo
- Se aceitar uploads: validar MIME type real (magic bytes), não extensão
- Armazenar uploads fora do webroot
```

### Proteção contra
`SQL Injection` · `XSS` · `Command Injection` · `Path Traversal` · `Mass Assignment` · `Type juggling`

---

## Camada 4 — Segurança da API & Comunicação

### Objetivo
Proteger a comunicação entre cliente e servidor e entre serviços.

### Implementação

```
TLS / HTTPS
- TLS 1.2 mínimo, preferir TLS 1.3
- HSTS habilitado: Strict-Transport-Security: max-age=31536000; includeSubDomains
- Redirecionar HTTP → HTTPS via 301

HEADERS DE SEGURANÇA (configurar no servidor/gateway)
- Content-Security-Policy: default-src 'self'
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: no-referrer
- Permissions-Policy: geolocation=(), microphone=()
- Cache-Control: no-store em rotas financeiras (evitar cache de dados sensíveis)

CORS
- Allowlist explícita de origens: nunca usar Access-Control-Allow-Origin: *
- Métodos permitidos apenas os necessários: GET, POST, PUT, DELETE
- Credenciais: Access-Control-Allow-Credentials: true apenas para origens confiáveis

CSRF
- Token CSRF em todas as mutations (POST, PUT, DELETE, PATCH)
- SameSite=Strict nos cookies de sessão
- Double submit cookie pattern ou Synchronizer Token Pattern

API KEYS (para integrações)
- Nunca expor API keys no frontend ou Git
- Usar variáveis de ambiente (.env não commitado)
- Rotacionar keys regularmente
- Scope mínimo por key (read-only onde possível)

EXPOSIÇÃO DE DADOS
- Nunca retornar campos desnecessários (ex: hash de senha, tokens internos)
- Usar DTOs / serializers para controlar o que sai em cada response
- Mensagens de erro genéricas para o usuário, detalhe apenas nos logs internos
- Desabilitar stack trace em produção
```

### Proteção contra
`Man-in-the-middle` · `CSRF` · `Clickjacking` · `CORS abuse` · `Information disclosure` · `Burp Suite — intercept/replay`

---

## Camada 5 — Banco de Dados

### Objetivo
Proteger os dados mesmo se o servidor for comprometido.

### Implementação

```
ACESSO
- Usuário do banco com least privilege:
    · App user: SELECT, INSERT, UPDATE, DELETE nas tabelas necessárias
    · Nunca: DROP, TRUNCATE, CREATE, acesso ao schema de outros sistemas
- Banco de dados nunca exposto à internet (somente acessível internamente)
- Senha do banco em secret manager (AWS Secrets Manager, Vault, etc.)

CRIPTOGRAFIA
- Dados sensíveis criptografados at-rest (AES-256)
- Campos extra-sensíveis criptografados na aplicação antes de salvar:
    · CPF, número de conta, saldo (considere criptografia a nível de campo)
- Backups criptografados e testados regularmente

AUDITORIA
- Audit log imutável de todas as operações financeiras:
    · Quem fez · O quê · Quando · De onde (IP) · Dado anterior · Dado novo
- Log em tabela separada ou sistema externo (não pode ser apagado pelo app user)
- Retenção mínima de 5 anos para dados financeiros (conformidade)

BACKUP & RECOVERY
- Backup diário automatizado
- Teste de restore mensal
- RTO e RPO definidos e documentados
```

### Proteção contra
`Data breach` · `Privilege escalation no DB` · `Backup exfiltration` · `Insider threat`

---

## Camada 6 — Monitoramento, Logging & Resposta

### Objetivo
Detectar ataques em andamento e responder rapidamente.

### Implementação

```
LOGGING
- Logar TODOS os eventos de segurança:
    · Tentativas de login (sucesso e falha) com IP e timestamp
    · Alterações de senha / email / MFA
    · Operações financeiras (criação, edição, exclusão)
    · Acesso a dados sensíveis
    · Erros 4xx/5xx com payload (sem dados sensíveis)
    · Mudanças de permissão / role
- Formato estruturado (JSON): fácil de indexar e consultar
- Nunca logar senhas, tokens ou dados de cartão

MONITORAMENTO & ALERTAS
- Alertar em tempo real para:
    · > 10 logins falhos de mesmo IP em 5 min
    · Login de novo país / device
    · Transação acima de threshold (ex: > R$ 10.000)
    · Erro 500 em endpoints financeiros
    · Tentativa de acesso a rota inexistente (scan de diretório)
- Integrar com SIEM (Datadog, Elastic SIEM, Grafana + Loki)

HONEYPOTS
- Criar rotas falsas que nunca deveriam ser acessadas:
    · /admin, /wp-admin, /phpinfo.php, /.env, /config.json
    · Qualquer acesso = IP automaticamente banido + alerta
- Campo honeypot em formulários (campo invisível — bot preenche, humano não)

RESPOSTA A INCIDENTES
- Playbook documentado para:
    · Credential stuffing detectado → forçar reset de senha em massa
    · SQL injection detectado → isolar serviço + investigar logs
    · Dados vazados → notificar usuários + LGPD/GDPR compliance
- Contatos de emergência documentados
- Exercício de resposta simulado a cada 6 meses

DEPENDENCY SCANNING
- Verificar vulnerabilidades em dependências (npm audit, Snyk, Dependabot)
- Atualizar dependências regularmente
- Nunca usar dependências abandonadas em componentes críticos
```

### Proteção contra
`Ataques persistentes` · `Insider threat` · `Zero-day` · `Compliance (LGPD)`

---

## Checklist — Vetores de Ataque Específicos

| Ataque | Defesa Principal | Defesa Secundária |
|--------|-----------------|------------------|
| SQL Injection | Prepared statements | WAF + input validation |
| Brute force / Wordlist | Rate limit + lockout | Captcha + MFA |
| Burp Suite — route scan | 404 para rotas inexistentes | Honeypot + ban automático |
| Burp Suite — replay attack | CSRF token | Token de idempotência |
| Burp Suite — auth bypass | RBAC no backend | JWT com expiração curta |
| XSS | CSP + sanitização | httpOnly cookie |
| IDOR | Checar ownership no backend | UUID em vez de ID sequencial |
| Session hijacking | httpOnly + Secure cookie | Curto TTL + device fingerprint |
| Man-in-the-middle | TLS 1.3 + HSTS | Certificate pinning (mobile) |
| Data breach | Criptografia at-rest | Least privilege no banco |
| Credential stuffing | MFA | Detecção de padrão anômalo |
| Path traversal | Nunca usar input em paths | Armazenar uploads fora do webroot |

---

## Conformidade & Boas Práticas

```
LGPD (Lei Geral de Proteção de Dados)
- Coletar apenas dados necessários (data minimization)
- Política de privacidade clara
- Direito ao esquecimento: mecanismo de exclusão de dados
- DPO definido para apps com dados financeiros sensíveis

OWASP Top 10 — verificar e mitigar todos os 10 itens antes do lançamento

PENTEST
- Realizar pentest externo antes do lançamento (mínimo)
- Pentest recorrente anual ou após grandes mudanças
- Bug bounty program para apps em produção com base de usuários

SECRETS MANAGEMENT
- Nunca commitar .env, chaves, tokens no Git
- Usar .gitignore + git-secrets + pré-commit hooks
- Rotacionar secrets comprometidos IMEDIATAMENTE
```

---

## Resumo de Prioridade

```
🔴 CRÍTICO (fazer antes do lançamento)
   - Prepared statements (SQL injection)
   - HTTPS + TLS 1.3
   - Rate limiting em /login
   - Hash de senha com bcrypt/argon2
   - JWT httpOnly cookie
   - RBAC no backend

🟡 IMPORTANTE (fazer nas primeiras semanas)
   - MFA
   - CSP headers
   - CSRF token
   - Audit log
   - Monitoring + alertas

🟢 RECOMENDADO (iteração contínua)
   - Pentest externo
   - Bug bounty
   - Honeypots
   - Dependency scanning automatizado
   - Incident response playbook
```

---

*Baseado em OWASP Top 10, NIST Cybersecurity Framework e boas práticas de segurança para aplicações financeiras.*