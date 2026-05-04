# HR Management System — Architecture

## Overview

The HR Management System follows a strict **4-layer architecture** with complete separation of concerns.

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│  PRESENTATION LAYER (UI Components)          │  → /src/components, /src/app/(pages)
│  - React components (Server + Client)        │
│  - No business logic                         │
│  - Uses theme tokens only                    │
├─────────────────────────────────────────────┤
│  BRIDGE LAYER (Hooks & Controllers)          │  → /src/hooks, /src/controllers
│  - Hooks: Client-side orchestration          │
│  - Controllers: Server-side orchestration    │
│  - No raw business logic                     │
├─────────────────────────────────────────────┤
│  BUSINESS LOGIC LAYER (Services)             │  → /src/services
│  - All business rules live here              │
│  - Auth, permissions, workflows              │
│  - Never imports UI components               │
├─────────────────────────────────────────────┤
│  DATA LAYER (Repositories & Prisma)          │  → /src/repositories, /prisma
│  - Direct database access via Prisma         │
│  - No business logic                         │
│  - Only CRUD operations                      │
└─────────────────────────────────────────────┘
```

## Request Flow

```
Client → API Route → Controller → Service → Repository → Database
                         ↑
                    Security Layer
                  (auth, validation, RBAC)
```

## Security Architecture

All requests pass through:
1. **Next.js Middleware** — Cookie-based session check
2. **Auth Middleware** — JWT verification
3. **RBAC Guards** — Role and permission verification
4. **Input Validation** — Zod schema + sanitization
5. **Rate Limiting** — Request throttling

## Role Hierarchy

```
COMPANY_ADMIN (5) > HR_MANAGER (4) > HR_STAFF (3) > MANAGER (2) > EMPLOYEE (1)
```

## Tech Stack
- **Runtime:** Next.js 16 (App Router, Server Components)
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Auth:** JWT (jose) + HttpOnly cookies
- **Validation:** Zod
- **UI:** shadcn/ui + Tailwind CSS v4
- **State:** Zustand (global only)
