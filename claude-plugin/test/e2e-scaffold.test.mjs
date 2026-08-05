import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateApp } from '../scripts/fy-validate.mjs';

const TEMPLATE_DIR = new URL('../templates/vacation-approval/', import.meta.url);

test('archetype FSM schema validates', () => {
  const fsm = JSON.parse(fs.readFileSync(new URL('fsm.schema.json', TEMPLATE_DIR)));
  const r = validateApp(fsm);
  assert.equal(r.ok, true, r.errors.join('; '));
});

// Runtime half: proves the archetype installs into a real `fastyoke dev`
// sidecar and a transition fires through the actual FSM engine. Gated on
// FY_E2E=1 because it requires network access (npm install) and a runtime
// binary that may not be present in every environment. Commands below are
// reconciled with docs/superpowers/spikes/2026-08-04-fastyoke-cli-surface.md.
test('scaffold installs and a transition succeeds', { skip: process.env.FY_E2E !== '1' }, async (t) => {
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fy-e2e-'));
  const port = 20000 + (process.pid % 10000);
  let devProc;

  t.after(() => {
    if (devProc && !devProc.killed) {
      devProc.kill('SIGTERM');
    }
    fs.rmSync(workDir, { recursive: true, force: true });
  });

  // FY_INIT prerequisites: a package.json + the `fastyoke` dep installed.
  execFileSync('npm', ['init', '-y'], { cwd: workDir, stdio: 'pipe' });
  execFileSync('npm', ['i', 'fastyoke@latest'], { cwd: workDir, stdio: 'pipe' });

  // FY_INIT: scaffold .fastyoke/ (config, seed.json, auth token, .gitignore).
  execFileSync('npx', ['fastyoke', 'init'], { cwd: workDir, stdio: 'pipe' });

  // FY_APP_INSTALL: the archetype's seed.json IS the install — it carries
  // entity_kinds, fsm_schemas, and a `jobs` row already sitting at initial_state.
  const seed = JSON.parse(fs.readFileSync(new URL('seed.json', TEMPLATE_DIR), 'utf8'));
  fs.writeFileSync(path.join(workDir, '.fastyoke', 'seed.json'), JSON.stringify(seed, null, 2));

  const job = seed.jobs[0];
  const jobId = job.id;
  const initialState = job.current_state;

  // FY_RUNTIME_START: boot the sidecar and wait for its ready line.
  devProc = spawn('npx', ['fastyoke', 'dev', '--port', String(port)], {
    cwd: workDir,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const ready = await waitForReady(devProc, port);
  assert.ok(ready, 'fastyoke dev did not report ready in time');

  const token = fs.readFileSync(path.join(workDir, '.fastyoke', 'token'), 'utf8').trim();
  const base = `http://127.0.0.1:${port}/api/v1/tenant`;
  const authHeaders = { Authorization: `Bearer ${token}`, 'content-type': 'application/json' };

  // FY_READ_EVENTS (before): baseline history row count.
  const historyBefore = await fetchJson(`${base}/jobs/${jobId}/history?tenant_id=local`, { headers: authHeaders });
  const countBefore = historyBefore.length;

  // FY_TRANSITION: fire `submit` (requested -> in_review, no guard).
  const transitionRes = await fetch(`${base}/jobs/${jobId}/transition`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ tenant_id: 'local', event_type: 'submit' }),
  });
  if (transitionRes.status !== 200) {
    throw new Error(`transition failed (${transitionRes.status}): ${await transitionRes.text()}`);
  }

  // FY_READ_STATE: current_state advanced.
  const jobAfter = await fetchJson(`${base}/jobs/${jobId}?tenant_id=local`, { headers: authHeaders });
  assert.equal(jobAfter.current_state, 'in_review');
  assert.notEqual(jobAfter.current_state, initialState);

  // FY_READ_EVENTS (after): history grew by exactly one row.
  const historyAfter = await fetchJson(`${base}/jobs/${jobId}/history?tenant_id=local`, { headers: authHeaders });
  assert.equal(historyAfter.length, countBefore + 1);
});

async function fetchJson(url, opts) {
  const res = await fetch(url, opts);
  if (res.status !== 200) {
    throw new Error(`GET ${url} failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

async function waitForReady(proc, port, timeoutMs = 30000) {
  let stdout = '';
  proc.stdout.on('data', (d) => { stdout += d.toString(); });
  proc.stderr.on('data', (d) => { stdout += d.toString(); });

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (/ready on http:\/\/127\.0\.0\.1:\d+/.test(stdout)) return true;
    if (proc.exitCode !== null) return false;
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/tenant/jobs?tenant_id=local`);
      if (res.status) return true;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}
