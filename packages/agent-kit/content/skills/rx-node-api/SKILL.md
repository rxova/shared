---
name: rx-node-api
description: Builds a typed TypeScript HTTP API with Hono (default) or Fastify/Express, with zod validation, JSON problem errors, auth middleware, CORS, logging and tests. Use when a project needs a Node, Bun or Workers backend, or when an existing API lacks validation, consistent errors or tests.
---

# rx-node-api

One router, validation at the edge of every route, one error shape, and tests that call the
app in memory. Hono is the default because the same code runs on Node, Bun and Workers.

## When to use

- A separate backend is needed (mobile app, several front ends, webhooks).
- An API returns a mix of HTML errors, strings and objects, or crashes on bad input.
- You need to move an API between Node and Cloudflare Workers without rewriting it.

## Which framework

| Situation                                                | Pick                           |
| -------------------------------------------------------- | ------------------------------ |
| New API, may deploy to Workers or Bun                    | Hono                           |
| Heavy Node plugin needs, schema-first performance        | Fastify                        |
| Existing Express code or a middleware you cannot replace | Express                        |
| API only serves one Next.js app                          | Next.js route handlers instead |

## Steps

1. **Scaffold:** `npm create hono@latest api` and pick the `nodejs` (or `bun`,
   `cloudflare-workers`) template. Then `npm i zod @hono/zod-validator`.
2. **Config from env, validated once** at startup with zod; fail fast on missing values.
   Commit `.env.example`; load `.env` locally with `node --env-file=.env` or the runtime's
   own loader.
3. **Validate input** with `zValidator('json' | 'query' | 'param', schema)` on each route.
4. **One error shape.** Throw `HTTPException` for expected failures; `app.onError` turns
   everything into `application/problem+json` (`type`, `title`, `status`, `detail`). Never
   leak stack traces in production.
5. **Auth middleware:** read `Authorization: Bearer <token>`, verify it (your auth provider's
   SDK or `hono/jwt`), put the user on the context with `c.set('user', ...)`.
6. **CORS:** `hono/cors` with an explicit origin list from env. `*` is fine only for public,
   unauthenticated, cookie-less endpoints.
7. **Logging:** `hono/logger` for requests; log errors with a request id.
8. **OpenAPI (optional):** `@hono/zod-openapi` generates a spec from the same zod schemas.
   Fastify has `@fastify/swagger`.
9. **Tests** with `app.request()` (Hono), `fastify.inject()` or `supertest` (Express).

## Example

```ts
// src/app.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

type Env = { Variables: { userId: string } };
export const app = new Hono<Env>();

app.use("*", logger());
app.use("*", cors({ origin: (process.env.CORS_ORIGINS ?? "").split(","), credentials: true }));

app.get("/health", (c) => c.json({ ok: true }));

app.use("/api/*", async (c, next) => {
  const token = c.req.header("authorization")?.replace(/^Bearer /, "");
  if (!token) throw new HTTPException(401, { message: "Missing token" });
  c.set("userId", await verifyToken(token)); // your provider's verify call
  await next();
});

const NoteIn = z.object({ text: z.string().min(1).max(500) });
app.post("/api/notes", zValidator("json", NoteIn), (c) => {
  const { text } = c.req.valid("json");
  return c.json({ id: crypto.randomUUID(), text, owner: c.get("userId") }, 201);
});

app.onError((err, c) => {
  const status = err instanceof HTTPException ? err.status : 500;
  if (status === 500) console.error(err);
  return c.json(
    { type: "about:blank", title: status === 500 ? "Internal error" : err.message, status },
    status,
    { "content-type": "application/problem+json" },
  );
});

async function verifyToken(token: string): Promise<string> {
  if (token !== process.env.DEV_TOKEN) throw new HTTPException(401, { message: "Bad token" });
  return "demo-user";
}
```

```ts
// src/index.ts (Node)
import { serve } from "@hono/node-server";
import { app } from "./app";
serve({ fetch: app.fetch, port: Number(process.env.PORT ?? 3000) });
```

```ts
// src/app.test.ts (vitest)
import { expect, test } from "vitest";
import { app } from "./app";
test("rejects empty note", async () => {
  const res = await app.request("/api/notes", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.DEV_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ text: "" }),
  });
  expect(res.status).toBe(400);
});
```

## Gotchas

- `zValidator('json')` needs `content-type: application/json` on the request.
- Customise the validator's failure hook if you want 400s in the same problem shape.
- CORS with cookies needs an exact origin (not `*`) and `credentials: true` on both sides.
- Bind to `0.0.0.0` inside containers and read `PORT` from env; platforms assign it.
- On Workers there is no `process.env` by default; read bindings from `c.env`.
- Express 4 does not catch rejected promises from async handlers; Express 5 does.

## Verify it works

- `curl -i localhost:3000/health` returns 200.
- A bad body returns 400 JSON, a missing token 401 JSON, and a thrown bug 500 JSON without
  a stack trace.
- Tests pass in CI without a running server.
