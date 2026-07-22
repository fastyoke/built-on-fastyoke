# built-on-fastyoke

An open-source gallery of complex apps built on the FastYoke SDK. Everything runs
locally against a real FastYoke backend — **no cloud account**.

## Quick start
```bash
docker build -t fastyoke/backend:local .   # once, from the FastYoke backend repo (or pull the published image)
pnpm install
pnpm backend:up        # boots the backend (sandbox mode) on :8080
pnpm provision         # signs up a demo tenant + installs schemas/seed, writes .env.local
pnpm dev               # boots the app dev servers
```

## Apps
| App | Port | Hero primitive | Status |
|-----|------|----------------|--------|
| [Support Desk](apps/support-desk) | 5201 | FSM guards · forms · realtime | skeleton |
| [Issue Board](apps/issue-board) | 5202 | authored custom:* extension block | built |
| [Last-Mile Dispatch](apps/last-mile-dispatch) | 5203 | FSM depth (self-loops, admin cancel) | built |
| Field Service | 5204 | PDF forms · e-sign · line items | planned |

## How each app is built
Each app ships a recipe: `fixtures/<app>/*.fy-app.json` (declarative spec),
`*.schemas.json` (executable workflow), `*.seed.json` (demo data), and a
walkthrough in `docs/<app>.md`.

## Note on the SDK dependency
The published `@fastyoke/sdk` (0.3.0) does not declare a few transitive UI
dependencies it imports (`reactflow`, `elkjs`), so each app lists them directly.
