# How Field Service was built

1. **Declarative spec** — `fixtures/field-service/field-service.fy-app.json`: a
   `WorkOrder` entity and a five-state FSM.
2. **The signature gate** — `field-service.schemas.json` marks the `sign_off`
   transition `requires_signature: true`. That flag persists verbatim through
   `POST /api/v1/schemas` (schema-create stores `schema_json` unmodified).
3. **Signing** — ordinary transitions use `useTransitionJob`. The gated `sign_off`
   is driven by `SignOffModal`, which collects `{ password, meaning, consent }` and
   POSTs `{ tenant_id, event_type: 'sign_off', signature }` to
   `/api/v1/tenant/jobs/:id/transition`. The backend requires the signature for
   this transition, checks `consent` + a non-empty `meaning`, re-authenticates the
   password, and seals a 21 CFR Part 11 record. A wrong password returns 401,
   surfaced in the modal.
4. **Why hand-rolled** — the published `@fastyoke/sdk@0.3.0` exposes the e-sign
   flow through `WorkflowSection`, but not the standalone `SigningModal` /
   `useGatedTransition` primitives (unpublished 0.4.0). This app drives the
   verified transition contract directly, so it depends only on published APIs.
5. **Seeding** — the provision script can't fire a signed transition (it has no
   signature step), so work orders seed only up to `OnSite`; signing off is done
   in the UI.
