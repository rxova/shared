---
name: rx-e2e
description: Sets up a small Playwright smoke suite that clicks through the golden path locally and against the deployed URL. Use once the golden path works end to end, before the feature freeze, or when manual click-throughs start taking too long.
---

# rx-e2e

A handful of browser tests on the demo path catches the breakage that unit tests miss: a
renamed button, a missing env var, a redirect loop. Keep it small, stable and fast.

## When to use

- The golden path works and you want to know the moment it stops working.
- Several people merge to main and each merge risks the demo.
- You need to check the deployed site, not just local.

## Steps

1. **Install.** Check the lockfile for the package manager, and whether Playwright is already
   there. Then, for example:

   ```bash
   pnpm create playwright          # or: npm init playwright@latest
   pnpm exec playwright install --with-deps chromium
   ```

   Chromium alone is enough for a smoke suite. Add `test-results/`, `playwright-report/` to
   `.gitignore`.

2. **Configure it to start the app** and to take a base URL from the environment:

   ```ts
   // playwright.config.ts
   import { defineConfig, devices } from "@playwright/test";

   const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
   const isRemote = Boolean(process.env.E2E_BASE_URL);

   export default defineConfig({
     testDir: "e2e",
     retries: process.env.CI ? 1 : 0,
     use: {
       baseURL,
       trace: "retain-on-failure",
       screenshot: "only-on-failure",
     },
     projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
     webServer: isRemote
       ? undefined
       : { command: "pnpm dev", url: baseURL, reuseExistingServer: !process.env.CI },
   });
   ```

3. **Write 3 to 5 tests that follow the demo path** (`DEMO.md` from the `rx-demo` skill):
   the home page loads, the user can log in, the core action produces the core result, the
   result is saved and visible after reload, and one important error state.
4. **Use stable selectors**, in this order: `getByRole` with an accessible name,
   `getByLabel`, `getByText` for visible copy, then `getByTestId` with a `data-testid` you
   add. Avoid CSS classes and nth-child chains. Rely on Playwright's auto-waiting and
   `expect(...).toBeVisible()`; never `waitForTimeout`.
5. **Make data predictable.** Run the seed/reset script before the suite, or create what the
   test needs through the API in a `beforeEach`. Log in once with a stored auth state if
   login is slow.
6. **Run and debug.**

   ```bash
   pnpm exec playwright test                 # all, headless
   pnpm exec playwright test --headed        # watch it
   pnpm exec playwright test --ui            # step through, pick tests
   pnpm exec playwright test --debug e2e/split.spec.ts
   pnpm exec playwright show-report          # open the last report
   pnpm exec playwright show-trace test-results/<test>/trace.zip
   ```

7. **Run against the deployed site** after each deploy:
   `E2E_BASE_URL=https://myapp.example.com pnpm exec playwright test`.
   Add a `test:e2e` script so everyone runs it the same way.

## Example

```ts
// e2e/split.spec.ts
import { test, expect } from "@playwright/test";

test("upload a receipt and get one payment link per person", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Friday dinner" }).click();
  await page.getByLabel("Receipt photo").setInputFiles("e2e/fixtures/receipt.jpg");
  await expect(page.getByRole("listitem").filter({ hasText: "Pad thai" })).toBeVisible();

  await page.getByRole("button", { name: "Send links" }).click();
  await expect(page.getByTestId("payment-link")).toHaveCount(3);
});
```
