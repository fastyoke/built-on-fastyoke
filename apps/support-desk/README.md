# Support Desk

**Hero primitive:** FSM guards + realtime + a public intake form (form/realtime
land in the follow-on plan; this skeleton covers entities + FSM transitions).

A helpdesk ticket queue. Tickets are entities; each ticket has a `ticket_lifecycle`
workflow job that walks `New → Triaged → InProgress → Waiting → Resolved → Closed`.
The `resolve` transition is guarded on a resolution note (JsonLogic
`{ "!!": [{ "var": "resolution" }] }`).

## Run
From the repo root: `pnpm backend:up && pnpm provision && pnpm --filter @gallery/support-desk dev`
Then open http://localhost:5201.
