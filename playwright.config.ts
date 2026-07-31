import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  // Reset + provision the backend before the suite so the mutating smokes get
  // pristine seeded data on every run (idempotency isn't possible for tests
  // that force a terminal state). See e2e/global-setup.ts.
  globalSetup: './e2e/global-setup.ts',
  // The apps share one single-node SQLite backend; running specs in parallel
  // causes write contention ("database is locked"). Serialize them.
  fullyParallel: false,
  workers: 1,
  webServer: [
    { command: 'pnpm --filter @gallery/support-desk dev', url: 'http://localhost:5201', reuseExistingServer: true, timeout: 60_000 },
    { command: 'pnpm --filter @gallery/issue-board dev', url: 'http://localhost:5202', reuseExistingServer: true, timeout: 60_000 },
    { command: 'pnpm --filter @gallery/last-mile-dispatch dev', url: 'http://localhost:5203', reuseExistingServer: true, timeout: 60_000 },
    { command: 'pnpm --filter @gallery/field-service dev', url: 'http://localhost:5204', reuseExistingServer: true, timeout: 60_000 },
  ],
  use: { baseURL: 'http://localhost:5201' },
});
