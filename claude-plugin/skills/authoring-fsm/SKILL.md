---
name: authoring-fsm
description: Use when creating or editing a FastYoke FSM schema — states, transitions, JSONLogic guards, or self-loops.
---

# Authoring a FastYoke FSM schema

A FastYoke FSM schema is `{ name, initial_state, states, transitions }`, where each
transition is `{ event, from, to, guard? }`. Follow these rules exactly:

- **Guards are JSONLogic objects, never raw strings.** A guard is evaluated
  against the job's flat `data_payload` — write `{"var":"role"}`, not
  `{"var":"payload.role"}` (there is no `payload.` prefix; the guard sees the
  entity's data fields directly at the top level). A transition with no guard
  always passes. Do not hand-roll a string expression parser or eval a
  condition as text — the runtime rejects string guards and only understands
  JSONLogic.
- **Cancellation is an out-of-band admin override, never a `Cancelled` state
  or transition.** Do not add a `"cancelled"`/`"canceled"` state to `states`
  or wire a transition that targets it. Cancellation goes through
  `POST /api/v1/tenant/jobs/:id/cancel` (admin-role only), which writes
  `current_state` directly and appends an `event_log` row with
  `event_type = "__admin_cancel__"`, bypassing the transition engine and every
  guard entirely. If a request says "add a cancelled state," redirect it to
  the admin override instead.
- **Self-loops (`from == to`) are legitimate but MUST be guard-bounded, and
  each firing appends to the append-only `event_log`.** A self-loop is the
  right tool for audit-only events, idempotent retries, or payload counters —
  but every unguarded self-loop is a bug: it can fire without limit,
  appending rows forever. Always give a self-loop a guard that bounds it
  (e.g. `{"<":[{"var":"notes"},5]}` caps a counter-style field at 5).
- **`event_log` and `fsm_schemas` are append-only.** Never write an `UPDATE`
  or `DELETE` against either table, in a migration or otherwise.

## Example: 4-state schema with a guard and a bounded self-loop

```json
{
  "name": "vacation-approval",
  "initial_state": "requested",
  "states": ["requested", "in_review", "approved", "denied"],
  "transitions": [
    { "event": "submit", "from": "requested", "to": "in_review" },
    { "event": "approve", "from": "in_review", "to": "approved", "guard": { "==": [{ "var": "role" }, "manager"] } },
    { "event": "deny", "from": "in_review", "to": "denied" },
    { "event": "note", "from": "in_review", "to": "in_review", "guard": { "<": [{ "var": "notes" }, 5] } }
  ]
}
```

`submit` and `deny` are unguarded forward edges. `approve` is a guarded
forward edge (checks `role` on the linked entity's `data_payload`). `note` is
a bounded self-loop (`in_review -> in_review`) that stops firing once
`notes` reaches 5.

## After every edit: validate

Run the plugin's validator against the schema file:

```sh
node <plugin-dir>/scripts/fy-validate.mjs path/to/fsm.schema.json
```

It flags: unknown transition targets, a state used as `Cancelled`, unbounded
self-loops, string (non-JSONLogic) guards, and unreachable states. Fix every
reported error before considering the schema done.
