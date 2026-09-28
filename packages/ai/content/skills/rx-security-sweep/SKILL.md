---
name: rx-security-sweep
description: Runs a 30-minute security sweep before a demo or launch covering secrets, auth, authorisation, input validation, CORS, cost caps, dependencies and headers, ending in a findings table. Use before a public demo, before sharing a URL widely, or before making a repository public.
---

# rx-security-sweep

A hackathon app goes public the moment its URL is on a slide. Thirty minutes of checking the
usual holes beats a leaked key or a surprise bill. For a deeper review, use the `rx-security`
agent.

## When to use

- Before a demo, submission or launch where the URL or repository becomes public.
- After adding auth, a database, file uploads or a paid API (LLMs especially).
- Before flipping a repository from private to public.

## Steps

Timebox each step; write every finding down as you go, fix later in priority order.

1. **Secrets (5 min).**
   - Scan the tree and history with a scanner such as gitleaks or trufflehog if available
     (`gitleaks detect`, `trufflehog git file://.`), or at least
     `git grep -nIE "(sk-|api[_-]?key|secret|password|BEGIN .*PRIVATE KEY)"` and
     `git log -p | grep -nE "sk-|api_key|secret"`.
   - Check the client bundle: no server keys in variables with a public prefix
     (`NEXT_PUBLIC_`, `VITE_`, `EXPO_PUBLIC_`).
   - Anything leaked, even briefly, even in a deleted commit: **rotate it** at the provider
     first. Rewriting history does not un-leak a key.
2. **`.env` handling (1 min).** `.env*` in `.gitignore` (except `.env.example`);
   `git ls-files | grep -i env` shows no real env file.
3. **Authentication (5 min).** List every route and API handler. Each non-public one checks
   the session on the server, not only by hiding a button. Try each one logged out with
   `curl`.
4. **Authorisation (5 min).** A user can only read and change their own rows. Change an id in
   a URL or request body to another user's and confirm you get 403 or 404. On Supabase: RLS
   enabled on every table with policies, and the service-role key only on the server.
5. **Input validation (3 min).** Validate at the boundary with a schema (zod, valibot,
   pydantic, or the framework's own). Parameterised queries only; no string-built SQL.
   Uploads: size and type limits. Rendering user or LLM text: no raw HTML injection.
6. **CORS (2 min).** No `Access-Control-Allow-Origin: *` together with credentials; list the
   real origins.
7. **Cost caps (4 min).** Anything that costs money per call (LLM, OCR, SMS, email, maps):
   require auth, rate limit per user or IP, cap input size and output tokens, and set a spend
   limit or budget alert at the provider.
8. **Dependencies (2 min).** `pnpm audit` / `npm audit` / `pip-audit` / `govulncheck ./...`;
   fix criticals on reachable code, note the rest.
9. **Headers (3 min).** Check the deployed URL with `curl -sI https://...`: HTTPS only,
   `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, a framing policy
   (`X-Frame-Options` or CSP `frame-ancestors`), a Content-Security-Policy if time allows.
   Cookies: `HttpOnly`, `Secure`, `SameSite`.

## Findings

Report as a table, most severe first. Severity: **critical** (exploitable now, data or money
at risk), **high**, **medium**, **low**.

| #   | Severity | Area | Finding | Location | Fix | Status |
| --- | -------- | ---- | ------- | -------- | --- | ------ |

Fix every critical and high before the demo. Say plainly what was not checked.

## Example

| #   | Severity | Area    | Finding                                   | Location                     | Fix                                                     | Status |
| --- | -------- | ------- | ----------------------------------------- | ---------------------------- | ------------------------------------------------------- | ------ |
| 1   | critical | Secrets | LLM key committed in an early commit      | `a1b2c3d`, `.env`            | Rotated key, removed file, added to `.gitignore`        | fixed  |
| 2   | high     | Cost    | `/api/summarize` open to anyone, no limit | `app/api/summarize/route.ts` | Require session, 20 calls/user/hour, max 4k input chars | fixed  |
| 3   | high     | Authz   | `receipts` table had RLS disabled         | Supabase                     | Enabled RLS, owner-only policies                        | fixed  |
| 4   | medium   | CORS    | `*` with credentials                      | `middleware.ts`              | Allow the app origin only                               | fixed  |
| 5   | low      | Headers | No CSP                                    | host config                  | Noted for after the demo                                | open   |

Not checked: the payments webhook signature (handed to the `rx-security` agent).
