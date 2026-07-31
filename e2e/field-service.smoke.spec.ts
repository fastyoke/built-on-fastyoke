import { test, expect } from '@playwright/test';

// FIXED in the backend, pending a released image (fastyoke2 PR #381): the signed
// transition used to fail with `401 unauthorized` even with a valid password
// (POST /auth/login succeeds), because the re-auth in jobs.rs did
//   SELECT name, password_hash FROM users WHERE tenant_id = ? AND id = ?
// — but users are platform-global and the sandbox signup stubs users.tenant_id
// to '', so that lookup returned 0 rows. Verified directly: the signer's row has
// tenant_id='', the old query matches 0 rows, `WHERE id = ?` matches 1. PR #381
// changes the query to look the signer up by id alone.
// Un-fixme once the gallery runs against a backend image that includes the fix.
test.fixme('signs off an on-site work order with an electronic signature', async ({ page }) => {
  await page.goto('http://localhost:5204');
  await page.getByRole('link', { name: 'WO-504' }).first().click(); // seeded OnSite

  await page.getByRole('button', { name: /sign_off \(sign\)/ }).click();
  await expect(page.getByRole('dialog', { name: 'Electronic signature' })).toBeVisible();
  await page.getByLabel('Password (re-authentication)').fill('DemoPassword123!');
  await page.getByLabel(/legally binding/).check();
  await page.getByRole('button', { name: 'Sign & complete' }).click();

  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByText('Completed')).toBeVisible(); // timeline advanced
});
