import { readFileSync, writeFileSync } from 'node:fs';
import { api, API_URL } from './lib/fastyoke-admin-client.mjs';

// Deterministic demo identity. Re-running signup for an existing email returns
// 409; we fall back to login so provision is idempotent.
const EMAIL = 'demo@built-on-fastyoke.invalid';
const PASSWORD = 'DemoPassword123!';
const ORG = 'Built on FastYoke Demo';

async function authenticate() {
  try {
    return await api('/api/v1/auth/signup', {
      method: 'POST',
      body: { email: EMAIL, password: PASSWORD, org_name: ORG },
    });
  } catch (e) {
    if (e.status !== 409) throw e;
    return api('/api/v1/auth/login', {
      method: 'POST',
      body: { email: EMAIL, password: PASSWORD },
    });
  }
}

function pickToken(auth) {
  const token = auth.token ?? auth.access_token ?? auth.jwt;
  if (!token) throw new Error(`No token in auth response: ${JSON.stringify(auth).slice(0, 300)}`);
  return token;
}

function pickTenant(auth) {
  const t = auth.tenant_id ?? auth.tenant?.id ?? auth.tenantId;
  if (!t) throw new Error(`No tenant id in auth response: ${JSON.stringify(auth).slice(0, 300)}`);
  return t;
}

async function main() {
  const auth = await authenticate();
  const token = pickToken(auth);
  const tenantId = pickTenant(auth);
  console.log(`✓ authenticated tenant=${tenantId}`);

  const schema = JSON.parse(readFileSync('fixtures/support-desk/support-desk.schemas.json', 'utf8'));
  const seed = JSON.parse(readFileSync('fixtures/support-desk/support-desk.seed.json', 'utf8'));

  // 1) Create the FSM schema (idempotent: 409 on existing active version is fine).
  let schemaId;
  try {
    const created = await api('/api/v1/schemas', {
      method: 'POST', token, tenantId,
      body: { name: schema.name, entity_name: schema.entity_name, schema_json: schema.schema_json },
    });
    schemaId = created.id;
    console.log(`✓ created schema ${schema.name} (${schemaId})`);
  } catch (e) {
    if (e.status !== 409) throw e;
    const list = await api('/api/v1/schemas', { token, tenantId });
    schemaId = (Array.isArray(list) ? list : list.records ?? [])
      .find((s) => s.name === schema.name && s.is_active)?.id;
    console.log(`↺ schema ${schema.name} already present (${schemaId})`);
  }

  // 2) Upsert entity records. Create returns the server id; map fixture id → server id.
  const idMap = {};
  for (const [kind, records] of Object.entries(seed.entities)) {
    for (const rec of records) {
      const { id: fixtureId, ...payload } = rec;
      const existing = await api(
        `/api/v1/tenant/entities/${kind}?filterField=subject&filterValue=${encodeURIComponent(payload.subject)}`,
        { token },
      );
      const found = (existing.records ?? []).find((r) => r?.data_payload?.subject === payload.subject);
      if (found) { idMap[`${kind}:${fixtureId}`] = found.id; continue; }
      const made = await api(`/api/v1/tenant/entities/${kind}`, {
        method: 'POST', token, tenantId, body: payload,
      });
      idMap[`${kind}:${fixtureId}`] = made.id;
    }
  }
  console.log(`✓ seeded ${Object.keys(idMap).length} entity records`);

  // 3) Spawn jobs and advance each to its seeded state along the transition path.
  // Event path from the initial state to each seedable state, using only edges
  // that exist in ticket_lifecycle. Reaching Resolved/Closed also needs a
  // `resolution` value on the ticket to satisfy the resolve guard; the current
  // seed only goes as deep as InProgress, so those paths are here for
  // completeness and exercised only if a future seed uses them.
  const PATH_TO = {
    New: [],
    Triaged: ['triage'],
    InProgress: ['triage', 'start'],
    Waiting: ['triage', 'start', 'wait'],
    Resolved: ['triage', 'start', 'resolve'],
    Closed: ['triage', 'start', 'resolve', 'close'],
  };
  for (const job of seed.jobs) {
    const path = PATH_TO[job.state];
    if (!path) throw new Error(`Unknown seed state "${job.state}" for schema ${job.schema}`);
    const contextRecordId = idMap[job.context];
    const spawned = await api('/api/v1/tenant/jobs', {
      method: 'POST', token, tenantId, body: { schema_id: schemaId, context_record_id: contextRecordId },
    });
    for (const event_type of path) {
      await api(`/api/v1/tenant/jobs/${spawned.id}/transition`, {
        method: 'POST', token, tenantId,
        body: { event_type, context_record_id: contextRecordId },
      });
    }
  }
  console.log(`✓ spawned ${seed.jobs.length} jobs`);

  writeFileSync(
    '.env.local',
    [
      `VITE_FASTYOKE_API_URL=${API_URL}`,
      `VITE_FASTYOKE_TENANT_ID=${tenantId}`,
      `VITE_FASTYOKE_TOKEN=${token}`,
      '',
    ].join('\n'),
  );
  console.log('✓ wrote .env.local');
}

main().catch((e) => { console.error(e); process.exit(1); });
