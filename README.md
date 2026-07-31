# built-on-fastyoke

An open-source gallery of complex apps built on the FastYoke SDK. By default
everything runs locally against a real FastYoke backend — **no cloud account
required** — but the same app code runs unchanged against a
[cloud-hosted instance](#point-at-a-cloud-hosted-fastyoke) by pointing at a
different URL.

## Quick start
```bash
pnpm install
pnpm backend:up        # pulls ghcr.io/fastyoke/backend:sandbox and boots it (sandbox mode) on :8080
pnpm provision         # signs up a demo tenant + installs schemas/seed, writes .env.local
pnpm dev               # boots the app dev servers
```

The backend is the prebuilt, multi-arch **`ghcr.io/fastyoke/backend:sandbox`**
image (amd64 + arm64) — `docker compose up` pulls it, no local build required.

## Point at a cloud-hosted FastYoke

Nothing in these apps is tied to the local backend. Each app reads exactly three
env vars from a root `.env.local`, so repointing at a hosted FastYoke — the
[managed cloud](https://www.fastyoke.io/pricing) or your own On-Prem deployment —
is just a matter of aiming those at a different base URL:

```dotenv
# .env.local
VITE_FASTYOKE_API_URL=https://app.fastyoke.io   # your hosted instance's base URL
VITE_FASTYOKE_TENANT_ID=<your-tenant-id>
VITE_FASTYOKE_TOKEN=<a-bearer-token-for-that-tenant>
```

There's no local backend in this mode, so **skip `pnpm backend:up`**. Two ways to
get there:

**A. Provision into your hosted tenant** — installs each app's schema + seed (and
uploads the Issue Board extension) into your cloud tenant, then writes `.env.local`
for you:

```bash
pnpm install
FASTYOKE_API_URL=https://app.fastyoke.io \
  FY_EMAIL=you@example.com FY_PASSWORD='…' FY_ORG='My Org' \
  pnpm provision
pnpm dev
```

`provision` signs in (or signs up on first run) with those credentials and targets
`FASTYOKE_API_URL` instead of the local backend.

**B. Bring your own tenant** — if the schemas are already installed on your
instance and you have a token (e.g. a `fy_pat_…` API token from the FastYoke admin
UI), just write the three vars into `.env.local` yourself and run `pnpm dev` — no
`backend:up`, no `provision`.

> Same schemas, same SDK, same app code — only `VITE_FASTYOKE_API_URL` changes
> between local sandbox, managed cloud, and On-Prem.

## Apps
| App | Port | Hero primitive | Status |
|-----|------|----------------|--------|
| [Support Desk](apps/support-desk) | 5201 | FSM guards · forms · realtime | skeleton |
| [Issue Board](apps/issue-board) | 5202 | authored custom:* extension block | built |
| [Last-Mile Dispatch](apps/last-mile-dispatch) | 5203 | FSM depth (self-loops, admin cancel) | built |
| [Field Service](apps/field-service) | 5204 | e-signature · gated transition (Part 11) | built |

## How each app is built

Each app ships a **recipe**: `fixtures/<app>/*.fy-app.json` (declarative spec),
`*.schemas.json` (executable workflow), `*.seed.json` (demo data), plus a
walkthrough and an app README.

| App | Hero primitive | How it was built | README |
|-----|----------------|------------------|--------|
| Support Desk | ticket FSM + timeline (forms/realtime pending) | [docs/support-desk.md](docs/support-desk.md) | [readme](apps/support-desk/README.md) |
| Issue Board | authored `custom:kanban_board` **extension** loaded via `ExtensionRegistry`; drag = optimistic transition | [docs/issue-board.md](docs/issue-board.md) | [readme](apps/issue-board/README.md) |
| Last-Mile Dispatch | **FSM depth** — `from == to` self-loops + admin cancel override + SVG map | [docs/last-mile-dispatch.md](docs/last-mile-dispatch.md) | [readme](apps/last-mile-dispatch/README.md) |
| Field Service | **21 CFR Part 11 e-signature** gated transition (sign-off) | [docs/field-service.md](docs/field-service.md) | [readme](apps/field-service/README.md) |

## Design notes

- **Runtime** — by default the apps run against the real FastYoke backend booted
  locally in sandbox mode (`docker compose up`); `provision` self-serve-signs-up a
  demo tenant, installs each app's schema + seed (and uploads the Issue Board
  extension), and writes `.env.local` for the dev servers. The same apps run
  against a hosted instance too — see
  [Point at a cloud-hosted FastYoke](#point-at-a-cloud-hosted-fastyoke).
- **SDK dependency** — the published `@fastyoke/sdk` (0.3.0) doesn't declare a few
  transitive UI dependencies it imports (`reactflow`, `elkjs`), so each app lists
  them directly.
- **Out of scope (v1)** — line items + payments: the backend supports those only on
  its built-in `order`/`quote`/`pos_transaction` entities (a compile-time registry),
  so they aren't reachable for a bespoke `work_order`. A v2 could add Inventory/WMS
  with a cross-app bridge into Dispatch.
