# Field Service

**Hero primitive:** a **signature-gated FSM transition** (21 CFR Part 11 e-sign).

A work-order app. Each work order runs a `work_order_lifecycle` workflow
(`Requested → Scheduled → OnSite → Completed → Closed`). The `sign_off` transition
(`OnSite → Completed`) is marked `requires_signature`: completing it opens an
electronic-signature modal (meaning + consent + password re-auth). The backend
verifies the password, enforces consent + a non-empty meaning, and seals a Part 11
record server-side. Ordinary steps use the normal transition path.

> Billing (line items / payments) is intentionally out of scope — the backend only
> supports those on its built-in `order`/`quote`/`pos_transaction` entities, not a
> bespoke `work_order`. See the gallery notes.

## Run
From the repo root: `pnpm backend:up && pnpm provision && pnpm --filter @gallery/field-service dev`.
Open http://localhost:5204. Sign off an On-Site work order using the demo password `DemoPassword123!`.
