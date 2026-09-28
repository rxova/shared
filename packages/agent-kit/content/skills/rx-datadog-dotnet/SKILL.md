---
name: rx-datadog-dotnet
description: Instruments a .NET service with the Datadog tracer (Kubernetes admission controller, tracer baked into the image, or the Datadog.Trace.Bundle NuGet package), sets unified service tags, correlates logs with traces, adds runtime metrics, custom spans and DogStatsD metrics, and keeps all of it working through a .NET 6/8 to .NET 10 upgrade. Use when adding Datadog to a .NET service, when traces or log correlation stop showing up, or before and after a runtime upgrade.
---

# rx-datadog-dotnet

Automatic instrumentation does most of the work. Your job is to pick one install method, give
every signal the same `service`, `env` and `version`, and prove data arrives before calling it
done. Datadog changes fast: when a detail below is version-sensitive, check the linked page.

## When to use

- A .NET service has no traces in Datadog, or only some of them.
- Logs do not link to traces (no `trace_id` on the log line).
- The service is moving from .NET 6 or 8 to .NET 10.
- You need a span or metric for a business operation that automatic instrumentation cannot see.

## Steps

1. **Pick one install method.** Never combine them in the same process.

   | Situation                                           | Method                                             |
   | --------------------------------------------------- | -------------------------------------------------- |
   | Kubernetes with the Datadog Agent via Helm/Operator | Single Step Instrumentation / admission controller |
   | Any container, full control over the image          | Tracer `tar.gz` added to the image                 |
   | Cannot change the image or cluster                  | `Datadog.Trace.Bundle` NuGet package (not for IIS) |

   Setup: https://docs.datadoghq.com/tracing/trace_collection/automatic_instrumentation/dd_libraries/dotnet-core/
   and https://docs.datadoghq.com/tracing/trace_collection/automatic_instrumentation/single-step-apm/kubernetes/

2. **Enable the profiler hook** (not needed with the admission controller, which injects it).
   Tracer in the image:
   `CORECLR_ENABLE_PROFILING=1`, `CORECLR_PROFILER={846F5F1C-F9AE-4B07-969E-05C26BC060D8}`,
   `CORECLR_PROFILER_PATH=/opt/datadog/Datadog.Trace.ClrProfiler.Native.so`,
   `DD_DOTNET_TRACER_HOME=/opt/datadog`. With the NuGet bundle the paths sit under
   `<app dir>/datadog/` and depend on the runtime identifier (`linux-x64`, `linux-musl-x64`,
   `linux-arm64`); run `datadog/createLogPath.sh` during the image build. Set these only on the
   service process, never machine-wide.
3. **Unified service tags.** Set `DD_ENV`, `DD_SERVICE`, `DD_VERSION` on every deployment. In
   Kubernetes, put `tags.datadoghq.com/env|service|version` labels on the Deployment and the pod
   template; `version` should be the image tag or commit, set by CI, never hand-typed.
   https://docs.datadoghq.com/getting_started/tagging/unified_service_tagging/
4. **Point at the Agent.** `DD_AGENT_HOST` (default `localhost`, port 8126) or
   `DD_TRACE_AGENT_URL` (for example a Unix socket). In Kubernetes without the admission
   controller, set `DD_AGENT_HOST` from `status.hostIP`.
5. **Verify traces arrive.** Send a few requests, then check APM > Services for the service
   with the right `env` and `version`. If nothing shows, read the tracer logs in
   `/var/log/datadog/dotnet/` and confirm the Agent receives traces (`agent status`, APM section).
6. **Log correlation.** Recent tracers enable `DD_LOGS_INJECTION` by default; set it to `true`
   explicitly anyway. Serilog, NLog, log4net and Microsoft.Extensions.Logging get `dd.trace_id`,
   `dd.span_id`, `dd.env`, `dd.service`, `dd.version` added. Write logs as JSON to stdout so the
   Agent parses them without custom rules.
   https://docs.datadoghq.com/tracing/other_telemetry/connect_logs_and_traces/dotnet/
7. **Runtime metrics.** `DD_RUNTIME_METRICS_ENABLED=true` (off by default). They travel over
   DogStatsD, so port 8125/UDP or the socket must be reachable.
