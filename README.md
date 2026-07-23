# MenuFlow

A multi-location **Square menu browser**. Pick a location, browse catalog items grouped by category, filter by category, and open an item to see its name, description, image, and correctly formatted price. All Square API calls go through a NestJS backend — the browser never sees a Square access token.

Built with **Next.js (App Router)** on the frontend and **NestJS** on the backend, in a single pnpm monorepo.

> Status: **foundation/setup**. Application code lands in later phases.

---

## Running locally
> _To be completed. Expected shape:_

```bash
pnpm install
cp .env.example server/.env     # fill in Square sandbox credentials
pnpm dev                        # runs client + server together
```

- Client: Next.js dev server.
- Server: NestJS API proxying Square.

## Square sandbox setup
> _To be completed alongside the backend integration._

1. Create a free Square developer account → https://developer.squareup.com
2. Create a **sandbox application**; copy the **sandbox access token** and base URL.
3. Put them in `server/.env` (see `.env.example`). **Sandbox only — never a real merchant's production data.**
4. Seed data (Square's seed or your own): aim for **2 locations**, **3–4 categories**, **6–10 items**, with **at least one item available at only one of the two locations** (to prove the location filter). For the time/day bonus, set up at least one category with limited hours.

## Environment variables
`.env.example` documents everything required; secrets are never committed. Expected keys:

| Key | Purpose |
|---|---|
| `SQUARE_ACCESS_TOKEN` | Sandbox access token (backend only) |
| `SQUARE_ENV` | `sandbox` |
| `SQUARE_BASE_URL` | Square sandbox base URL |
| `PORT` | Backend port |
| `CLIENT_ORIGIN` | Allowed CORS origin |

---

## Roadmap
> _Candidate directions, to be prioritized as the project progresses:_ time-of-day/day-of-week availability, modifiers, search, cart with subtotal, inventory/out-of-stock, offline caching.
