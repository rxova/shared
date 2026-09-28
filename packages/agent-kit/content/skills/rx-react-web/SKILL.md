---
name: rx-react-web
description: Sets up and builds a React web app with Next.js (App Router) or a Vite SPA, including data fetching, forms, validation and env vars. Use when starting a React front end, choosing between Next and Vite, or wiring server components, route handlers, server actions, TanStack Query or react-hook-form.
---

# rx-react-web

Pick the framework by where your server logic lives, then keep to one data pattern per app.
Mixing three fetching styles is how hackathon apps break at 3am.

## When to use

- Starting a React front end and deciding between Next.js and Vite.
- Adding data fetching, a form, or env vars to an existing React app.
- Debugging "window is not defined", hydration errors, or env vars that come back `undefined`.

## Which one

| Situation                                                      | Pick                                |
| -------------------------------------------------------------- | ----------------------------------- |
| Need SEO, server-side secrets, API routes and UI in one deploy | Next.js (App Router)                |
| Separate backend already exists (FastAPI, Hono, Supabase)      | Vite SPA                            |
| Dashboard behind login, no SEO, fastest dev loop               | Vite SPA                            |
| Deploying to Vercel with AI calls that need a server key       | Next.js                             |
| Static marketing page plus a small app                         | Next.js, or Vite plus a static host |

## Steps

1. **Scaffold.**
   - Next: `npx create-next-app@latest my-app` (accept TypeScript, Tailwind, App Router).
   - Vite: `npm create vite@latest my-app -- --template react-ts`.
2. **Add the basics:** `npm i @tanstack/react-query react-hook-form zod @hookform/resolvers`.
3. **Env vars.** Only prefixed names reach the browser, and they are inlined at build time:
   - Next: `NEXT_PUBLIC_*` in client code; everything else is server-only.
   - Vite: `VITE_*` via `import.meta.env.VITE_*`; nothing else is exposed.
   - Commit a `.env.example`, keep `.env.local` in `.gitignore`.
4. **Next.js: decide server vs client per component.**
   - Default is a Server Component: can `await` data, read secrets, cannot use state, effects
     or browser APIs.
   - Add `"use client"` at the top only for interactivity (state, handlers, hooks). Push it as
     far down the tree as possible.
   - Route handlers: `app/api/<name>/route.ts` exporting `GET`, `POST`, etc.
   - Server actions: `"use server"` functions called from forms or client code. Validate the
     input and check auth inside every action; they are public POST endpoints.
   - Code that runs before routes lives in `proxy.ts` (formerly `middleware.ts` before
     Next.js 16). Check the Next.js docs (nextjs.org/docs) for your version.
5. **Vite: fetch with TanStack Query.** Wrap the app in `QueryClientProvider`, use
   `useQuery` for reads and `useMutation` plus `invalidateQueries` for writes. In Next, use it
   only in client components that need live or refetching data.
6. **Forms:** one zod schema, shared by the client form and the server handler.

## Example

```ts
// lib/schemas.ts (shared)
import { z } from "zod";
export const todoSchema = z.object({ title: z.string().min(1, "Required").max(120) });
export type TodoInput = z.infer<typeof todoSchema>;
```

```tsx
// components/todo-form.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { todoSchema, type TodoInput } from "@/lib/schemas";

export function TodoForm() {
  const qc = useQueryClient();
  const form = useForm<TodoInput>({ resolver: zodResolver(todoSchema) });
  const create = useMutation({
    mutationFn: async (data: TodoInput) => {
      const res = await fetch("/api/todos", { method: "POST", body: JSON.stringify(data) });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      form.reset();
      qc.invalidateQueries({ queryKey: ["todos"] });
    },
  });
  return (
    <form onSubmit={form.handleSubmit((d) => create.mutate(d))}>
      <input {...form.register("title")} aria-invalid={!!form.formState.errors.title} />
      {form.formState.errors.title && <p role="alert">{form.formState.errors.title.message}</p>}
      <button disabled={create.isPending}>Add</button>
    </form>
  );
}
```

```ts
// app/api/todos/route.ts
import { todoSchema } from "@/lib/schemas";
export async function POST(req: Request) {
  const parsed = todoSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ issues: parsed.error.issues }, { status: 400 });
  // insert into the database here
  return Response.json({ id: crypto.randomUUID(), ...parsed.data }, { status: 201 });
}
```

## Gotchas

- `window`/`localStorage` in a Server Component, or at module top level of a client one,
  crashes the server render. Read them inside `useEffect`.
- Hydration mismatch: dates, `Math.random()` or locale formatting that differ between
  server and browser. Render them on the client or pass them from the server.
- Changing an env var needs a dev-server restart and, when deployed, a rebuild.
- A secret in `NEXT_PUBLIC_` or `VITE_` is public. Rotate it if it ever shipped.
- Vite SPA on a static host needs a rewrite of all paths to `index.html` for client routing.
- Next caching rules change between majors; if data looks stale, check the caching page of
  the docs for your version before adding workarounds.

## Verify it works

- `npm run build` passes (it catches server/client boundary mistakes that dev does not).
- Load the page with JavaScript disabled (Next): server content still renders.
- Submit the form with an empty value: the error shows, and the network tab shows no request.
