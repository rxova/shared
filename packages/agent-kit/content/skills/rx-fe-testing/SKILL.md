---
name: rx-fe-testing
description: Tests React components and hooks the way users use them, with React Testing Library role queries, user-event, MSW for the network, async queries and renderHook, after detecting whether the repository runs Vitest or Jest, and splits component tests from Playwright end-to-end tests. Use when adding or fixing front-end tests, when tests break on every refactor, or when async tests are flaky.
---

# rx-fe-testing

Test what the user sees and does: find elements by role and name, act with real events, fake
only the network. A test that survives a refactor and fails when the feature breaks is the
only kind worth keeping.

## When to use

- Adding tests for a component, form, hook or data-driven screen.
- Tests fail after refactors that changed no behaviour.
- Tests are flaky with "not wrapped in act" warnings or timing failures.
- Deciding whether a check belongs in a component test or an end-to-end test.

## Steps

1. **Detect the setup.** Check `package.json` and config files for the runner (`vitest`,
   `jest`), the environment (`jsdom`, `happy-dom`), `@testing-library/react`,
   `@testing-library/user-event`, `@testing-library/jest-dom` and `msw`, plus the setup file
   (`vitest.setup.ts`, `jest.setup.ts`). Follow the existing naming and location. Add
   missing pieces only with a reason, matching the runner (`vitest` globals or imports).
2. **Share one render helper** that wraps providers (router, query client, store, theme) so
   tests do not repeat them, and create a fresh query client or store per test.
3. **Query by role first**, then label, then text; `getByTestId` is the last resort:

   ```ts
   screen.getByRole("button", { name: /save/i });
   screen.getByRole("textbox", { name: /email/i });
   screen.getByRole("heading", { level: 2, name: /orders/i });
   ```

   If an element has no accessible role or name, that is an accessibility bug to fix, not a
   reason to add a test id.

4. **Act with user-event**: `const user = userEvent.setup()` before render, then
   `await user.type(...)`, `await user.click(...)`. Use `fireEvent` only for events
   user-event cannot produce.
5. **Mock the network with MSW** in the setup file (`setupServer` from `msw/node`,
   `listen({ onUnhandledRequest: 'error' })`, `resetHandlers` after each test, `close`
   after all). Override per test with `server.use(http.get(...))` for errors and empty
   states. Do not mock `fetch`, axios or the query hooks.
6. **Wait correctly.** `await screen.findByRole(...)` for something that will appear;
   `waitFor` only for an assertion that becomes true; `waitForElementToBeRemoved` for
   spinners. Use `queryBy...` with `not.toBeInTheDocument()` for absence.
7. **Hooks with logic of their own** get `renderHook` tests (see `rx-fe-hooks`); hooks that
   only glue a component together are tested through the component.
8. **Cover the states:** loading, empty, error, success, plus the one edge case that worries
   you (validation, permissions, double submit).
9. **Split the layers.** Component tests cover a screen's behaviour with a faked network;
   a few Playwright tests cover the golden path through the real app (the `rx-e2e` skill).
   Do not test routing, auth redirects and real APIs in jsdom.
10. **Run** the touched tests while iterating (`pnpm vitest run src/orders`,
    `npx jest src/orders`), then the full gate with `rx-verify`.

## Rules

- No assertions on state, props, hook internals, class names or component instances.
- No snapshot tests of whole components; they pass on regressions and fail on harmless edits.
- Never leave `.only`, `.skip` or a raised timeout to hide flakiness; find the missing await.
- Fake time with `vi.useFakeTimers()` / `jest.useFakeTimers()` and pass
  `advanceTimers` to `userEvent.setup` when both are used.
- React 19 removed `react-dom/test-utils`; import `act` from `react` if you need it.

## Example

```tsx
import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { server } from "@/test/server";
import { renderWithProviders } from "@/test/render";
import { TodoPage } from "./todo-page";

it("adds a todo and shows it in the list", async () => {
  const user = userEvent.setup();
  renderWithProviders(<TodoPage />);

  await user.type(await screen.findByRole("textbox", { name: /title/i }), "Buy milk");
  await user.click(screen.getByRole("button", { name: /add/i }));

  expect(await screen.findByText("Buy milk")).toBeInTheDocument();
});

it("shows an error when saving fails", async () => {
  server.use(http.post("/api/todos", () => HttpResponse.json({}, { status: 500 })));
  const user = userEvent.setup();
  renderWithProviders(<TodoPage />);

  await user.type(await screen.findByRole("textbox", { name: /title/i }), "Buy milk");
  await user.click(screen.getByRole("button", { name: /add/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent(/could not save/i);
});
```
