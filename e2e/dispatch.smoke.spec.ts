import { test, expect } from '@playwright/test';

// The admin-override step relies on the provisioned signup user carrying an
// admin role (the cancel endpoint is admin-gated).
test('drives a delivery: self-loop check-in appends an audit event, override forces state', async ({ page }) => {
  await page.goto('http://localhost:5203');
  await expect(page.getByTestId('map-marker').first()).toBeVisible();

  // Open DLV-104 (seeded EnRoute) and fire a self-loop check-in. `.first()`
  // guards against a duplicate seed row if the DB was provisioned more than once.
  await page.getByRole('link', { name: 'DLV-104' }).first().click();
  await expect(page.getByText('No check-ins yet')).toBeVisible();
  await page.getByRole('button', { name: /check_in \(self-loop\)/ }).click();
  await expect(page.getByText(/check_in —/)).toBeVisible(); // audit row appended, state unchanged

  // Admin override → force Delivered with a reason.
  await page.getByRole('button', { name: 'Override…' }).click();
  await page.getByLabel('Target state').selectOption('Delivered');
  await page.getByLabel('Reason (required)').fill('Customer confirmed drop-off by phone');
  await page.getByRole('button', { name: 'Force state' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});
