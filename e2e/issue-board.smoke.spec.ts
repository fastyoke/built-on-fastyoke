import { test, expect } from '@playwright/test';

// KNOWN BUG (tracked): the kanban extension bundle does not load, so the board
// renders "Kanban extension not installed" and no cards appear. Root cause is
// not this test — the bundle externalizes `react`/`react-dom`/`@fastyoke/sdk`
// as bare ESM imports (see extensions/kanban-block/build.mjs), and the
// @fastyoke/sdk 0.3.x extension loader dynamically imports the bundle without
// an import map for those specifiers, so it throws:
//   TypeError: Failed to resolve module specifier "react"
// Fix belongs in the SDK loader (provide an import map / host modules for
// react + @fastyoke/sdk) or the extension build (bundle react). Once the
// extension loads, this test also needs a native-HTML5 drag helper — Playwright's
// `dragTo()` does not fire the `dragstart`/`dragover`/`drop` events the board's
// draggable cards listen for.
test.fixme('renders the board and moves a card across a column (optimistic transition)', async ({ page }) => {
  await page.goto('http://localhost:5202');
  const cards = page.getByTestId('issue-card');
  await expect(cards.first()).toBeVisible();

  // Native HTML5 drag: `dragTo` won't work — dispatch dragstart/dragover/drop
  // with a shared DataTransfer once the extension renders.
  const card = page.getByText('OAuth login drops the return URL');
  const todo = page.getByRole('heading', { name: /Todo/ });
  await card.dragTo(todo);

  await expect(page.getByText('OAuth login drops the return URL')).toBeVisible();
});
