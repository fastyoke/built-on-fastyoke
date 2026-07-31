import { test, expect } from '@playwright/test';

// KNOWN BUG (two root causes; one fixed here, one pending an SDK release):
//  1. FIXED (this repo): the extension bundle imports react / react/jsx-runtime /
//     @fastyoke/sdk as bare ESM specifiers, and the SDK loads it as a blob module
//     that relies on the *app's* import map to resolve them. index.html now ships
//     that import map + public/shims/* re-export this app's own instances (set on
//     globalThis in main.tsx), so the bundle loads and its React is shared.
//  2. PENDING (SDK, fastyoke2 PR #381): the extension-scoped <FastYokeProvider>
//     dropped `baseUrl`, so the extension's useFastYoke() client fetches relative
//     URLs (the app origin, not the API) → the SPA answers with HTML → JSON parse
//     error. Un-fixme once the gallery bumps to an @fastyoke/sdk release with that
//     fix. When re-enabling, this test also needs a native-HTML5 drag helper —
//     `dragTo()` doesn't fire the dragstart/dragover/drop events the cards use.
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
