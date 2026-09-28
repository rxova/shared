---
name: rx-qa-a11y
description: Tests accessibility with automated axe scans in Playwright, a keyboard-only pass, screen reader spot checks, zoom and reflow at 400 percent, reduced motion and form errors, mapped to WCAG 2.2 AA with findings reported by severity. Use before releasing a user-facing screen, after a UI or component library change, or when asked whether something is accessible.
---

# rx-qa-a11y

Automated tools find about a third of accessibility problems. The rest need a keyboard, a
screen reader and a zoomed browser. Do both, and report each finding against the WCAG
criterion it fails.

## When to use

- A new or changed screen, form, dialog or navigation is about to ship.
- The component library, design tokens or layout shell changed.
- Someone asks "is this accessible?" or a customer needs a WCAG 2.2 AA statement.

Colour contrast across themes is covered in depth by the `rx-theme-audit` skill.

## Steps

1. **Detect the existing setup.** Look for `@axe-core/playwright`, `jest-axe`,
   `vitest-axe`, `eslint-plugin-jsx-a11y` or Storybook's a11y addon. Extend what is there.
2. **Automated scan** of each main page and state (open dialog, error state, empty state):

   ```bash
   pnpm add -D @axe-core/playwright
   ```

   ```ts
   // e2e/a11y.spec.ts
   import { test, expect } from "@playwright/test";
   import AxeBuilder from "@axe-core/playwright";

   for (const path of ["/", "/splits/new", "/settings"]) {
     test(`no WCAG A/AA violations on ${path}`, async ({ page }) => {
       await page.goto(path);
       const results = await new AxeBuilder({ page })
         .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
         .analyze();
       expect(results.violations).toEqual([]);
     });
   }
   ```

   Exclude third-party widgets with `.exclude(selector)` only with a note and an issue.

3. **Keyboard-only pass.** Unplug the mouse mentally. Tab through each flow: every control
   reachable, order follows the visual order, focus always visible and never hidden behind a
   sticky header, dialogs trap focus and return it on close, `Escape` closes, no keyboard
   trap, custom widgets follow their ARIA pattern (arrows in menus, tabs, listboxes).
4. **Screen reader spot checks** on the core flow: VoiceOver on macOS (`Cmd+F5`, rotor with
   `Ctrl+Option+U`) with Safari, NVDA on Windows with Firefox or Chrome. Check page title,
   headings outline, landmarks, control names and roles, image alternatives, and that status
   changes (saved, errors, loading) are announced.
5. **Zoom and reflow.** Browser zoom to 400% at 1280px wide (equal to 320 CSS px): no
   horizontal scrolling for text, nothing cut off or overlapping. Text-only zoom to 200%.
   Apply the text-spacing bookmarklet (line height 1.5, letter spacing 0.12em).
6. **Motion and media.** Emulate reduced motion (`reducedMotion: 'reduce'`, or the OS
   setting): large animations and parallax stop. Anything moving for more than five seconds
   can be paused. Video has captions.
7. **Forms and errors.** Every input has a visible label tied to it; required fields are
   marked in text; errors name the field and the fix, appear next to it, and are announced;
   focus moves to the first error or an error summary; data is not lost on error.
8. **Report** each finding with the template below, most severe first.

## WCAG 2.2 AA quick map

| Check                                       | Criteria                   |
| ------------------------------------------- | -------------------------- |
| Names, roles, alternatives                  | 1.1.1, 4.1.2, 1.3.1        |
| Contrast text and non-text                  | 1.4.3, 1.4.11              |
| Reflow, resize, spacing                     | 1.4.10, 1.4.4, 1.4.12      |
| Keyboard, no trap, focus order and visible  | 2.1.1, 2.1.2, 2.4.3, 2.4.7 |
| Focus not obscured                          | 2.4.11 (new in 2.2)        |
| Target size at least 24 by 24 px            | 2.5.8 (new in 2.2)         |
| Dragging has a single-pointer alternative   | 2.5.7 (new in 2.2)         |
| Login without a cognitive test              | 3.3.8 (new in 2.2)         |
| Labels, error identification and suggestion | 3.3.1, 3.3.2, 3.3.3        |
| Status messages announced                   | 4.1.3                      |

## Finding format

**Severity** (blocker: a task cannot be completed; serious; moderate; minor) · **WCAG**
criterion · **Where** (page, element, `path:line` if known) · **Who is affected** ·
**Steps** · **Fix**.

## Rules

- A green axe run is not a pass on its own; report the manual checks you did and did not do.
- Fix the markup before adding ARIA; no ARIA is better than wrong ARIA.
- Test with the real assistive technology for a claim about it; do not infer from the DOM.

## Example

> **Blocker, 2.1.2 and 2.4.3**: the "Add person" dialog on `/splits/new` does not trap focus;
> Tab moves behind the overlay and `Escape` does nothing, so keyboard users cannot finish a
> split. Cause: custom `Modal` in `components/modal.tsx:14` without focus management. Fix:
> use the library's dialog (native `<dialog>` or the design system's) and add a Playwright
> test that tabs through it.
