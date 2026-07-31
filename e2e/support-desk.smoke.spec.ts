import { test, expect } from '@playwright/test';

test('lists seeded tickets, creates one, and drives a transition', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('CSV export times out')).toBeVisible();

  // Create a ticket and confirm it appears (the list refetches after create).
  const unique = `Smoke ticket ${Date.now()}`;
  await page.getByLabel('subject').fill(unique);
  await page.getByLabel('requester email').fill('smoke@demo.invalid');
  await page.getByRole('button', { name: 'New ticket' }).click();
  await expect(page.getByRole('link', { name: unique })).toBeVisible();

  // Open the InProgress ticket and advance it to Waiting. The FsmTimeline shows
  // the current state as "Current<State>" and renders each available transition
  // as a button named "<event>→ <TargetState>".
  await page.getByRole('link', { name: 'CSV export times out' }).click();
  await expect(page.getByText('CurrentInProgress')).toBeVisible();
  await page.getByRole('button', { name: /Waiting/ }).click();
  await expect(page.getByText('CurrentWaiting')).toBeVisible();
});
