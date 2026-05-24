# TechNexus - Plataforma Corporativa de Gestão de Ativos de TI e Helpdesk

[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-Frontend-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-3NF-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![RBAC](https://img.shields.io/badge/Security-RBAC%20%2B%20JWT-0F172A)]()

TechNexus é uma plataforma full-stack para Helpdesk e Gestão Corporativa de Ativos de TI, organizada para entrega modular, segurança por perfil e evolução orientada a domínio.

## Arquitetura Full-Stack

### Backend Node.js
- Estrutura orientada por features em `src/features/`.
- Autenticação com JWT, RBAC e interceptadores centralizados.
- Controllers finos, services com regras de negócio e validação com Zod.

### Persistência PostgreSQL + Prisma
- Modelagem relacional em 3NF com entidades para usuários, ativos, chamados e comentários.
- Prisma como camada de acesso com schema versionado e migração inicial aplicada.
- Relacionamentos com integridade referencial e ações seguras de exclusão.

### Frontend Next.js
- Next.js 15+ com App Router, Server Components e Client Components.
- Shell protegido para dashboard e fluxo de login isolado.
- Cliente HTTP com interceptação automática do token JWT.

### Segurança e Governança
- RBAC com funções `ADMIN`, `TECH` e `EMPLOYEE`.
- Interceptação global de erros e tratamento de validação.
- `.gitignore` preparado para bloquear artefatos pesados e segredos.

## Estrutura de Alto Nível

```text
.
├─ src/                   # API Node.js / TypeScript
│  ├─ features/           # users, assets, tickets
│  ├─ middleware/         # auth, error handler
│  ├─ config/             # prisma singleton
│  └─ types/              # declaration merging e contratos
├─ helpdesk-ui/           # Frontend Next.js
│  ├─ src/app/            # App Router
│  ├─ src/components/     # UI, layouts e features
│  ├─ src/context/        # Auth context
│  └─ src/lib/            # Axios client e helpers
└─ prisma/                # schema e migrações
```

## Inicialização Local

### API
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd helpdesk-ui
npm install
npm run dev
```

## Variáveis de Ambiente

### API (`.env`)
```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB"
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="8h"
```

### Frontend (`helpdesk-ui/.env.local`)
```bash
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Fluxo de Domínio

- Usuários: registro, login e autenticação com JWT.
- Ativos: cadastro, listagem com paginação e atualização por perfil.
- Chamados: abertura, listagem, mudança de status e comentários.

## Observações

- O frontend foi estruturado para um layout protegido e navegação corporativa.
- A API segue separação por responsabilidades para facilitar manutenção e auditoria.
- A base está preparada para revisão técnica em entrevistas e milestones de portfólio.