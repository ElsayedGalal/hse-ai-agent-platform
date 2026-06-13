# منصة الرصد الذكي — HSE AI Agent

An Arabic RTL web application for AI-powered construction site safety compliance monitoring (HSE) targeting B2B construction companies in Saudi Arabia.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/hse-dashboard run dev` — run the HSE dashboard (assigned port)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Recharts, wouter
- Language: Arabic (RTL) with Cairo font from Google Fonts

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — DB schema: `sites.ts`, `violations.ts`, `recommendations.ts`
- `artifacts/api-server/src/routes/` — Express route handlers per domain
- `artifacts/hse-dashboard/src/` — React frontend (pages under `src/pages/`)

## Architecture decisions

- OpenAPI-first: all API types come from `lib/api-spec/openapi.yaml` → codegen → `@workspace/api-client-react` hooks
- Monitoring simulation: `POST /api/monitoring/start` randomly detects violations and inserts them to DB, updating site compliance rate
- Stats endpoints aggregate from DB in real-time (no caching layer needed for this scale)
- RTL layout enforced via `dir="rtl"` on root HTML element and CSS `direction: rtl`
- Arabic-only UI with Western numerals for financial/metric values (Saudi business standard)

## Product

- Dashboard: KPI cards (compliance rate, avoided fines, active tickets, resolution time), live monitoring feed with AI scanning animation, compliance history chart, violation breakdown chart, AI recommendations panel
- Tickets page: Full CRUD violation ticket management with resolve workflow
- Sites page: Construction site cards with compliance progress bars
- Reports page: Mock PDF compliance report download

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any `lib/api-spec/openapi.yaml` change, run `pnpm --filter @workspace/api-spec run codegen` before using updated types
- The monitoring endpoint is simulated (random AI detection) — not connected to real cameras
- Body schema names in OpenAPI must be entity-shaped (e.g. `ViolationInput`), not operation-shaped (`CreateViolationBody`), to avoid Orval TS2308 collision

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
