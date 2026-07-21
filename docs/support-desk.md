# How Support Desk was built

1. **Declarative spec** — `fixtures/support-desk/support-desk.fy-app.json` defines
   the `Ticket` entity (fields) and its FSM. This is the artifact you'd hand
   `fy app create`.
2. **Executable workflow** — `support-desk.schemas.json` is the backend-shape
   schema (`event_type` + JsonLogic guards) that `scripts/provision.mjs` POSTs to
   `/api/v1/schemas`. The `resolve` edge is guarded on a resolution note.
3. **Seed** — `support-desk.seed.json` lists ticket records and the jobs to spawn,
   each advanced to a starting state by the provision script.
4. **UI** — `apps/support-desk/src` consumes `@fastyoke/sdk`: `useEntities` /
   `useCreateEntity` for the queue, `useJobs` + `useTransitionJob` +
   `FsmTimeline` for the lifecycle.
