---
description: "Scaffold a FastYoke app from a one-line description, run it locally, and verify a first transition."
---

# /fy-new-app

Scaffold a new FastYoke app end to end: ask what it does, generate the entity
and workflow, validate and review it, run it locally, and prove a real state
transition happened. Never declare success without evidence from the running
app.

Work through the following steps in order. Do not skip a step or reorder it —
each one gates the next.

## 1. Ask what the app does

Ask the user a single question: **"What's your app? One line is fine — what
does it track, and who acts on it?"**

From the answer, derive:
- an **entity name** (PascalCase singular, e.g. `VacationRequest`,
  `PurchaseOrder`, `SupportTicket`)
- **3–5 lifecycle states** the entity moves through (e.g.
  `requested -> in_review -> approved` / `denied`)
- the **fields** the entity needs to carry (`{ key, type }` pairs), including
  whatever field a guard will check (e.g. a `role` string or a numeric
  counter)

Do not invent a `Cancelled` state — see the guard rule below.

## 2. Scaffold from the template

Copy `templates/vacation-approval/` into the user's project (suggest a
destination directory named after the app, e.g. `./<app-name>/`) and adapt
every file to the new entity:

- `fsm.schema.json` — rename `name`, replace `states`/`initial_state`,
  rewrite `transitions` for the new lifecycle.
- `fy-app.json` — rename the entity, replace `fields`, mirror the same `fsm`
  block as `fsm.schema.json`.
- `seed.json` — replace `entity_kinds[0].schema.fields`, replace the seeded
  `entity_records` row's `data_payload` with values for the new fields (make
  sure any guard-checked field, e.g. `role`, is seeded with a value that lets
  the first guarded transition succeed), replace `fsm_schemas[0].schema_json`
  with the new schema, and update `jobs[0]` to reference the new schema id
  and record id.
- `example.ts` — update the entity/job comments and the two transition event
  names to match the new lifecycle; keep the token-read and client-call
  shape as-is.

Before writing the FSM, invoke the **`authoring-fsm`** skill for the guard
and self-loop rules (guards are flat JSONLogic — `{"var":"role"}`, never
`{"var":"payload.role"}`; no `Cancelled` state or transition, ever — model
cancellation only via the admin override; any self-loop must be guard-
bounded).

Before writing the entity fields, invoke the **`authoring-entities-ui`**
skill (the UI is generated from `{key, type}` field schema — don't hand-roll
form fields; write a matching zod schema mirroring the entity for
client-side validation).

## 3. Validate the schema

Run the plugin's validator against the new `fsm.schema.json`:

```sh
node <plugin-dir>/scripts/fy-validate.mjs <path-to-fsm.schema.json>
```

If it reports any error (`unknown-target`, `cancelled-state`,
`unbounded-self-loop`, `raw-guard`, `unreachable-state`), fix the schema and
re-run the validator. Do not proceed to step 4 until it passes clean.

## 4. Dispatch the reviewer

Dispatch the **`fy-app-reviewer`** subagent (by name) to review the
scaffolded app (the adapted `fsm.schema.json`, `fy-app.json`, `seed.json`,
and entity/zod pairing). Address every finding it raises before continuing.
If the subagent isn't available in this installation, say so plainly and
continue with steps 5–6 using your own judgment, noting the skipped review
in the final summary.

## 5. Install the seed and start the runtime

There is no `fastyoke app install` verb — the app is installed by writing
its seed data into `.fastyoke/seed.json`, the same shape demonstrated by
`templates/vacation-approval/seed.json` (`entity_kinds`, `fsm_schemas`,
`jobs`). Merge (or write, on a fresh project) the adapted `seed.json` into
`.fastyoke/seed.json`.

Then, in the user's project directory:

1. Make sure `fastyoke` is a project dependency (add it if missing).
2. `npx fastyoke init` — scaffolds `.fastyoke/` if it doesn't already exist,
   including the bearer token at `.fastyoke/token`. `applySeed` is additive
   (`INSERT OR IGNORE`): if this app id was already installed in a prior run
   of this command, run `npx fastyoke reset -y` first, then re-init, so the
   fresh seed actually lands.
3. `npx fastyoke dev --port 8787` — start it backgrounded (this command
   keeps running); wait for the printed
   `[fastyoke] ready on http://127.0.0.1:8787` line before continuing.

## 6. Trigger the first transition and verify

Using the job id from the seeded `jobs[0].id`, and
`Authorization: Bearer $(cat .fastyoke/token)`:

```sh
# forward-progress transition (matches your first unguarded event, e.g. "submit")
curl -sX POST http://127.0.0.1:8787/api/v1/tenant/jobs/<job_id>/transition \
  -H "Authorization: Bearer $(cat .fastyoke/token)" \
  -H 'content-type: application/json' \
  -d '{"tenant_id":"local","event_type":"<first-event>"}'

# guarded transition (e.g. "approve" — requires the seeded payload to satisfy the guard)
curl -sX POST http://127.0.0.1:8787/api/v1/tenant/jobs/<job_id>/transition \
  -H "Authorization: Bearer $(cat .fastyoke/token)" \
  -H 'content-type: application/json' \
  -d '{"tenant_id":"local","event_type":"<guarded-event>"}'

# read back state
curl -s "http://127.0.0.1:8787/api/v1/tenant/jobs/<job_id>?tenant_id=local" \
  -H "Authorization: Bearer $(cat .fastyoke/token)"

# read back history
curl -s "http://127.0.0.1:8787/api/v1/tenant/jobs/<job_id>/history?tenant_id=local" \
  -H "Authorization: Bearer $(cat .fastyoke/token)"
```

**Declare success only if both are true:**
- `current_state` in the state read changed from the job's original seeded
  state, and
- the history read shows a new `event_log` row for each transition fired.

If either curl call returns a non-2xx status, or `current_state` didn't
move, or no new history row appeared — **report the exact failure** (status
code, response body, which check didn't hold). Never claim the transition
worked without this evidence in hand.

On success, show the user:
- the preview URL (`http://127.0.0.1:8787`)
- the adapted `example.ts`, updated to run the same flow via `@fastyoke/sdk`
  (`npx tsx example.ts`)

## 7. Hand off

Summarize what was scaffolded (entity, states, guarded transitions) and
where the files live. Point the user at the **`authoring-fsm`** skill for
further workflow edits and the **`authoring-entities-ui`** skill for further
field/UI changes.
