---
name: rx-ui-kit
description: Builds a clean, accessible UI fast with Tailwind CSS, shadcn/ui and lucide icons, including a layout shell, dark mode, responsive rules and loading, empty and error states. Use when a demo needs to look good quickly or when adding forms, dialogs, toasts or a theme toggle.
---

# rx-ui-kit

Judges see the UI before the code. Use copy-in components you own (shadcn/ui), one spacing
scale, one accent colour, and make every screen handle loading, empty and error.

## When to use

- A new React app needs a polished look in under an hour.
- Adding forms, dialogs, dropdowns, toasts or a dark mode toggle.
- A demo screen looks unfinished: blank while loading, broken when empty.

## Which pieces

| Need                                                      | Use                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| Styling                                                   | Tailwind CSS (installed by the scaffolder or the shadcn CLI) |
| Components (button, input, dialog, dropdown, card, table) | shadcn/ui, added one at a time                               |
| Toasts                                                    | `sonner` (shadcn ships a wrapper)                            |
| Icons                                                     | `lucide-react`                                               |
| Dark mode in Next.js                                      | `next-themes` with `attribute="class"`                       |
| Dark mode in Vite                                         | a small provider that toggles `.dark` on `<html>`            |
| Charts                                                    | shadcn chart components (Recharts under the hood)            |

## Steps

1. **Init shadcn/ui** in an existing Next or Vite project: `npx shadcn@latest init`. It
   writes `components.json`, the CSS variables and a `cn()` helper. The CLI and Tailwind
   setup change often; follow ui.shadcn.com/docs/installation for your framework.
2. **Add only what you use:** `npx shadcn@latest add button input label card dialog
dropdown-menu skeleton sonner`. Components land in `components/ui/`; edit them freely.
3. **Theme with CSS variables.** Colours live as tokens (`--background`, `--foreground`,
   `--primary`, ...) in the global CSS with a `.dark` override block. Change the accent by
   editing `--primary` in both blocks, not by sprinkling colour classes.
4. **Dark mode (Next):** `npm i next-themes`, wrap the body in
   `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>`
   and put `suppressHydrationWarning` on `<html>`.
5. **Layout shell:** a sticky header, an optional sidebar that collapses on mobile, and a
   centred content column (`mx-auto max-w-5xl px-4`).
6. **Mount `<Toaster />` once** at the root; call `toast.success()` / `toast.error()`.
7. **Responsive rules:** design at 375px first; add `md:` and `lg:` for wider screens. No
   fixed widths on containers; tables scroll horizontally inside `overflow-x-auto`.

## Example

```tsx
import { Loader2, Inbox, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type Props<T> = {
  data?: T[];
  isLoading: boolean;
  error?: Error | null;
  onRetry: () => void;
  render: (item: T) => React.ReactNode;
};

export function ListState<T>({ data, isLoading, error, onRetry, render }: Props<T>) {
  if (isLoading)
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  if (error)
    return (
      <div role="alert" className="flex flex-col items-center gap-2 py-10 text-center">
        <AlertTriangle className="size-6 text-destructive" aria-hidden />
        <p className="text-sm text-muted-foreground">Could not load. {error.message}</p>
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  if (!data?.length)
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <Inbox className="size-6 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">Nothing here yet.</p>
      </div>
    );
  return <ul className="divide-y rounded-md border">{data.map(render)}</ul>;
}

export function SaveButton({ pending }: { pending: boolean }) {
  return (
    <Button disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}Save
    </Button>
  );
}
```

## Accessibility that matters in a demo

- Every input has a `<Label htmlFor>`; errors use `aria-invalid` and a message with
  `role="alert"`.
- Use the shadcn `Dialog`/`AlertDialog` (Radix): focus trap, Escape and focus return come
  free. Always give the dialog a `DialogTitle`, even if visually hidden.
- Icon-only buttons need `aria-label`. Decorative icons get `aria-hidden`.
- Keep the visible focus ring; never `outline-none` without a replacement.
- Muted text on muted backgrounds is the usual contrast failure; check it in both themes.

## Gotchas

- Dark classes do nothing if the `dark` variant is not wired to the `.dark` class; the shadcn
  init does this, a hand-rolled Tailwind setup may not.
- Flash of the wrong theme on load: the theme must be set before paint (next-themes does it).
- Toasts for success only; show form errors inline where the user is looking.
- Do not install a second component library alongside shadcn; styles will fight.

## Verify it works

- Toggle dark mode on every screen; nothing stays white.
- Resize to 375px: no horizontal page scroll, buttons remain tappable (about 44px).
- Tab through a form and a dialog with the keyboard only.
- Throttle the network in DevTools: skeletons show, then content; kill the API: error state.
