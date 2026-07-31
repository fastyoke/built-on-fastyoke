import { readFileSync, writeFileSync } from 'node:fs';
import { api, API_URL } from './lib/fastyoke-admin-client.mjs';

const EMAIL = 'demo@built-on-fastyoke.invalid';
const PASSWORD = 'DemoPassword123!';
const ORG = 'Built on FastYoke Demo';

// App registry: each app installs a schema + seed; some also upload an extension.
const APPS = [
  { fixtures: 'fixtures/support-desk/support-desk' },
  {
    fixtures: 'fixtures/issue-board/issue-board',
    extension: { dir: 'extensions/kanban-block', manifest: 'manifest.json', bundle: 'dist/bundle.mjs' },
  },
  { fixtures: 'fixtures/last-mile-dispatch/last-mile-dispatch' },
  { fixtures: 'fixtures/field-service/field-service' },
];

async function authenticate() {
  try {
    return await api('/api/v1/auth/signup', { method: 'POST', body: { email: EMAIL, password: PASSWORD, org_name: ORG, org_legal_name: ORG, country: 'US', turnstile_token: 'sandbox' } });
  } catch (e) {
    if (e.status !== 409) throw e;
    return api('/api/v1/auth/login', { method: 'POST', body: { email: EMAIL, password: PASSWORD } });
  }
}
const pickToken = (a) => a.token ?? a.access_token ?? a.jwt ?? (() => { throw new Error(`no token: ${JSON.stringify(a).slice(0,200)}`); })();
const pickTenant = (a) => a.tenant_id ?? a.tenant?.id ?? a.tenantId ?? (() => {
  const jwt = a.token ?? a.access_token ?? a.jwt;
  if (jwt) {
    try {
      const claims = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString('utf8'));
      if (claims.tenant_id) return claims.tenant_id;
    } catch { /* fall through */ }
  }
  throw new Error(`no tenant: ${JSON.stringify(a).slice(0,200)}`);
})();

/** BFS the transition graph from initial_state to targetState; returns the event_type sequence. */
function eventPath(schemaJson, targetState) {
  const start = schemaJson.initial_state;
  if (targetState === start) return [];
  const edges = schemaJson.transitions ?? [];
  const queue = [[start, []]];
  const seen = new Set([start]);
  while (queue.length) {
    const [state, path] = queue.shift();
    for (const e of edges.filter((t) => t.from === state)) {
      if (seen.has(e.to)) continue;
      const next = [...path, e.event_type];
      if (e.to === targetState) return next;
      seen.add(e.to);
      queue.push([e.to, next]);
    }
  }
  throw new Error(`No path from ${start} to ${targetState}`);
}

async function installSchema(schema, token, tenantId) {
  try {
    const created = await api('/api/v1/tenant/schemas', {
      method: 'POST', token, tenantId,
      body: { name: schema.name, entity_name: schema.entity_name, schema_json: schema.schema_json },
    });
    return created.id;
  } catch (e) {
    if (e.status !== 409) throw e;
    const list = await api('/api/v1/tenant/schemas', { token, tenantId });
    return (Array.isArray(list) ? list : list.records ?? []).find((s) => s.name === schema.name && s.is_active)?.id;
  }
}

async function seedRecords(seed, token, tenantId) {
  const idMap = {};
  for (const [kind, records] of Object.entries(seed.entities)) {
    for (const rec of records) {
      const { id: fixtureId, ...payload } = rec;
      const key = payload.subject ?? payload.title ?? fixtureId;
      const field = payload.subject !== undefined ? 'subject' : 'title';
      const existing = await api(`/api/v1/tenant/entities/${kind}?filterField=${field}&filterValue=${encodeURIComponent(key)}`, { token, tenantId });
      const found = (existing.records ?? []).find((r) => r?.data_payload?.[field] === key);
      idMap[`${kind}:${fixtureId}`] = found ? found.id
        : (await api(`/api/v1/tenant/entities/${kind}`, { method: 'POST', token, tenantId, body: { data_payload: payload } })).id;
    }
  }
  return idMap;
}

async function spawnJobs(seed, schema, schemaId, idMap, token, tenantId) {
  for (const job of seed.jobs) {
    const contextRecordId = idMap[job.context];
    const spawned = await api('/api/v1/tenant/jobs', { method: 'POST', token, tenantId, body: { schema_id: schemaId, context_record_id: contextRecordId } });
    for (const eventType of eventPath(schema.schema_json, job.state)) {
      await api(`/api/v1/tenant/jobs/${spawned.id}/transition`, { method: 'POST', token, tenantId, body: { event_type: eventType, context_record_id: contextRecordId } });
    }
  }
}

async function uploadExtension(ext, token, tenantId) {
  const manifest = readFileSync(`${ext.dir}/${ext.manifest}`, 'utf8');
  const bundle = readFileSync(`${ext.dir}/${ext.bundle}`);
  const form = new FormData();
  form.set('tenant_id', tenantId);
  form.set('manifest', manifest);
  form.set('bundle', new Blob([bundle], { type: 'text/javascript' }), 'bundle.mjs');
  const res = await fetch(`${API_URL}/api/v1/tenant/extensions`, { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: form });
  if (!res.ok) throw new Error(`extension upload → ${res.status}: ${(await res.text()).slice(0, 300)}`);
  console.log(`  ✓ uploaded extension ${ext.dir}`);
}

async function main() {
  const auth = await authenticate();
  const token = pickToken(auth), tenantId = pickTenant(auth);
  console.log(`✓ authenticated tenant=${tenantId}`);

  for (const app of APPS) {
    const schema = JSON.parse(readFileSync(`${app.fixtures}.schemas.json`, 'utf8'));
    const seed = JSON.parse(readFileSync(`${app.fixtures}.seed.json`, 'utf8'));
    const schemaId = await installSchema(schema, token, tenantId);
    const idMap = await seedRecords(seed, token, tenantId);
    await spawnJobs(seed, schema, schemaId, idMap, token, tenantId);
    console.log(`✓ provisioned ${app.fixtures} (${seed.jobs.length} jobs)`);
    if (app.extension) await uploadExtension(app.extension, token, tenantId);
  }

  writeFileSync('.env.local', [
    `VITE_FASTYOKE_API_URL=${API_URL}`,
    `VITE_FASTYOKE_TENANT_ID=${tenantId}`,
    `VITE_FASTYOKE_TOKEN=${token}`, '',
  ].join('\n'));
  console.log('✓ wrote .env.local');
}

main().catch((e) => { console.error(e); process.exit(1); });
