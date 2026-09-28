---
name: rx-deploy-container
description: Ships an app as a container to Fly.io, Railway or any Docker host, with small multi-stage Dockerfiles for Node and Python, a health check, secrets, volumes, regions, logs, scale to zero and rollback. Use when a backend needs a long-running process, websockets, background workers or a runtime that serverless platforms do not support.
---

# rx-deploy-container

A container that builds small, listens on `$PORT` at `0.0.0.0`, answers `/health`, and reads
everything else from env will run on any of these platforms unchanged.

## When to use

- The backend needs websockets, long requests, a worker process or native dependencies.
- A Python or Node API needs a public URL fast.
- A deploy is up but the platform reports it unhealthy or it cannot reach its database.

## Which platform

| Situation                                                  | Pick                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------ |
| Fastest from a repo, database add-on in the same dashboard | Railway                                                |
| Regions close to users, volumes, scale to zero, CLI-driven | Fly.io                                                 |
| Your own VM or a sponsor's cloud                           | Plain Docker (plus Caddy for HTTPS)                    |
| Static front end                                           | Not here: use rx-deploy-vercel or rx-deploy-cloudflare |

## Steps

1. **Dockerfile** (below) plus a `.dockerignore` with `node_modules`, `.venv`, `.git`,
   `.env*`.
2. **Health endpoint:** `GET /health` returns 200 fast without calling slow dependencies.
3. **Build and run locally:** `docker build -t app .` then
   `docker run --rm -p 8080:8080 -e PORT=8080 --env-file .env app`.
4. **Fly.io:** `fly launch` (detects the Dockerfile, writes `fly.toml`; say no to deploying
   until secrets are set), `fly secrets set DATABASE_URL=... ANTHROPIC_API_KEY=...`,
   `fly deploy`. Logs: `fly logs`. Status: `fly status`.
5. **Railway:** `railway login`, `railway init` (or `railway link`), set variables in the
   dashboard or `railway variables --set "KEY=value"`, then `railway up`. Logs:
   `railway logs`. Add Postgres from the dashboard and reference its variable.
6. **Volumes (only for files that must survive restarts):** Fly `fly volumes create data
--size 1` plus a `[mounts]` entry; Railway attaches a volume to a service in the
   dashboard. Prefer a managed database or object storage over files on a volume.
7. **Rollback:** Fly `fly releases --image`, then `fly deploy --image <previous-image>`;
   Railway redeploys an earlier deployment from the dashboard.

CLI flags change; check fly.io/docs and docs.railway.com when a command is rejected.

## Example

```dockerfile
# Node (TypeScript compiled to dist/)
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER node
EXPOSE 8080
CMD ["node", "dist/index.js"]
```

```dockerfile
# Python (FastAPI with uv)
FROM python:3.12-slim AS build
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY . .
RUN uv sync --frozen --no-dev

FROM python:3.12-slim
WORKDIR /app
COPY --from=build /app /app
ENV PATH="/app/.venv/bin:$PATH"
RUN useradd -m app && chown -R app /app
USER app
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
```

```toml
# fly.toml (relevant parts)
primary_region = "ams"
[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0
[[http_service.checks]]
  path = "/health"
  interval = "15s"
  timeout = "2s"
```

## Gotchas

- Listening on `127.0.0.1` or a hard-coded port makes the platform's health check fail.
- Scale to zero means a cold start on the first request; for the live demo set
  `min_machines_running = 1` (Fly) or disable sleeping, then turn it back off after.
- `.env` copied into the image leaks secrets to anyone with the image; `.dockerignore` it.
- Apple Silicon builds `arm64` images; platforms that build remotely avoid the mismatch.
  When pushing your own image, use `docker build --platform linux/amd64`.
- A Fly volume belongs to one machine in one region; two machines do not share it.
- Run database migrations as a release step (Fly `[deploy] release_command`), not in every
  container start.

## Verify it works

- `curl -i https://<app-url>/health` returns 200.
- Restart or redeploy, then confirm data still exists (database or volume, not the
  container's disk).
- Logs show the app listening on the expected port and no crash loop.
