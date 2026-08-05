/**
 * Minimal @fastyoke/sdk snippet for the vacation-approval reference app.
 *
 * Drives the seeded job (job-vac_1, seed.json) through:
 *   requested --submit--> in_review --approve--> approved
 *
 * Talks to the local runtime booted by `npx fastyoke dev` (default
 * http://127.0.0.1:8787), authenticated with the token that `fastyoke dev`
 * writes to `.fastyoke/token` on boot.
 *
 * Run with: npx tsx example.ts
 */
import { readFileSync } from 'node:fs';
import { JobsClient } from '@fastyoke/sdk';

const BASE_URL = process.env.FASTYOKE_URL ?? 'http://127.0.0.1:8787';
const TENANT_ID = 'local';
const JOB_ID = 'job-vac_1';

const token = readFileSync('.fastyoke/token', 'utf8').trim();

const jobs = new JobsClient({
  tenantId: TENANT_ID,
  baseUrl: BASE_URL,
  fetcher: (input, init) =>
    fetch(input, {
      ...init,
      headers: { ...init?.headers, Authorization: `Bearer ${token}` },
    }),
});

async function main() {
  // requested -> in_review (no guard on `submit`)
  const submitted = await jobs.transition(JOB_ID, { eventType: 'submit' });
  console.log('after submit:', submitted.current_state);

  // in_review -> approved (guarded: the `approve` edge's guard checks the
  // linked entity's data_payload for role === "manager" — flat var, seeded
  // with role: "manager" in seed.json)
  const approved = await jobs.transition(JOB_ID, { eventType: 'approve' });
  console.log('after approve:', approved.current_state);

  const history = await jobs.history(JOB_ID);
  console.log(
    'event log:',
    history.map((e) => `${e.event_type} (${e.from_state} -> ${e.to_state})`),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
