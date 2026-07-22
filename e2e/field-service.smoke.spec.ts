import { test, expect } from '@playwright/test';

// NOTE: requires the backend up + `pnpm provision` run + the field-service dev
// server. The sign-off step re-authenticates with the demo password
// (DemoPassword123!). Verify headed once the backend image exists.
test('signs off an on-site work order with an electronic signature', async ({ page }) => {
  await page.goto('http://localhost:5204');
  await page.getByRole('link', { name: 'WO-504' }).click(); // seeded OnSite

  await page.getByRole('button', { name: /sign_off \(sign\)/ }).click();
  await expect(page.getByRole('dialog', { name: 'Electronic signature' })).toBeVisible();
  await page.getByLabel('Password (re-authentication)').fill('DemoPassword123!');
  await page.getByLabel(/legally binding/).check();
  await page.getByRole('button', { name: 'Sign & complete' }).click();

  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByText('Completed')).toBeVisible(); // timeline advanced
});
