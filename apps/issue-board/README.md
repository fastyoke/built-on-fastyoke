# Issue Board

**Hero primitive:** an authored FastYoke **extension** (`custom:kanban_board`).

A Linear/Trello-style board. The kanban UI is a real extension bundle
(`extensions/kanban-block`) installed into the tenant and loaded through the SDK's
`ExtensionRegistry` — not a component baked into the app. Dragging a card between
columns fires an **optimistic FSM transition** on that issue's workflow job and
reverts if the backend rejects the move (illegal edges are ignored).

## Run
From the repo root: `pnpm build` (emits the extension bundle) →
`pnpm backend:up && pnpm provision` (installs the schema + uploads the extension)
→ `pnpm --filter @gallery/issue-board dev`. Open http://localhost:5202.
