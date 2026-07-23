# MenuFlow

A multi-location **Square menu browser**. Pick a location, browse catalog items grouped by category, filter by category, and open an item to see its name, description, image, and correctly formatted price. All Square API calls go through a NestJS backend — the browser never sees a Square access token.

Built with **Next.js (App Router)** on the frontend and **NestJS** on the backend, in a single pnpm monorepo.

> Status: **feature complete**. Live: the location switcher (`GET /locations`, persisted selection), the location-aware grouped menu — `GET /catalog`, `GET /categories`, and `GET /items` (filterable by `locationId` + `categoryId`) resolve item visibility with Square's `present_at_all_locations` / `present_at_location_ids` / `absent_at_location_ids` rule and hide empty categories — a **category filter** to narrow the menu, an **item-detail page** (`GET /items/:id`) with image (or placeholder), description, variations, and price formatted via `Intl.NumberFormat`, and **explicit loading, empty, and error+retry states** on every data view.

---

## Prerequisites

- Node.js 22 LTS (see `.nvmrc`)
- pnpm 10+

## Running locally

```bash
pnpm install
cp .env.example server/.env     # fill in Square sandbox credentials
pnpm dev                        # generates API client, then runs client + server together
```

- Client: Next.js dev server on http://localhost:3000
- Server: NestJS API on http://localhost:3001 (health check at `/health`, API docs at `/docs`)

The server validates its environment on startup and **fails fast** if any Square variable is missing or malformed.

`pnpm dev` always regenerates the typed API client first (`server/openapi.json` + `client/lib/api/generated/` — both git-ignored) before starting the servers, so the client stays in sync with the backend contract automatically. The client's API base URL defaults to `http://localhost:3001` and can be overridden with `NEXT_PUBLIC_API_URL`.

## Scripts

Run from the repo root:

| Script              | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `pnpm dev`          | Regenerate API client, then run client + server together       |
| `pnpm build`        | Build both workspaces                                          |
| `pnpm lint`         | Lint both workspaces                                           |
| `pnpm test`         | Run all unit tests                                             |
| `pnpm api:generate` | Regenerate OpenAPI spec + typed client (run by `dev` already) |
| `pnpm format`       | Prettier write across the repo                                 |

## Testing

Two tiers only — **unit** and **end-to-end** (no integration tier).

| Command         | What it runs                                                                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`     | Unit tests across both workspaces — backend Jest + frontend Vitest. Passes from a clean checkout: no Square credentials, no running servers.        |
| `pnpm test:e2e` | Backend end-to-end (NestJS booted, exercised with Supertest). Square is **mocked at the `SquareService` boundary** — the live sandbox is never hit. |

**Frontend e2e (Playwright) is a local development aid only** — no CI, no production runs. It boots the real client + server, so it needs `server/.env` (Square sandbox creds). One-time browser install, then run from `client/`:

```bash
pnpm --filter @menuflow/client exec playwright install
pnpm --filter @menuflow/client test:e2e        # or test:e2e:ui
```

Reports and artifacts (`playwright-report/`, `test-results/`) are git-ignored.

## Square sandbox setup

1. Create a free Square developer account → https://developer.squareup.com
2. Create an application, open its **Credentials** page, and make sure the **Sandbox** toggle (top of the page) is selected — then copy the **Sandbox access token**. Square credentials are environment-specific: a Production token against the sandbox base URL fails with `UNAUTHORIZED`.
3. Put the token in `server/.env` (see `.env.example`). **Sandbox only — never a real merchant's production data.**

> **About the base URL:** `https://connect.squareupsandbox.com` is Square's sandbox **API host**, not a website — opening it in a browser shows a 404 by design. The API lives under `/v2/*` (e.g. `GET /v2/locations`) and requires a bearer token; the backend's Square SDK client targets this host, which is exactly the SDK's own `SquareEnvironment.Sandbox` value.

4. Seed data — either run the bundled seeder against a fresh sandbox:

   ```bash
   pnpm --filter @menuflow/server seed:square
   ```

   It provisions the full target data set — a second location (**Uptown**), **4 categories**, and **8 priced items**, including one item absent at Uptown and one exclusive to it (proving the location filter both ways) — and safely refuses to run if a second location or catalog items already exist. Or seed manually in the Square dashboard: aim for **2 locations**, **3–4 categories**, **6–10 items**, with **at least one item available at only one of the two locations**. For the time/day bonus, set up at least one category with limited hours.

5. Confirm the wiring end-to-end (fetches locations + catalog from your sandbox):

   ```bash
   pnpm --filter @menuflow/server smoke:square
   ```

   It prints your location and item/category counts, or a clear error if credentials are wrong.

## Environment variables

`.env.example` documents everything required; secrets are never committed. Expected keys:

| Key                   | Purpose                             |
| --------------------- | ----------------------------------- |
| `SQUARE_ACCESS_TOKEN` | Sandbox access token (backend only) |
| `SQUARE_ENV`          | `sandbox`                           |
| `SQUARE_BASE_URL`     | Square sandbox base URL             |
| `PORT`                | Backend port                        |
| `CLIENT_ORIGIN`       | Allowed CORS origin                 |

---

## Architecture & key decisions

- **Backend as a proxy + normalization layer.** Every Square call goes through the NestJS API; the browser never sees the Square token, and Square's loosely-typed shapes are normalized into our own typed response DTOs at the service boundary. Trade-off: one extra hop, in exchange for a secure token boundary and a single stable contract the client can trust.
- **Strict layering with one Square touchpoint.** `Controller → Service → SquareService`; only `SquareService` talks to Square (SDK client injected via DI). That seam is what lets every test mock Square instead of hitting the sandbox.
- **In-memory TTL cache instead of a database.** The scope is read-only browsing, so catalog/locations are cached for 60s in-process — location switching and category filtering never re-hit Square inside the window. Trade-off: process-local and best-effort (a miss just refetches); a DB/Redis would be over-engineering here.
- **Availability computed server-side, in one place.** An item is visible at location `L` iff `(present_at_all_locations OR L ∈ present_at_location_ids) AND L ∉ absent_at_location_ids` — `absent` always wins. The grouped menu, category list, and flat item list are all projections of the same builder, so the three endpoints can never disagree.
- **Money is never string-math.** Square's integer minor units + currency ride the wire untouched; the client is the only place prices become display strings (`Intl.NumberFormat`, respecting each currency's own fraction digits — so USD `500` → `$5.00` and JPY `500` → `¥500` both come out right).
- **Generated API client.** The backend's Swagger spec generates typed React Query hooks (orval); a changed DTO breaks the client's typecheck instead of silently drifting. Trade-off: a regeneration step (`pnpm api:generate`) after contract changes.
- **Two-tier testing.** Unit tests for the business rules and utilities; e2e that boots the real NestJS app with Square mocked at the `SquareService` boundary; Playwright journeys as a local development aid. A few well-chosen tests over exhaustive coverage.

## What I'd build next

> _Given another week, roughly in priority order:_ **time-of-day / day-of-week availability** (per-location timezone-aware filtering of out-of-window items), modifiers on the item detail view, full-text search across the visible menu, a cart with subtotal, inventory/out-of-stock surfacing, offline-friendly catalog caching.
