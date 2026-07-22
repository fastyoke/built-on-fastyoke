import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  webServer: [
    { command: 'pnpm --filter @gallery/support-desk dev', url: 'http://localhost:5201', reuseExistingServer: true, timeout: 60_000 },
    { command: 'pnpm --filter @gallery/issue-board dev', url: 'http://localhost:5202', reuseExistingServer: true, timeout: 60_000 },
    { command: 'pnpm --filter @gallery/last-mile-dispatch dev', url: 'http://localhost:5203', reuseExistingServer: true, timeout: 60_000 },
    { command: 'pnpm --filter @gallery/field-service dev', url: 'http://localhost:5204', reuseExistingServer: true, timeout: 60_000 },
  ],
  use: { baseURL: 'http://localhost:5201' },
});
