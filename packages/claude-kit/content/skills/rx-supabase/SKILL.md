---
name: rx-supabase
description: Runs Supabase locally and in the cloud with the CLI, covering migrations, row level security policies, storage buckets, edge functions, generated TypeScript types and key handling. Use when a project uses Supabase for its database, auth or storage, or before changing its schema or policies.
---

# rx-supabase

Schema lives in migration files, access rules live in RLS policies, and the secret key lives
on the server. Develop against the local stack; push to the hosted project on purpose.

## When to use

- Starting a project on Supabase, or adding tables, policies, buckets or functions.
- Queries return empty arrays (usually RLS) or the client can read other users' rows.
- Moving schema changes from local to the hosted project.

## Keys

| Key                                                     | Where it may live                    |
| ------------------------------------------------------- | ------------------------------------ |
| Publishable key (`sb_publishable_...`, formerly `anon`) | Browser and mobile; protected by RLS |
| Secret key (`sb_secret_...`, formerly `service_role`)   | Server only; bypasses RLS            |

Check supabase.com/docs (API keys) for which key types your project has.

## Steps

1. **Local stack** (needs Docker): `npx supabase init`, then `npx supabase start`. It prints
   the local API URL, keys and Studio URL. `npx supabase stop` when done.
2. **Schema changes:** `npx supabase migration new add_notes`, write SQL in the new file
   under `supabase/migrations/`, apply locally with `npx supabase db reset` (local only: it
   wipes and replays migrations plus `supabase/seed.sql`).
3. **RLS on every table** in an exposed schema, with explicit policies (example below).
4. **Types:** `npx supabase gen types typescript --local > src/lib/database.types.ts`; pass
   the type to `createClient<Database>()`. Re-run after each migration.
5. **Storage:** create buckets in a migration or Studio; add policies on `storage.objects`.
   Use signed URLs for private files.
6. **Edge functions:** `npx supabase functions new hello`, serve locally with
   `npx supabase functions serve`, deploy with `npx supabase functions deploy hello`. Set
   secrets with `npx supabase secrets set NAME=value`.
7. **Hosted project:** `npx supabase login`, `npx supabase link --project-ref <ref>`, then
   `npx supabase db push` to apply new migrations. Review `npx supabase db diff` output
   first if you changed anything in Studio.

## Example

```sql
-- supabase/migrations/<timestamp>_add_notes.sql
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index notes_user_id_idx on public.notes (user_id);
alter table public.notes enable row level security;

create policy "read own notes" on public.notes
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert own notes" on public.notes
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own notes" on public.notes
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "delete own notes" on public.notes
  for delete to authenticated using ((select auth.uid()) = user_id);

-- private bucket, files stored under <user_id>/filename
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', false);
create policy "own folder" on storage.objects for all to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);
```

```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=          # server only, never prefixed
```

## Gotchas

- **Never run `supabase db reset --linked`** (or any reset against the hosted project) once
  it has real data; it drops everything. Reset is for the local stack.
- RLS enabled with no policy returns empty results, not an error. Check policies first.
- A table created in Studio on the hosted project is not in your migrations; pull it with
  `db diff` or `db pull` before the next `db push`, or the histories diverge.
- Using the secret key in a client bypasses every policy and exposes all data.
- `auth.uid()` wrapped in `(select ...)` lets Postgres evaluate it once per query.
- Views bypass RLS unless created with `security_invoker = true`.
- Local and hosted keys differ; keep separate `.env` files.

## Verify it works

- `npx supabase db reset` locally replays all migrations without errors.
- With the publishable key and user A's session, selecting notes returns only A's rows; with
  no session it returns none.
- `npx supabase migration list` shows local and remote in sync after a push.
