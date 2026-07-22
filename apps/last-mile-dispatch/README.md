# Last-Mile Dispatch

**Hero primitive:** FSM depth — **self-loop transitions** and the **admin cancel override**.

A delivery-operations board. Each delivery runs a `delivery_lifecycle` workflow
(`Created → Assigned → PickedUp → EnRoute → Delivered`) with two `from == to`
self-loop edges: `check_in` (a driver ping that appends an audit event without
changing state) and `reassign`. An **Override** action forces a delivery to any
state via `POST /jobs/:id/cancel`, bypassing guards (admin-gated). A dependency-free
SVG map recolors deliveries as they transition.

## Run
From the repo root: `pnpm backend:up && pnpm provision && pnpm --filter @gallery/last-mile-dispatch dev`.
Open http://localhost:5203.
