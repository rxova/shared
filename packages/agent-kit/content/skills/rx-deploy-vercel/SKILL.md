---
name: rx-deploy-vercel
description: Deploys a web app to Vercel with the CLI, covering preview versus production, per-environment env vars, monorepo root directories, function limits, custom domains and rollback, with notes for Netlify. Use when shipping a Next.js or Vite app, or when a deploy works locally but fails, misses env vars or times out on Vercel.
---

# rx-deploy-vercel

Get a production URL early and redeploy often. Every push to a branch gives a preview URL;
only the production deploy is what judges see.

## When to use

- Shipping a Next.js, Vite, Astro or SvelteKit front end.
- A deploy builds locally but fails on Vercel, or env vars are `undefined` in production.
- The last deploy broke the demo and you need the previous one back now.

## Preview or production

| Action                                          | Result                                           |
| ----------------------------------------------- | ------------------------------------------------ |
| `vercel`                                        | Preview deployment, unique URL                   |
| `vercel --prod`                                 | Production deployment on your production domain  |
| Push to a non-production branch (Git connected) | Preview deployment                               |
| Push or merge to the production branch          | Production deployment                            |
| `vercel promote <deployment-url>`               | Make an existing deployment production           |
| `vercel rollback`                               | Point production back at the previous deployment |

## Steps

1. **Install and link:** `npm i -g vercel`, `vercel login`, then `vercel link` in the app
   folder. Connecting the Git repo in the dashboard gives automatic previews.
2. **Monorepo:** set the project's **Root Directory** to the app folder (for example
   `apps/web`) in project settings, or run the CLI from that folder. The build still sees
   the workspace if "include files outside the root directory" is enabled.
3. **Env vars per environment:**
   - `vercel env add ANTHROPIC_API_KEY production` (repeat for `preview`, `development`).
   - `vercel env pull .env.local` to fetch development values locally.
   - `vercel env ls` to see what is set where.
   - Changing a variable does not affect existing deployments; redeploy.
4. **Deploy:** `vercel` for a preview, check it, then `vercel --prod`.
5. **Custom domain:** `vercel domains add example.com` or the dashboard; add the DNS records
   it shows. HTTPS is automatic once DNS resolves.
6. **Logs:** `vercel logs <deployment-url>` or the dashboard's Logs tab.

## Function limits

Serverless and edge functions have limits on duration, bundle size, request and response
body size, and memory, and they differ by plan and runtime. Check vercel.com/docs (Functions,
"Limits") for current values. In practice:

- Long AI calls: stream the response; set `maxDuration` in the route's segment config if
  your plan allows more time.
- Large uploads: upload directly from the browser to storage (Vercel Blob, S3, Supabase
  Storage) with a signed URL instead of through a function.
- Background work after the response: use the platform's `waitUntil` helper or a queue.

## Example

```bash
# First deploy of a Next.js app in a monorepo
cd apps/web
vercel link
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add ANTHROPIC_API_KEY production
vercel env pull .env.local
vercel            # preview; open the URL and click through
vercel --prod     # production
```

```ts
// app/api/generate/route.ts: allow a longer run for this route (within plan limits)
export const maxDuration = 60;
```

## Netlify notes

- CLI: `npm i -g netlify-cli`, `netlify login`, `netlify link` or `netlify init`,
  `netlify deploy` (draft URL) and `netlify deploy --prod`.
- Env vars: `netlify env:set NAME value` with `--context production` (or `deploy-preview`).
- Monorepo: set the base directory in `netlify.toml` (`[build] base = "apps/web"`).
- SPA routing: add `/* /index.html 200` to `public/_redirects`.
- Rollback: publish an earlier deploy from the Deploys page.

## Gotchas

- `NEXT_PUBLIC_` and `VITE_` values are baked in at build time; changing them needs a
  rebuild, not just a restart.
- Preview deployments may be protected by Vercel authentication; judges or OAuth callbacks
  hitting a preview URL can get a login wall. Share the production URL.
- OAuth and auth providers need the production domain (and preview pattern) whitelisted.
- The build uses the lockfile's package manager; a missing or mixed lockfile causes
  install differences.
- Case-sensitive file systems: `import './Button'` for `button.tsx` works on macOS, fails on
  Vercel.
- Database connections from functions need a pooled connection string.

## Verify it works

- Open the production URL in a private window; sign in and complete the main flow.
- `vercel env ls` shows every required variable for production.
- Practise a rollback before demo day (`vercel rollback`, then `vercel promote` the latest
  deployment back) so you know the steps under pressure.
