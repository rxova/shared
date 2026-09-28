---
name: rx-theme-audit
description: Audits a website's dark and light themes in a real browser, measuring text contrast, finding surfaces and images that ignore the theme, and tracing each problem to the token or file that causes it. Use when asked to check, review or fix a dark mode, a theme, or colour contrast.
---

# rx-theme-audit

A theme is right when every page reads well in it, not when the tokens look right. Measure
the rendered page, then trace each problem back to its source.

## When to use

- "Check the dark mode", "is the theme accessible", "review the colours".
- After changing design tokens, a theme toggle, or images and diagrams.

## What you need

A browser you can drive (DevTools or browser automation tools) and, ideally, the source. The
site can be deployed or local.

## Steps

1. **Learn the mechanism from the source.** How is the theme chosen: `prefers-color-scheme`,
   a `data-theme` or class on `<html>`, or both? Where are the tokens? Is there a script that
   sets the theme before first paint? Note any place the dark palette is written out twice:
   copies drift.
2. **Force each scheme.** Emulate `prefers-color-scheme: dark` (and light), and also test the
   site's own toggle against the OS setting (site dark on a light OS, and the reverse).
3. **Measure, page by page.** Visit the main templates: home, a listing, an article, docs, a
   form. On each, run the measuring function in `measure.md` and take a screenshot.
4. **Look for what measuring cannot catch.** Scroll each page and check images, diagrams,
   embeds, code blocks, form controls, focus rings, shadows and borders.
5. **Trace each finding** to its cause: the token pair, the component's CSS, or the asset
   file. Check whether the same pair is used elsewhere.
6. **Report**, most severe first.

## What to check

- **Text contrast**: 4.5:1 for normal text, 3:1 for large text (24px, or 18.66px bold).
  Muted and secondary text, placeholders, text on tags and chips, and links are where it fails.
- **Non-text contrast**: 3:1 for input borders, icons that carry meaning, and focus
  indicators. Decorative lines are exempt.
- **Surfaces left light**: panels, modals, menus, embeds, native controls (they need
  `color-scheme: dark`).
- **Images**: light screenshots and diagrams glare on a dark page. For SVG diagrams, an
  `<img>` SVG can carry its own `@media (prefers-color-scheme: dark)` styles. Browsers resolve
  that query from the `<img>`'s inherited `color-scheme`, not only the OS, so it follows a
  site toggle that sets `color-scheme` per theme. Raster screenshots need dark captures, or
  at least dimming in dark (`filter: brightness(.8)`).
- **Depth**: shadows barely show on dark; elevation needs lighter surfaces or borders.
- **Switching**: no flash of the other theme on load, the choice persists, and back/forward
  restores it.

## Report format

For each finding: severity, what is wrong and where (page, element), the measured value
against the target, the cause (`path:line` or token), and the fix. Say what passed too, so
the reader knows what was covered.

## Example finding

> **Medium: violet text on tags is 4.31:1 in dark (needs 4.5).** Version badge and step
> numbers on the docs home. Cause: `--rx-primary` #9375f5 on `--rx-tag-bg` #2b2721
> (`tokens.css:51`). Fix: raise the dark `--rx-primary` to #9d82f6 (4.92:1).
