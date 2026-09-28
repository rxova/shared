---
name: rx-deploy-cloudflare
description: Builds and deploys to Cloudflare Workers (with static assets) using wrangler, covering the config file, D1, R2 and KV bindings, secrets, local dev, Hono on Workers, logs, rollback and runtime limits. Use when deploying an API or full-stack app to Cloudflare, or when a Worker behaves differently in production than in wrangler dev.
---

# rx-deploy-cloudflare

A Worker is a fetch handler plus bindings declared in one config file. Declare every
database, bucket and secret there, develop locally with the same bindings, deploy with one
command.

## When to use

- Deploying a Hono (or plain fetch) API, or a full-stack app with static assets, to
  Cloudflare.
- Adding a SQL database (D1), file storage (R2) or a key-value cache (KV).
- Something works in `wrangler dev` but not after deploy.

## Which binding

| Need                                                        | Use                                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| Relational data, SQLite semantics                           | D1                                                                        |
| Files, uploads, images                                      | R2                                                                        |
| Config, cache, sessions (eventually consistent, read-heavy) | KV                                                                        |
| External Postgres                                           | Hyperdrive in front of it                                                 |
| Static front end plus API in one deploy                     | Workers static assets (`assets` in config)                                |
| Existing Pages project                                      | Keep it; for new projects Cloudflare points to Workers with static assets |

## Steps

1. **Create:** `npm create cloudflare@latest my-app` (pick a Hono or framework template), or
   `npm create hono@latest` with the `cloudflare-workers` template.
2. **Config:** `wrangler.jsonc` is recommended for new projects (`wrangler.toml` still
   works). Set `name`, `main`, `compatibility_date` and bindings.
3. **Create resources** and paste the returned ids into the config:
   - `npx wrangler d1 create app-db`
   - `npx wrangler r2 bucket create app-uploads`
   - `npx wrangler kv namespace create CACHE`
4. **Types:** `npx wrangler types` generates the `Env` type from your config.
5. **D1 migrations:** `npx wrangler d1 migrations create app-db init`, write SQL, then
   `npx wrangler d1 migrations apply app-db --local` and later `--remote`.
6. **Secrets:** local values in `.dev.vars` (git-ignored); production with
   `npx wrangler secret put ANTHROPIC_API_KEY`. Non-secret config goes in `vars`.
7. **Local dev:** `npx wrangler dev` (uses local D1, R2 and KV by default).
8. **Deploy:** `npx wrangler deploy`. Logs: `npx wrangler tail`. Roll back:
   `npx wrangler rollback` (or pick a version in the dashboard).

## Example

```jsonc
// wrangler.jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "my-app",
  "main": "src/index.ts",
  "compatibility_date": "YYYY-MM-DD", // today's date when you create the project
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": "./public" },
  "vars": { "CORS_ORIGIN": "https://my-app.example.com" },
  "d1_databases": [{ "binding": "DB", "database_name": "app-db", "database_id": "<id>" }],
  "r2_buckets": [{ "binding": "UPLOADS", "bucket_name": "app-uploads" }],
  "kv_namespaces": [{ "binding": "CACHE", "id": "<id>" }],
}
```

```ts
// src/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  DB: D1Database;
  UPLOADS: R2Bucket;
  CACHE: KVNamespace;
  CORS_ORIGIN: string;
  ANTHROPIC_API_KEY: string;
};
const app = new Hono<{ Bindings: Bindings }>();

app.use("/api/*", (c, next) => cors({ origin: c.env.CORS_ORIGIN })(c, next));

app.get("/api/notes", async (c) => {
  const { results } = await c.env.DB.prepare(
    "select id, body from notes order by id desc limit 50",
  ).all();
  return c.json(results);
});

app.put("/api/files/:key", async (c) => {
  await c.env.UPLOADS.put(c.req.param("key"), c.req.raw.body);
  return c.body(null, 204);
});

export default app;
```

```bash
# .dev.vars (never committed); commit .dev.vars.example with names only
ANTHROPIC_API_KEY=
```

## Limits and gotchas

- CPU time, memory, request size, subrequests per request and script size are limited and
  differ between the Free and Paid plans. Check developers.cloudflare.com/workers (Platform,
  "Limits") before designing long or heavy work.
- No `process.env` by default: read config from `c.env` (Hono) or the `env` argument.
- Node built-ins need `nodejs_compat`; some npm packages that use native modules or the
  file system will not run at all.
- Global variables are not shared between requests or instances; use KV, D1 or Durable
  Objects for state.
- KV is eventually consistent: a write may not be visible elsewhere for a while. Do not use it
  for counters or anything that needs read-after-write.
- `--local` and `--remote` D1 are separate databases; apply migrations to both.
- `.dev.vars` is not deployed; every secret needs `wrangler secret put`.
- Background work after responding needs `c.executionCtx.waitUntil(promise)`.

## Verify it works

- `npx wrangler dev`, then `curl localhost:8787/api/notes` returns JSON.
- After `wrangler deploy`, the same request against the `workers.dev` URL returns the same
  shape, and `wrangler tail` shows it with no exceptions.
- `npx wrangler secret list` includes every secret the code reads.
