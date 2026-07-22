# How Issue Board was built

1. **Declarative spec** — `fixtures/issue-board/issue-board.fy-app.json`: the
   `Issue` entity and a five-state board FSM (`Backlog → Todo → Doing → Review →
   Done`) with backward edges (`defer`, `block`, `reject`).
2. **The extension** — `extensions/kanban-block/` is a standalone FastYoke
   extension: `manifest.json` declares one `custom:kanban_board` block, and
   `src/index.tsx` is the board component. `build.mjs` (esbuild) compiles it to
   `dist/bundle.mjs` with `react`/`react-dom`/`@fastyoke/sdk` marked external, so
   the host serves the shared instances.
3. **Install** — `scripts/provision.mjs` uploads the manifest + bundle via
   multipart `POST /api/v1/tenant/extensions` using the human-login JWT (the
   endpoint rejects API tokens).
4. **Render** — `apps/issue-board` wraps `ExtensionProvider` and renders the block
   it finds at `componentsByBlockType.get('custom:kanban_board')`. The block does
   all data work through `useFastYoke()` (entities + jobs + schemas) and drives
   optimistic transitions on drop.
