# How Last-Mile Dispatch was built

1. **Declarative spec** — `fixtures/last-mile-dispatch/last-mile-dispatch.fy-app.json`:
   a `Delivery` entity and a five-state FSM whose transitions include two
   `from == to` **self-loops** (`check_in` on `EnRoute`, `reassign` on `Assigned`).
2. **Self-loops** — firing `check_in` goes through the normal transition path
   (`useTransitionJob`), but because `from == to` the state column doesn't move;
   the only artifact is a new `event_log` row. The detail page renders those from
   `useJobHistory` as the driver check-in feed (a self-loop is invisible if you
   watch `current_state` alone).
3. **Admin override** — the Override modal calls `useCancelJob` →
   `POST /api/v1/jobs/:id/cancel` with `{ target_state, reason }`. This writes the
   state directly, bypassing the transition engine and all guards, and logs an
   `__admin_cancel__` audit row. It is admin-role-gated; a non-admin JWT gets a 403
   surfaced in the modal.
4. **Map + realtime** — `MapPanel` plots deliveries on an SVG grid colored by state
   (`useEntities` joined with `useJobs`). Read hooks auto-subscribe to realtime, so
   the feed and board reflect transitions (including self-loop check-ins) live.
