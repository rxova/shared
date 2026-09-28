---
name: rx-datadog-investigate
description: Investigates a production symptom with Datadog from Claude Code, using the Datadog MCP server tools when connected and the UI or API with curl otherwise. Scopes by service, env and version, compares before and after a deploy, follows a trace to its logs, finds the failing span or resource, checks container metrics and writes findings with links. Use when an alert fires, error rate or latency rises, or someone asks what changed after a release.
---

# rx-datadog-investigate

Start from the symptom, narrow the scope, then prove the cause with two independent signals
(for example a trace and a metric). Read-only: do not mute, edit or create anything in Datadog
unless the user asks.

## When to use

- A monitor alerted, or someone reports errors or slowness.
- A deploy went out and you need to know whether it made things worse.
- You have a trace id, request id or error message and need the story around it.

## Connect

- **MCP (preferred):** install the official Datadog plugin for Claude Code, or add the remote
  server with `claude mcp add --transport http datadog-mcp <endpoint for your Datadog site>`.
  Auth is OAuth as your Datadog user, so you see what your role sees. Extra toolsets (APM,
  dashboards, Kubernetes) are enabled with `?toolsets=` on the endpoint.
  https://docs.datadoghq.com/mcp_server/setup/ and https://docs.datadoghq.com/mcp_server/tools/
- **Fallback:** the Datadog UI with the queries below, or the API with keys from env vars
  (`DD_API_KEY`, `DD_APP_KEY`, and `DD_SITE` such as `datadoghq.eu`). Use a scoped, read-only
  application key. Never paste key values into chat, files or commits.

## Steps

1. **Pin the symptom.** Which monitor or report, which service, which env, since when (UTC).
   Pull the alert: `search_datadog_monitors` (status alert), `search_datadog_events` for the
   trigger time.
2. **Scope.** Confirm the service and env exist and which versions are live:
   `search_datadog_entities` or APM > Services. Everything after this filters on
   `service:<name> env:<env>`.
3. **Look for change.** Deploys, config and infrastructure changes near the start time:
   `search_datadog_events`, and change stories from the APM toolset. A new `version` value
   appearing at the start of the problem is the first lead, not yet the answer.
4. **Compare before and after.** Same query, split by `version`, over a window that covers both.
   Error rate and p95 by version with `get_datadog_metric`; if only the new version is bad,
   the deploy is the suspect.
5. **Find the failing resource and span.** `search_datadog_spans` (or `apm_search_spans`) for
   errors and slow requests, grouped by `resource_name`. Open two or three with
   `get_datadog_trace` and find the span where the error or time is actually spent (often a
   downstream call, not the entry span).
6. **Trace to logs.** Search logs for the trace id with `search_datadog_logs`. Read the
   exception and the lines just before it. If logs have no `trace_id`, note it as a gap (see
   rx-datadog-dotnet).
7. **Check the platform.** Container CPU, memory, restarts and throttling for the service's
   pods (`search_datadog_hosts`, Kubernetes toolset, metrics below). OOM kills and restarts can
   look like application errors.
8. **Confirm or drop the hypothesis.** It must explain the start time, the scope (which
   versions, pods, endpoints) and why other services are fine. If not, go back to step 3.
9. **Write findings** in the format below with links for every claim.

## Query syntax

```text
# Logs (Log Explorer)
service:orders-api env:prod status:error
service:orders-api env:prod @http.status_code:>=500 -@http.url_details.path:"/health"
trace_id:<trace id>

# Spans / traces (Trace Explorer)
service:orders-api env:prod status:error
service:orders-api env:prod resource_name:"POST /orders" @duration:>2s
service:orders-api env:prod version:2025.10.3 status:error

# Metrics (use the span name shown on the service page)
sum:trace.aspnet_core.request.errors{service:orders-api,env:prod} by {version}.as_count()
  / sum:trace.aspnet_core.request.hits{service:orders-api,env:prod} by {version}.as_count()
p95:trace.aspnet_core.request{service:orders-api,env:prod} by {version}
sum:kubernetes.containers.restarts{kube_deployment:orders-api,env:prod}
avg:container.memory.usage{kube_deployment:orders-api} by {pod_name}
```

## Example

API fallback when MCP is not connected (US1 shown; use your site):

```bash
curl -s -X POST "https://api.${DD_SITE:-datadoghq.com}/api/v2/logs/events/search" \
  -H "DD-API-KEY: ${DD_API_KEY}" -H "DD-APPLICATION-KEY: ${DD_APP_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"filter":{"query":"service:orders-api env:prod status:error","from":"now-1h","to":"now"},
       "sort":"-timestamp","page":{"limit":50}}'

curl -s -G "https://api.${DD_SITE:-datadoghq.com}/api/v1/query" \
  -H "DD-API-KEY: ${DD_API_KEY}" -H "DD-APPLICATION-KEY: ${DD_APP_KEY}" \
  --data-urlencode "from=$(( $(date +%s) - 7200 ))" --data-urlencode "to=$(date +%s)" \
  --data-urlencode "query=p95:trace.aspnet_core.request{service:orders-api,env:prod} by {version}"
```

Spans use `POST /api/v2/spans/events/search`. Endpoints and bodies:
https://docs.datadoghq.com/api/latest/

Findings report:

> **Symptom:** 5xx on `orders-api` prod rose from 0.2% to 6% at 14:05 UTC.
> **Cause (high confidence):** version `2025.10.3`, deployed 14:02, times out calling
> `inventory-api` on `POST /orders`; the old version on the remaining pods is clean.
> **Evidence:** error rate by version [metric link]; three failing traces with the timeout in
> the `http.request` span [trace links]; matching `TaskCanceledException` logs [log link].
> **Ruled out:** pod restarts and memory (flat) [dashboard link].
> **Next:** roll back or raise the client timeout; owner decides.

## Gotchas

- Metric and log timestamps are UTC; say so in the report.
- `as_count()` matters for rates of count metrics; without it the division can mislead.
- Sampled traces are examples, not totals. Use trace metrics for rates and percentiles.
- A span name differs by framework and tracer version; read it from the service page.
