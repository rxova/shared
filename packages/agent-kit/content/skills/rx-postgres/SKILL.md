---
name: rx-postgres
description: Sets up Postgres with Drizzle ORM (default) or Prisma, covering schema, migrations, seeding, indexes, local Docker Postgres and connection pooling for serverless hosts such as Neon or the Supabase pooler. Use when an app needs a relational database, or when serverless deploys hit connection limits or migrations need to be run safely.
---

# rx-postgres

Schema in code, migrations as files committed to git, one connection string per
environment, and a seed script so the demo never starts empty.

## When to use

- The app needs a relational database from TypeScript.
- Deploys on Vercel, Netlify or Workers exhaust connections ("too many clients").
- About to change a schema that already holds demo data.

## Choices

| Need                                       | Pick                       |
| ------------------------------------------ | -------------------------- |
| SQL-like, light, works on edge runtimes    | Drizzle                    |
| Rich generated client, schema file, Studio | Prisma                     |
| Local database                             | Docker Postgres            |
| Hosted, scales to zero, branches           | Neon                       |
| Hosted with auth and storage too           | Supabase (see rx-supabase) |

## Steps

1. **Local Postgres:**
   `docker run -d --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -v pgdata:/var/lib/postgresql/data postgres:17`
   (for `postgres:18` and later, mount the volume at `/var/lib/postgresql` instead; the
   image page on Docker Hub says which path your tag uses). URL: `postgres://postgres:postgres@localhost:5432/postgres`.
2. **Install Drizzle:** `npm i drizzle-orm postgres` and `npm i -D drizzle-kit`.
3. **Schema** in `src/db/schema.ts`; config in `drizzle.config.ts`.
4. **Migrations:** `npx drizzle-kit generate` writes SQL to `drizzle/`; read it, then
   `npx drizzle-kit migrate`. `npx drizzle-kit push` (no files) is fine for throwaway
   prototyping only. `npx drizzle-kit studio` to browse data.
5. **Seed:** `src/db/seed.ts`, idempotent (upsert or `on conflict do nothing`), run with
   `npx tsx src/db/seed.ts`.
6. **Serverless:** use the provider's pooled URL for the app (Neon `-pooler` host, Supabase
   transaction pooler) and the direct URL for migrations. Neon also has a serverless driver
   (`@neondatabase/serverless`) for edge runtimes.
7. **Prisma instead:** `npx prisma init`, edit the schema, `npx prisma migrate dev --name x`
   locally and `npx prisma migrate deploy` in CI or production. Setup details (config file,
   driver adapters) changed across majors; follow prisma.io/docs for your version.

## Example

```ts
// src/db/schema.ts
import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notes_user_created_idx").on(t.userId, t.createdAt)],
);
```

```ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL! },
});
```

```ts
// src/db/index.ts
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
// prepare: false is required behind transaction-mode poolers (Supabase, PgBouncer)
const client = postgres(process.env.DATABASE_URL!, { prepare: false, max: 5 });
export const db = drizzle(client, { schema });
```

```bash
# .env.example
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres   # pooled URL in prod
DIRECT_DATABASE_URL=                                                # direct URL for migrations
```

## Indexes that matter

- Every foreign key column you filter or join on (Postgres does not index them for you).
- Composite index matching your main list query: `(user_id, created_at)` for "my items,
  newest first".
- Unique constraints for real uniqueness (emails, slugs), not app-level checks.
- Check a slow query with `explain analyze` before adding more.

## Safe migration practices

- Read every generated SQL file before applying; renames can show up as drop + add.
- Add columns as nullable or with a default; backfill; then add `not null`.
- Never edit a migration that has already run elsewhere; write a new one.
- Take a backup or branch (Neon branch, `pg_dump`) before a destructive change to shared data.
- Run migrations in one place (CI or a release step), not from every serverless instance.

## Gotchas

- Creating a new client per request in serverless leaks connections; create it at module
  scope.
- Supabase and PgBouncer in transaction mode break prepared statements; `prepare: false`.
- `timestamp` without time zone causes off-by-hours bugs; use `withTimezone: true`.
- Hosted providers usually require SSL; include `sslmode=require` if their URL does not.

## Verify it works

- Dropping the local database and running migrate plus seed from scratch succeeds.
- `drizzle-kit generate` after no schema change produces no new migration.
- The deployed app survives a burst of requests without connection errors.
