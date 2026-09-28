---
name: rx-auth
description: Chooses and wires authentication quickly with Supabase Auth, Clerk, Auth.js, Better Auth or Cognito, covering sign-in method, sessions versus JWTs, protecting server routes, a seeded demo account and callback URLs. Use when an app needs login, or when sign-in works locally but fails on a preview or production URL.
---

# rx-auth

Use a provider, not your own password code. Pick the one that matches your data layer, give
judges a one-click demo login, and check auth on the server for every protected action.

## When to use

- The app needs users, sign-in, or per-user data.
- OAuth or magic links break on a deployed or preview URL.
- A route or action is "protected" only by hiding a button.

## Which provider

| Situation                                                     | Pick                                                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Already using Supabase for the database                       | Supabase Auth (RLS uses the user id directly)                                        |
| Want hosted, polished sign-in UI in minutes, Next.js or Expo  | Clerk                                                                                |
| Own database, want auth tables and sessions in it, TypeScript | Better Auth                                                                          |
| Existing Auth.js (NextAuth) code                              | Auth.js; for new projects check authjs.dev for its current status and recommendation |
| Must stay inside AWS                                          | Cognito                                                                              |

## Sign-in method for a demo

| Method                 | Good for                             | Watch out                                          |
| ---------------------- | ------------------------------------ | -------------------------------------------------- |
| Email + password       | Seeded demo account, offline judging | Needs reset flow for real users                    |
| Magic link / OTP       | No passwords                         | Email delivery delays and spam folders on demo day |
| OAuth (Google, GitHub) | One click for real users             | Callback URLs per environment                      |

Always ship a seeded demo account (`demo@yourapp.dev` / password in the README or on the
login page), or a "Try the demo" button that signs into it.

## Session or JWT

- **Cookie session** (server-rendered web apps): httpOnly, Secure, SameSite=Lax cookie; the
  server reads it on each request. Best default for web.
- **Bearer JWT** (mobile apps, separate APIs): the client sends `Authorization: Bearer`; the
  API verifies the signature and expiry with the provider's JWKS or SDK.
- Never store tokens in `localStorage` if a cookie session is available.

## Steps

1. Create the provider project; put keys in `.env.local` and `.env.example` (names only).
2. Add sign-in and sign-out pages using the provider's components or SDK.
3. **Protect on the server.** In every route handler, server action and API endpoint that
   touches user data, get the user from the session or token and return 401 if missing.
   Page-level redirects (Next.js `proxy.ts`, route guards) are for UX, not security.
4. Scope data by user id in queries (or RLS policies with Supabase).
5. Seed the demo account with a script, not by hand.
6. Register every callback URL (see below).

## Example

```ts
// Next.js route handler with Supabase Auth (server-side check)
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  const store = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (all) => all.forEach(({ name, value, options }) => store.set(name, value, options)),
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser(); // verifies with the auth server
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabase.from("notes").select("*"); // RLS limits rows to this user
  return Response.json(data);
}
```

```ts
// scripts/seed-demo-user.ts (server-only secret key; run once per environment)
import { createClient } from "@supabase/supabase-js";
const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
await admin.auth.admin.createUser({
  email: process.env.DEMO_EMAIL!,
  password: process.env.DEMO_PASSWORD!,
  email_confirm: true,
});
```

## Callback URL gotchas

- Register all of: `http://localhost:3000`, the production domain, and the preview pattern
  (Vercel previews change per branch; use the provider's wildcard support or a stable
  preview alias).
- The app's own "site URL" or base URL env var must match the environment it runs in; a
  production build pointing at `localhost` sends users nowhere.
- OAuth apps at Google or GitHub have their own redirect URI list, separate from the auth
  provider's allow-list. Both must match exactly, including trailing slash and scheme.
- Mobile apps need a custom scheme redirect (`myapp://auth/callback`).
- Cookies set on `localhost:3000` are not sent to an API on `localhost:8000` unless CORS
  and SameSite settings allow it; prefer the same origin or bearer tokens.

## Verify it works

- Sign in with the demo account on the deployed URL, not only locally.
- Call a protected API with no cookie or token (`curl -i`): expect 401.
- Sign in as user A, request user B's resource by id: expect 404 or 403.
