# MenuFlow — Engineering Guide

**What this is:** a multi-location Square menu browser (Next.js + NestJS). All Square calls go through the backend; the client never sees the Square token. No database, no auth, no payments, no background jobs — do not add them.

---

## Tech Stack

| Area | Choice |
|---|---|
| Monorepo | pnpm workspace — `client/` + `server/` |
| Runtime | Node.js 22 LTS |
| Frontend | Next.js (App Router), React, TypeScript (strict) |
| UI | shadcn/ui + Tailwind CSS; icons `lucide-react` |
| Server state | TanStack Query |
| HTTP (client → backend) | Axios via the generated fetcher |
| Forms/validation | Zod (+ react-hook-form where a form exists) |
| Backend | NestJS, TypeScript (strict) |
| Validation (backend) | class-validator + class-transformer |
| Square access | Square Node SDK inside `SquareService` |
| Config | `@nestjs/config` + startup env validation (fail-fast) |
| Caching | in-memory TTL cache in the service layer (no DB) |
| API client | Swagger → orval-generated typed hooks |
| Tests | Jest (backend unit/e2e), Vitest + Testing Library (frontend unit), Playwright (frontend e2e, local only) |

### Project structure

```
MenuFlow/
├── client/                     # Next.js (App Router)
│   ├── app/                    # routes (menu browser, item detail)
│   ├── components/{ui,features}/
│   ├── hooks/                  # custom React hooks
│   ├── lib/api/generated/      # orval output (git-ignored, regenerated)
│   ├── providers/              # query provider, location provider
│   ├── types/  constants/  utils/
├── server/                     # NestJS
│   └── src/
│       ├── modules/{locations,catalog}/  # controller → service
│       ├── square/             # SquareService — sole Square touchpoint + cache
│       ├── common/             # errors, global filter, interfaces
│       ├── config/             # env validation
│       └── dto/                # request + response DTOs
├── .env.example
└── CLAUDE.md                   # this file — authoritative
```

---

## Git & Commits

- Feature branches → PR against `main`.
- Commit messages: single lowercase subject line, `type(scope): description` (e.g. `feat(catalog): filter items by location`). No body, no attribution trailers, no issue identifiers.

---

## Documentation

### `README.md` — shipped
Update it when a change touches installation steps, scripts, env vars, project structure, or user-visible functionality. Keep it concise — no implementation detail or internal decisions.

### Architecture doc — local only
Single home for implementation decisions, trade-offs, and post-implementation journal entries. Never create additional doc files for this. Append a journal entry per completed feature; don't edit the pre-implementation design above the journal divider.

> No feature is done until README and/or the architecture doc are updated as needed.

---

## TypeScript

Strict mode throughout. For Square's loosely-typed SDK responses, narrow with type guards (`function isX(v: unknown): v is X`) rather than casting. Model state variants as discriminated unions. No `any`, no `@ts-ignore`, no non-null assertions.

---

## File Organization

- One exported symbol per file. Exceptions: Next.js page/layout defaults; DTO files with nested types; a React Context provider co-located with its companion `useX` hook; barrel index files.
- Constants → `*.constants.ts`, enums → `*.enum.ts`, types → `*.types.ts`, Zod schemas → `*.schema.ts`. Never declare exported constants inline in logic files.
- Component prop types stay in the same file as the component.
- Named exports everywhere except framework-required defaults.
- Split by responsibility past ~400 lines.

| Kind | Pattern |
|---|---|
| Component | `kebab-case.tsx` |
| Service / Controller / Module | `name.service.ts` / `name.controller.ts` / `name.module.ts` |
| DTO | `create-name.dto.ts`, `name-response.dto.ts` |
| Enum / Types / Constants / Util | `name.enum.ts` / `name.types.ts` / `name.constants.ts` / `name.util.ts` |

Imports: relative within a module, path alias across modules.

**Shared definitions:** anything referenced by more than one file gets extracted — domain models → `*.types.ts`, request/response contracts → DTO files. Two definitions of the same shape are a bug waiting to diverge.

---

## Backend Patterns (NestJS)

**Layering:** `Controller → Service → SquareService → Square`. Controllers are thin — extract input, validate via DTOs, return a DTO, no business logic, no try/catch. Services own business rules and map Square models to response DTOs. `SquareService` is the sole Square touchpoint.

### Square integration
- `SquareService` wraps the SDK, handles pagination cursors, rate limits, and the TTL cache.
- **Availability rule:** item visible at location `L` iff `(present_at_all_locations OR L ∈ present_at_location_ids) AND L ∉ absent_at_location_ids`. `absent` always wins.
- **Money:** carry `{ amount, currency }` (Square's integer minor units) through the service layer; format on the client with `Intl.NumberFormat`. Never do arithmetic on display strings.

### Caching
In-memory TTL cache (60 s) in `SquareService`. Process-local, best-effort — a miss refetches. No DB, no Redis.

### Errors
Typed hierarchy (`Client*Error`); global exception filter formats a consistent envelope. Log unexpected/infra errors (Square failures, rate limits) with structured context (`{ locationId, itemId, error }`). Don't log expected client errors.

### Validation
`ValidationPipe` with `whitelist + forbidNonWhitelisted + transform`. Separate request DTOs (validated input) from response DTOs (client contract).

---

## API Design

RESTful: `GET /locations`, `GET /catalog`, `GET /categories`, `GET /items` (filterable by `locationId`/`categoryId`), `GET /items/:id`. Swagger decorators on every endpoint — the spec drives the generated client.

### Generated client (orval)
Swagger spec → typed React Query hooks under `client/lib/api/generated/` (git-ignored). Never hand-write API calls or edit generated files. After changing a controller/DTO, re-run `pnpm api:generate`; drift is caught by typecheck.

---

## Frontend Patterns

- Server Components by default; `"use client"` only when needed.
- Server state → TanStack Query. UI state (location selection, filters) → local state/context. Don't mix.
- Data flows through generated hooks → adapters in `client/lib/<feature>/` → components. Components never hardcode URLs or call fetch/Axios directly.
- Location switcher persists selection and re-keys queries so switching triggers a fresh availability-filtered fetch.
- Every data view has explicit loading, empty, and error+retry states.
- shadcn/ui + Tailwind. Mobile-first, WCAG 2.1 AA (≥4.5:1 text contrast). No inline styles.

---

## Testing

Two tiers — unit and e2e. No integration tier. Tests pass from a clean checkout.

**Unit:** backend Jest (availability filter, price formatting, category grouping); frontend Vitest + Testing Library (utils, components in isolation). No network calls, no assertions on generated code.

**Backend e2e:** boots the NestJS app, exercises real endpoints, Square mocked at `SquareService`. Never hits the live sandbox.

**Frontend e2e (Playwright, local only):** primary user journeys — location switching, menu filtering, item detail, loading/error states. Local verification aid; no CI requirement.

Tests change with behavior — every new feature or bug fix ships with appropriate test coverage.

---

## Design Principles

- **DRY** — one authoritative home per concept. Before writing logic, check for an existing util/hook/service/DTO. Third duplicate is a hard stop; often the second.
- **SRP** — controllers route, services contain business rules, `SquareService` owns Square, components render.
- **OCP** — discriminated unions over switch-ladders; new cases are additive.
- **ISP** — small focused DTOs/interfaces/props; no god-objects.
- **DIP** — constructor injection via Nest DI. Config through `ConfigService`, not `process.env` directly.

---

## Security

- Env vars validated at startup; fail fast on missing or malformed values.
- All Square calls go through the backend. The client never sees the Square token. Sandbox only.
- No user-controlled outbound URLs — the backend calls only Square's known base URL.
