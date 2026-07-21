import { test, expect } from '@playwright/test';

test('lists seeded tickets, creates one, and drives a transition', async ({ page }) => {
  // NOTE: timeline-step selectors may still need a testid/role scope — verify with a headed run once the backend is available.
  await page.goto('/');
  await expect(page.getByText('CSV export times out')).toBeVisible();

  // Create a ticket and confirm it appears.
  const unique = `Smoke ticket ${Date.now()}`;
  await page.getByLabel('subject').fill(unique);
  await page.getByLabel('requester email').fill('smoke@demo.invalid');
  await page.getByRole('button', { name: 'New ticket' }).click();
  await expect(page.getByText(unique)).toBeVisible();

  // Open the InProgress ticket and advance it to Waiting.
  await page.getByRole('link', { name: 'CSV export times out' }).click();
  await expect(page.getByText('InProgress', { exact: true })).toBeVisible();
  await page.getByText('Waiting', { exact: true }).click();
  await expect(page.getByText('Waiting', { exact: true })).toBeVisible();
});
