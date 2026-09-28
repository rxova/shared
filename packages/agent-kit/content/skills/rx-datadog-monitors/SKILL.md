---
name: rx-datadog-monitors
description: Defines Datadog monitors, SLOs and dashboards as code with the Terraform datadog provider (or the API), covering the baseline monitors every service needs, thresholds and windows, notification routing, runbook links, multi-alert by env, noise control, testing a monitor and keeping monitors valid when services, spans or resources are renamed during a migration. Use when a service goes to production, when alerts are noisy or missing, or when a rename or runtime upgrade may have broken monitors.
---

# rx-datadog-monitors

A monitor is only useful if it fires when users hurt, stays quiet otherwise, and tells the
person paged what to do. Keep every monitor in code, reviewed like any other change.

## When to use

- A service is about to take production traffic and has no monitors.
- Alerts are noisy, ignored, or missed an incident.
- A migration renamed a service, span or resource, or changed `env` or `version` tagging.
- You need an SLO or a service dashboard that survives redeploys.

## Baseline per service

| Monitor             | Query basis                                    | Start with                      |
| ------------------- | ---------------------------------------------- | ------------------------------- |
| Error rate          | `trace.<span>.errors` / `trace.<span>.hits`    | > 5% over 5 min, warn at 2%     |
| Latency p95 / p99   | `p95:trace.<span>` / `p99:trace.<span>`        | p95 over the SLO target, 10 min |
| Throughput drop     | `trace.<span>.hits` vs the same time last week | below 50%, 15 min, prod only    |
| Pod restarts        | `kubernetes.containers.restarts`               | any increase over 10 min        |
| Queue lag (workers) | broker lag or age of oldest message            | above what the SLA can absorb   |

Tune from real data: look at 2 to 4 weeks of the metric before choosing a number. Low-traffic
services need longer windows or a minimum hit count, or a single failure pages someone.

## Steps

1. **Keys.** Terraform and API calls need an API key and an application key, from env vars
   (`DD_API_KEY`, `DD_APP_KEY`, `DD_HOST` for non-US1 sites) or a secret store, and a scoped
   application key limited to what the pipeline manages. The APP key lives only in CI or the
   operator's shell, never in a running service.
2. **Tag every monitor** with `service`, `env`, `team`, and `managed-by:terraform`, so people
   can find them and nobody edits them in the UI.
3. **Multi-alert by env** (`by {env}` or one monitor per env), and route by env: prod pages,
   staging goes to a channel.
4. **Message.** What broke, the impact, a link to the runbook and the service dashboard, and
   who is notified. Use `{{#is_alert}}` / `{{#is_recovery}}` blocks so recovery does not page.
5. **Noise control.** `require_full_window` for sparse metrics, `evaluation_delay` for
   delayed cloud metrics, a warning threshold below critical, `renotify_interval` only for
   pages, and `on_missing_data` chosen deliberately (throughput drop: notify; errors: resolve).
6. **SLOs.** A metric SLO on good/total requests per service, 30-day window, with a burn-rate
   alert rather than a raw threshold for paging.
7. **Dashboards.** One per service with the same `service`/`env` template variables, built
   from the same queries the monitors use.
8. **Test before merging.** `terraform plan` validates queries against the API (provider
   `validate` is on by default). With the API, `POST /api/v1/monitor/validate`. After apply,
   check the monitor's history graph against a known past incident; if it would not have fired,
   the threshold is wrong. For routing, use the monitor's test-notification option on a
   non-prod monitor.
9. **After a rename or upgrade.** List monitors and dashboards that reference the old service,
   span or resource name (`GET /api/v1/monitor?monitor_tags=service:<old>`, or search the
   Terraform code). Update them in the same change as the rename. A monitor on a metric that
   no longer reports sits in "No Data" and never fires: treat that as broken, not quiet.

Provider docs: https://registry.terraform.io/providers/DataDog/datadog/latest/docs. Monitor
types and options: https://docs.datadoghq.com/monitors/. Check the current docs for argument
names; the provider evolves.

## Example

```hcl
terraform {
  required_providers {
    datadog = { source = "DataDog/datadog" }
  }
}
provider "datadog" {} # reads DD_API_KEY, DD_APP_KEY, DD_HOST from the environment

locals {
  svc  = "orders-api"
  span = "aspnet_core.request" # read the real name from the APM service page
  tags = ["service:orders-api", "team:orders", "managed-by:terraform"]
}

resource "datadog_monitor" "error_rate" {
  name  = "[${local.svc}] error rate high on {{env.name}}"
  type  = "query alert"
  query = "sum(last_5m):sum:trace.${local.span}.errors{service:${local.svc}} by {env}.as_count() / sum:trace.${local.span}.hits{service:${local.svc}} by {env}.as_count() > 0.05"

  message = <<-EOT
    {{#is_alert}}Error rate is {{value}} on ${local.svc} ({{env.name}}).
    Runbook: https://runbooks.example.internal/orders-api#errors
    Dashboard: https://app.datadoghq.com/dashboard/abc-123{{/is_alert}}
    {{#is_match "env.name" "prod"}}@pagerduty-orders{{/is_match}}
    {{#is_match "env.name" "staging"}}@slack-orders-alerts{{/is_match}}
  EOT

  monitor_thresholds {
    critical = 0.05
    warning  = 0.02
  }
  require_full_window = false
  on_missing_data     = "resolve"
  tags                = local.tags
}

resource "datadog_service_level_objective" "availability" {
  name = "${local.svc} availability"
  type = "metric"
  query {
    numerator   = "sum:trace.${local.span}.hits{service:${local.svc},env:prod}.as_count() - sum:trace.${local.span}.errors{service:${local.svc},env:prod}.as_count()"
    denominator = "sum:trace.${local.span}.hits{service:${local.svc},env:prod}.as_count()"
  }
  thresholds {
    timeframe = "30d"
    target    = 99.9
    warning   = 99.95
  }
  tags = local.tags
}
```

Latency: `percentile(last_10m):p95:trace.${local.span}{service:${local.svc}} by {env} > 0.8`
(seconds). Check the current monitor docs for the exact percentile query form.

API alternative for a one-off (keys from env, never inline):

```bash
curl -s -X POST "https://api.${DD_SITE:-datadoghq.com}/api/v1/monitor/validate" \
  -H "DD-API-KEY: ${DD_API_KEY}" -H "DD-APPLICATION-KEY: ${DD_APP_KEY}" \
  -H "Content-Type: application/json" -d @monitor.json
```

## Gotchas

- Editing a Terraform-managed monitor in the UI is undone on the next apply; fix it in code.
- Muting is not a fix. If a monitor needs muting weekly, change the monitor.
- A per-pod or per-host group on a service that autoscales creates a new group per pod; group
  by `env` or `service` instead, and set `new_group_delay` if you must group by pod.
