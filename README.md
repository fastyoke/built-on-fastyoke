# built-on-fastyoke

An open-source gallery of complex apps built on the FastYoke SDK. Everything runs
locally against a real FastYoke backend — **no cloud account**.

## Quick start
```bash
pnpm install
pnpm backend:up        # pulls ghcr.io/fastyoke/backend:sandbox and boots it (sandbox mode) on :8080
pnpm provision         # signs up a demo tenant + installs schemas/seed, writes .env.local
pnpm dev               # boots the app dev servers
```

The backend is the prebuilt, multi-arch **`ghcr.io/fastyoke/backend:sandbox`**
image (amd64 + arm64) — `docker compose up` pulls it, no local build required.

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

- **Runtime** — the apps run against the real FastYoke backend booted locally in
  sandbox mode (`docker compose up`), not a cloud tenant. `provision` self-serve-
  signs-up a demo tenant, installs each app's schema + seed (and uploads the Issue
  Board extension), and writes `.env.local` for the dev servers.
- **SDK dependency** — the published `@fastyoke/sdk` (0.3.0) doesn't declare a few
  transitive UI dependencies it imports (`reactflow`, `elkjs`), so each app lists
  them directly.
- **Out of scope (v1)** — line items + payments: the backend supports those only on
  its built-in `order`/`quote`/`pos_transaction` entities (a compile-time registry),
  so they aren't reachable for a bespoke `work_order`. A v2 could add Inventory/WMS
  with a cross-app bridge into Dispatch.
