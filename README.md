
# TechNexus | Gestão Corporativa de Ativos de TI e Helpdesk

Plataforma full-stack corporativa com foco em arquitetura escalável, segurança em profundidade e experiência operacional para gestão de ativos e atendimento técnico.

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-3NF-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15%2B%20App%20Router-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Security](https://img.shields.io/badge/Security-RBAC%20%2B%20JWT-0F172A)]()

## Impacto de Negócio

O TechNexus resolve um problema clássico de operação corporativa: rastrear ativos e incidentes com governança rigorosa, auditoria de mudanças e baixa ambiguidade operacional.

- Reduz risco de inconsistência com **RBAC por perfil** (`ADMIN`, `TECH`, `EMPLOYEE`) em backend e frontend.
- Evita desvios de processo com **Máquina de Estados Finita inquebrável** no ciclo de chamados.
- Centraliza rastreabilidade de suporte e inventário em um fluxo único, reduzindo esforço manual e tempo de resposta.

## Demonstração Visual

![TechNexus Dashboard em Ação](./docs/dashboard-demo.gif)
<img width="1280" height="720" alt="Adobe Express - 2026-05-29 17-15-18 - Trim2 (1)" src="https://github.com/user-attachments/assets/4446df48-f37d-42c5-88e3-849f1ed4ada1" />

## Technical Highlights

- **Máquina de Estados Restritiva:** bloqueio explícito de transições ilegais de status de chamados (ex.: regressão de `RESOLVED` para estados anteriores).
- **Prevenção de N+1:** consultas relacionais otimizadas no Prisma com `select/include` direcionado por caso de uso.
- **Renderização Híbrida (SSR & CSR):** uso avançado de Server Components para data fetching seguro e Client Components para interação rica no App Router.
- **Interceptação Global de Rede:** instância Axios central com injeção automática de JWT em `Authorization` e padronização de chamadas protegidas.
- **Fronteira de Erros:** Error Boundaries no App Router para resiliência visual e recuperação de falhas sem “tela branca”.

## Stack Tecnológico

### Backend

- Node.js
- TypeScript (strict mode)
- PostgreSQL modelado em **3NF**
- Prisma ORM (migrations + client)
- Zod para validação de contratos HTTP

### Frontend

- Next.js 15+ (App Router)
- Tailwind CSS
- Shadcn UI (primitivos e composição de interfaces)
- React Hook Form + Zod

## Fluxo de Domínio

- **Usuários:** registro, login, geração de JWT e autorização por papel.
- **Ativos:** cadastro, listagem paginada, atualização controlada por RBAC e vínculo de propriedade.
- **Chamados:** abertura, evolução de status com regra de transição e sistema de comentários protegido por autorização contextual.

## Como Executar Localmente

### 1) Instalação de dependências

```bash
# raiz (backend)
npm install

# frontend
cd helpdesk-ui
npm install
cd ..
```

### 2) Configuração de ambiente

```bash
# arquivo: .env (raiz)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB"
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="8h"
PORT="3000"

# arquivo: helpdesk-ui/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 3) Migração do banco

```bash
npx prisma migrate dev
```

### 4) Inicialização

```bash
# backend (porta 3000)
npx ts-node-dev --files src/server.ts

# frontend (porta 3001 com turbopack)
cd helpdesk-ui
npm run dev -- --turbopack
```

## Testes Automatizados

O repositório inclui uma **Postman Collection** com scripts automatizados para autenticação e **injeção dinâmica de token JWT**, acelerando validação de fluxo ponta a ponta em rotas protegidas.
