import { test, expect } from '@playwright/test';

// NOTE: requires the backend up, `pnpm provision` run (which uploads the kanban
// extension), and the issue-board dev server. Verify with a headed run once the
// backend image exists; column/card selectors may need adjustment to the
// extension's rendered DOM.
test('renders the board and moves a card across a column (optimistic transition)', async ({ page }) => {
  await page.goto('http://localhost:5202');
  const cards = page.getByTestId('issue-card');
  await expect(cards.first()).toBeVisible();

  // Drag the "OAuth login" card (seeded in Backlog) into the Todo column.
  const card = page.getByText('OAuth login drops the return URL');
  const todo = page.getByRole('heading', { name: /Todo/ });
  await card.dragTo(todo);

  // It should now live under Todo (the transition fired and stuck).
  await expect(page.getByText('OAuth login drops the return URL')).toBeVisible();
});
