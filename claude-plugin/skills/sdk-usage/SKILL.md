---
name: sdk-usage
description: Use when writing TypeScript against @fastyoke/sdk — triggering transitions, forms, or events.
---

# Using @fastyoke/sdk

`@fastyoke/sdk` is the TypeScript client for app code driving a FastYoke
runtime (local dev or deployed). Under the hood it talks to the same HTTP
job API the local runtime exposes: `POST /jobs`, `POST /jobs/:id/transition`
(`{ tenant_id, event_type }`), `GET /jobs/:id`, `GET /jobs/:id/history`,
authenticated with `Authorization: Bearer <token>` (the local runtime writes
this token to `.fastyoke/token` on boot).

## Client construction

```ts
import { readFileSync } from 'node:fs';
import { JobsClient } from '@fastyoke/sdk';

const token = readFileSync('.fastyoke/token', 'utf8').trim();

const jobs = new JobsClient({
  tenantId: 'local',
  baseUrl: process.env.FASTYOKE_URL ?? 'http://127.0.0.1:8787',
  fetcher: (input, init) =>
    fetch(input, {
      ...init,
      headers: { ...init?.headers, Authorization: `Bearer ${token}` },
    }),
});
```

## Triggering a transition

```ts
const updated = await jobs.transition(jobId, { eventType: 'approve' });
console.log(updated.current_state);
```

## Optimistic UI, then revert on `409`/`422`

Update local (e.g. Zustand) state immediately when the user fires a
transition. If the server rejects it, revert cleanly and show the error —
don't leave the UI in the optimistic state:

- **`409 Conflict`** — the job moved out from under the client (stale
  `current_state`); re-fetch and let the user retry.
- **`422 Unprocessable Entity`** — the transition's guard rejected the event
  (JSONLogic evaluated false, or routed to an unavailable WASM evaluator);
  the transition never happened server-side.

```ts
const previousState = job.current_state;
store.setState({ current_state: nextState }); // optimistic

try {
  const updated = await jobs.transition(jobId, { eventType });
  store.setState({ current_state: updated.current_state });
} catch (err) {
  store.setState({ current_state: previousState }); // revert
  if (err.status === 409) {
    showError('This job changed since you loaded it — refresh and retry.');
  } else if (err.status === 422) {
    showError('That action is not allowed right now.');
  } else {
    throw err;
  }
}
```

## History and events

```ts
const history = await jobs.history(jobId);
// [{ event_type, from_state, to_state, actor, reason, timestamp }, ...]
```

`history` reads the append-only `event_log` — treat every row as immutable;
never expect or attempt to edit a past entry.
