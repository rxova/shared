---
name: rx-kickoff
description: Runs hour zero of a hackathon, from a one-sentence idea to a deployed hello-world and a slice plan. Use at the very start of a hackathon or any short build, before anyone writes feature code.
---

# rx-kickoff

The first hour decides whether the last hour is a demo or a scramble. Spend it on scope, a
stack everyone knows, and a live URL, not on features.

## When to use

- A hackathon, game jam or short internal build is starting now.
- The team has an idea but no repository, no host and no agreed scope.
- Work has started without a shared plan and people are already colliding.

## Steps

1. **Say the idea in one sentence.** "X helps Y do Z." If it needs "and", pick one half.
2. **Name the judged moment.** The ten seconds of the demo that make judges lean in: what is
   on screen, what the presenter clicks, what changes. Write it down; everything serves it.
3. **Cut to one golden path.** List every feature you want, then keep only what the golden
   path touches. Everything else goes on a `won't (this time)` list. Fake what you can:
   hard-coded users, seeded data, one happy-path input.
4. **Pick a boring stack.** The one most of the team has shipped before. A new framework
   costs hours you do not have. Decide now: language, framework, database (or none), host,
   package manager.
5. **Create the repository.**
   - Scaffold with the framework's own generator; commit that untouched as the first commit.
   - Add `.gitignore` with `.env*` (keep `.env.example`), `node_modules`, build output.
   - Add `CLAUDE.md` (and an `AGENTS.md` pointing at it, or a copy, if other tools are used).
   - Add one `verify` script that runs lint, typecheck, tests and build.
6. **Deploy hello-world to the real host in the first hour.** Not "later". Push, connect the
   host, set one environment variable, open the public URL on a phone. Deploy problems found
   now cost minutes; found at the end they cost the demo. The `rx-deployer` agent can help.
7. **Write the slice plan.** Hand the golden path to the `rx-slice` skill (or the
   `rx-planner` agent) and get 4 to 8 slices, riskiest first, each with an owner.
8. **Set the clock.** Agree checkpoints and a freeze time with the `rx-timebox` skill.

## Hour-zero checklist

- [ ] One-sentence idea and the judged moment written in `README.md`
- [ ] Golden path and `won't` list agreed by everyone
- [ ] Repo created, everyone can push, main is protected or at least agreed as "always works"
- [ ] `CLAUDE.md` committed
- [ ] Hello-world live at the public URL, opened on a phone
- [ ] Slice plan with owners
- [ ] Checkpoints and freeze time in the team chat

## Example

A filled-in `CLAUDE.md` skeleton for a two-day build:

```markdown
# Receipt Splitter

Snap a restaurant receipt, tag who had what, get a payment link per person.
Judged moment: photo in, three payment links out, under 10 seconds.

## Stack

Next.js (App Router), TypeScript, Supabase (Postgres + auth), deployed on Vercel.
Package manager: pnpm (see pnpm-lock.yaml). Node version: see .nvmrc.

## Commands

- `pnpm dev` - local server on http://localhost:3000
- `pnpm verify` - lint, typecheck, tests, build (run before every push)
- `pnpm db:seed` - reset and seed demo data
- `pnpm test:e2e` - Playwright smoke suite

## Conventions

- Server actions in `app/actions/`, one file per domain.
- Money is integer cents everywhere; format only in the UI.
- Branches `feat/<topic>` or `fix/<topic>`; small PRs into main; main must always deploy.

## Do not touch

- `supabase/migrations/` already applied: add a new migration instead of editing one.
- `lib/ocr.ts` is owned by Dana until the OCR slice merges.
- Never commit `.env.local`; add new keys to `.env.example` with a placeholder.

## Out of scope

Multi-currency, group history, native apps.
```
