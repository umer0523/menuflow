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
pnpm api:generate               # emit the OpenAPI spec + typed client (no creds needed)
pnpm dev                        # runs client + server together
```

- Client: Next.js dev server on http://localhost:3000
- Server: NestJS API on http://localhost:3001 (health check at `/health`, API docs at `/docs`)

The server validates its environment on startup and **fails fast** if any Square variable is missing or malformed.

`pnpm api:generate` builds the backend OpenAPI spec (`server/openapi.json`) and regenerates the typed client under `client/lib/api/generated/` (both git-ignored). Re-run it whenever a controller or DTO changes. The client's API base URL defaults to `http://localhost:3001` and can be overridden with `NEXT_PUBLIC_API_URL`.

## Scripts

Run from the repo root:

| Script              | Purpose                                |
| ------------------- | -------------------------------------- |
| `pnpm dev`          | Run client + server together           |
| `pnpm build`        | Build both workspaces                  |
| `pnpm lint`         | Lint both workspaces                   |
| `pnpm test`         | Run all unit tests                     |
| `pnpm api:generate` | Regenerate OpenAPI spec + typed client |
| `pnpm format`       | Prettier write across the repo         |

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
2. Create a **sandbox application**; copy the **sandbox access token** and base URL.
3. Put them in `server/.env` (see `.env.example`). **Sandbox only — never a real merchant's production data.**
4. Seed data (Square's seed or your own): aim for **2 locations**, **3–4 categories**, **6–10 items**, with **at least one item available at only one of the two locations** (to prove the location filter). For the time/day bonus, set up at least one category with limited hours.
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

## Roadmap

> _Candidate directions, to be prioritized as the project progresses:_ time-of-day/day-of-week availability, modifiers, search, cart with subtotal, inventory/out-of-stock, offline caching.
