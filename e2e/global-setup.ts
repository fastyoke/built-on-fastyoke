import { execSync } from 'node:child_process';

/**
 * The smokes mutate seeded rows (support-desk transitions a ticket, dispatch
 * forces a delivery state), so they need pristine data on every run. Reset the
 * single-node backend volume and re-provision before the suite.
 *
 * Set E2E_NO_DOCKER=1 to skip the docker reset (e.g. when you manage the backend
 * yourself); provisioning still runs. FASTYOKE_API_URL overrides the default
 * backend URL (http://localhost:8080).
 */
export default async function globalSetup() {
  const api = process.env.FASTYOKE_API_URL ?? 'http://localhost:8080';

  if (process.env.E2E_NO_DOCKER !== '1') {
    execSync('docker compose down -v && docker compose up -d', { stdio: 'inherit' });
    const deadline = Date.now() + 90_000;
    let up = false;
    while (Date.now() < deadline) {
      try {
        if ((await fetch(`${api}/health`)).ok) { up = true; break; }
      } catch {
        /* backend not accepting connections yet */
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    if (!up) throw new Error(`backend did not become healthy at ${api}/health within 90s`);
  }

  execSync('node scripts/provision.mjs', { stdio: 'inherit' });
}