8. **Profiler (optional).** `DD_PROFILING_ENABLED=true`; on Linux with the tracer in the image
   it also needs the `LD_PRELOAD` value from https://docs.datadoghq.com/profiler/enabling/dotnet/.
9. **Custom spans and tags** for business operations (below). Reference the `Datadog.Trace`
   package; custom instrumentation now requires automatic instrumentation to be running, so keep
   the package in step with the attached tracer version.
10. **Custom metrics** with `DogStatsD-CSharp-Client`. Keep tag values low-cardinality: tag by
    `tenant_tier`, not `user_id`, and never by order or request id.
11. **Sampling and cost.** Trace metrics (hits, errors, latency) are computed from all traffic
    before ingestion sampling, so dashboards stay right when you sample. Use
    `DD_TRACE_SAMPLING_RULES` to lower noisy endpoints (health checks, polling) instead of
    dropping the whole service, and review ingestion in APM > Ingestion Control.

## Upgrading to .NET 10

- **Tracer version:** confirm the installed tracer lists .NET 10 as GA on
  https://docs.datadoghq.com/tracing/trace_collection/compatibility/dotnet-core/. An older tracer
  may load without error and still miss integrations.
- **All three places move together:** the tracer in the image or admission controller pin
  (`admission.datadoghq.com/dotnet-lib.version`), the `Datadog.Trace` package, and the bundle.
- **Base image:** new images (chiseled, distroless, Alpine) change the native library path and
  the runtime identifier. Re-check `CORECLR_PROFILER_PATH` and that the log folder exists.
- **Instrumentation attached:** after deploy, the service shows spans from the web framework,
  HTTP client and database, not only custom ones.
- **Tags:** `version` is the new release, `env` and `service` unchanged. A renamed service
  breaks every monitor and dashboard scoped to the old name.
- **Operation and resource names:** framework or tracer upgrades can rename spans (for example
  `aspnet_core.request` resources). Compare resource lists before and after, then update
  monitors and dashboards (see rx-datadog-monitors).
- **Logs:** a correlated log line still carries `trace_id`, and a trace still shows its logs.

## Example

```dockerfile
# Tracer baked into the image. CI downloads the tar.gz for the current release from the
# dd-trace-dotnet releases page into the build context; ADD extracts a local tar.gz.
FROM mcr.microsoft.com/dotnet/aspnet:10.0
ARG DD_TRACER_TARBALL
ADD ${DD_TRACER_TARBALL} /opt/datadog/
RUN mkdir -p /var/log/datadog/dotnet && chmod a+rwx /var/log/datadog/dotnet
ENV CORECLR_ENABLE_PROFILING=1 \
    CORECLR_PROFILER={846F5F1C-F9AE-4B07-969E-05C26BC060D8} \
    CORECLR_PROFILER_PATH=/opt/datadog/Datadog.Trace.ClrProfiler.Native.so \
    DD_DOTNET_TRACER_HOME=/opt/datadog \
    DD_LOGS_INJECTION=true \
    DD_RUNTIME_METRICS_ENABLED=true
COPY app/ /app/
WORKDIR /app
ENTRYPOINT ["dotnet", "Orders.Api.dll"]
```

```csharp
// A business span inside an automatically traced request.
using Datadog.Trace;

using var scope = Tracer.Instance.StartActive("orders.place");
scope.Span.ResourceName = "PlaceOrder";
scope.Span.SetTag("order.channel", request.Channel);
try
{
    await _orders.PlaceAsync(request, ct);
}
catch (Exception ex)
{
    scope.Span.SetException(ex);
    throw;
}
```

```csharp
// DogStatsD: host and port come from DD_AGENT_HOST / DD_DOGSTATSD_PORT when not set here.
using StatsdClient;

var statsd = new DogStatsdService();
statsd.Configure(new StatsdConfig { Prefix = "orders" });
statsd.Increment("placed", tags: new[] { "channel:web" });
```

## Gotchas

- The API key belongs to the Agent only. The service never needs it, and the APP key never goes
  into a running service. Neither goes in `appsettings*.json` or the image.
- Two installs in one process (NuGet bundle plus an admission-controller injection) fight.
- Plain-text logs without a parsing rule lose the trace link; use JSON.
- High-cardinality tags on custom metrics are billed per unique combination.
