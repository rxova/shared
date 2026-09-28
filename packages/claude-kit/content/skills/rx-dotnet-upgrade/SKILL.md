---
name: rx-dotnet-upgrade
description: Migrates a backend service from net6.0 or net8.0 to net10.0, one service at a time, from inventory and a green baseline through packages, breaking changes, containers and CI to a shipped pull request. Use when a .NET service is on an older target framework and needs to move to .NET 10.
---

# rx-dotnet-upgrade

One service, one branch, one pull request. Prove the service works before you touch it, change
the framework, then prove it still works. A 6 to 10 jump crosses four releases of breaking
changes, so read the official lists rather than trusting memory.

## When to use

- A service targets `net6.0` (out of support since November 2024) or `net8.0` and must move
  to `net10.0` (LTS).
- A shared library is blocking other services and has to multi-target or move first.
- CI, Docker images or `global.json` still pin an older SDK after a partial upgrade.

## Steps

1. **Inventory.** Record, per service:
   - solution and projects (`*.sln` or `*.slnx`, `**/*.csproj`), each `TargetFramework(s)`;
   - `global.json` (SDK pin and `rollForward`), `Directory.Build.props`,
     `Directory.Build.targets`, `Directory.Packages.props` (central package management);
   - packages: `dotnet list package --outdated` and `dotnet list package --vulnerable
--include-transitive` (on the .NET 10 SDK `dotnet package list` is the new spelling);
   - Dockerfiles and compose files (base image tags, `EXPOSE`, `USER`, `ASPNETCORE_URLS`);
   - CI files (`actions/setup-dotnet` versions, SDK images, test and publish steps);
   - test projects and their framework (see rx-dotnet-testing for detection).
2. **Green baseline.** On the current framework: `dotnet restore`, `dotnet build
-warnaserror` if CI does so, `dotnet test`. Save the warning count and test totals in the
   upgrade log. If the baseline is red, stop: fix or report it first, never mix the two.
3. **Branch** per service, for example `chore/net10-orders-api`, following the repository's
   own branch rules.
4. **SDK.** Install the .NET 10 SDK; update `global.json` to a 10.0 feature band with a
   `rollForward` policy the team already uses (`latestFeature` is common).
5. **Target framework.** Change `net6.0`/`net8.0` to `net10.0` wherever it is set: project
   files, `Directory.Build.props`, test projects. Libraries consumed by services still on
   older frameworks can multi-target (`net8.0;net10.0`) until the last consumer moves.
6. **Packages.**
   - `Microsoft.*`, `System.*` and `Microsoft.EntityFrameworkCore.*`: move to 10.x together;
     mixed majors cause binding and runtime errors.
   - Third-party: take the lowest version that supports .NET 10 and read its changelog.
     Known big ones: RabbitMQ.Client 7 (fully async, `IModel` became `IChannel`),
     MassTransit 9 (commercial licence; v8 stays open source), Swashbuckle to built-in OpenAPI
     (optional, see rx-dotnet-api).
   - With central package management, edit `Directory.Packages.props` only.
   - Remove references the framework now provides; the .NET 10 SDK warns (`NU1510`) on
     direct references it prunes.
7. **Build with warnings visible:** `dotnet build -v minimal` and read every new warning.
   New obsoletion warnings (`SYSLIB*`, `ASPDEPR*`) are the list of work, not noise. Do not
   add `NoWarn` or `#pragma` to get past them.
8. **Fix breaking changes by area**, reading each official page for the versions you cross
   (7, 8, 9 and 10 when coming from 6; 9 and 10 when coming from 8):
   - .NET: `https://learn.microsoft.com/dotnet/core/compatibility/10` (and `/9`, `/8`, `/7`)
   - ASP.NET Core: `https://learn.microsoft.com/aspnet/core/breaking-changes/10/overview`
   - EF Core: `https://learn.microsoft.com/ef/core/what-is-new/ef-core-10.0/breaking-changes`
     and the 7, 8, 9 pages (details in rx-efcore).
9. **Run the tests.** All of them, then the integration suite with real dependencies
   (Testcontainers). Compare totals with the baseline: fewer tests run is a failure.
10. **Run and smoke the service** locally or in a container: health endpoint, one read, one
    write, one message consumed and produced, graceful shutdown on `SIGTERM`.
11. **Containers.** Move to `mcr.microsoft.com/dotnet/sdk:10.0` (build) and
    `mcr.microsoft.com/dotnet/aspnet:10.0` or `runtime:10.0` (run). See the notes below.
12. **CI.** Update `setup-dotnet` to `10.0.x`, SDK images, cache keys and any hard-coded
    `bin/Release/net8.0` paths.
13. **Observability.** Confirm traces, logs and metrics still arrive; follow
    rx-datadog-dotnet for tracer and image changes.
14. **Ship** with rx-ship: one pull request per service, the upgrade log in the description.

## Most likely to bite on a 6 or 8 to 10 jump

Verified against the official pages; each one links to details there.

| Change                                                                  | Since           | What breaks                                               |
| ----------------------------------------------------------------------- | --------------- | --------------------------------------------------------- |
| Default container port 8080, not 80                                     | .NET 8          | Probes, `-p 8000:80`, ingress targets                     |
| Non-root `app` user in Linux images                                     | .NET 8          | Dockerfiles that create a user named `app`                |
| Default image tags are Ubuntu; no Debian images                         | .NET 10         | `apt` package names, custom `-bookworm` tags              |
| `BackgroundService.ExecuteAsync` runs fully in the background           | .NET 10         | Startup work that relied on running before other services |
| Default trace propagator is W3C (`baggage`, not `Correlation-Context`)  | .NET 10         | Services that read the old header                         |
| JSON configuration keeps `null` instead of an empty string              | .NET 10         | Options that depended on `""`                             |
| `System.Linq.AsyncEnumerable` in the framework                          | .NET 10         | Ambiguity with the `System.Linq.Async` package            |
| Cookie auth returns 401/403 for API endpoints instead of redirecting    | ASP.NET Core 10 | Clients that followed the redirect                        |
| `WebHostBuilder`, `IWebHost`, `WebHost` obsolete                        | ASP.NET Core 10 | Old `Program.cs` hosting code                             |
| Rate limiting and HTTP logging need `AddRateLimiter` / `AddHttpLogging` | ASP.NET Core 8  | Middleware that silently did nothing or throws            |
| Forwarded headers ignored from unknown proxies                          | ASP.NET Core 8  | Client IP and scheme behind a load balancer               |
| `ValidateScopes`/`ValidateOnBuild` on in Development                    | ASP.NET Core 9  | Captive dependencies now fail at startup                  |
| SqlClient `Encrypt=true` default                                        | EF Core 7       | SQL Server connections without a trusted certificate      |
| Pending model changes throw on migrate                                  | EF Core 9       | `Migrate()` at startup                                    |

## Container notes

- Coming from 6: the app listens on 8080 unless you set `ASPNETCORE_HTTP_PORTS`. Update
  `EXPOSE`, Kubernetes `containerPort` and probes, compose port maps and load balancers.
- Images define an `app` user but still start as root; opt in with `USER $APP_UID` (or
  `USER app`). Check file permissions on mounted volumes and anything written at runtime.
- Tags without an OS suffix are Ubuntu 24.04 ("noble") for .NET 10. Alpine and chiseled
  variants exist; check the tag list before choosing one, and do not pin patch versions here.

## Checklist

| Item                                                     | Done |
| -------------------------------------------------------- | ---- |
| Baseline green, warnings and test totals recorded        |      |
| `global.json`, all TFMs, `Directory.*.props` updated     |      |
| Microsoft packages on 10.x together; third-party checked |      |
| Build has no new unexplained warnings                    |      |
| Breaking-change pages read for every version crossed     |      |
| Unit and integration tests green, same or higher totals  |      |
| Service run and smoked, including shutdown               |      |
| Dockerfile: images, port, user, health check             |      |
| CI: SDK version, paths, caches                           |      |
| Tracing, logs and metrics confirmed                      |      |

## Example

Per-service upgrade log, kept in the pull request description:

```markdown
## Upgrade log: orders-api (net8.0 -> net10.0)

Baseline: build ok, 37 warnings, 412 tests passed (xunit, NSubstitute, Shouldly 4.x)
Changed: global.json 10.0.100 latestFeature; TFMs in Directory.Build.props;
Directory.Packages.props Microsoft.* and EF Core to 10.x; Npgsql provider 10.x
Breaking changes hit:

- ASPDEPR warnings for WebHostBuilder in test fixture -> WebApplicationFactory defaults
- EF9 PendingModelChangesWarning on startup -> added missing migration (no model edits)
- Dockerfile EXPOSE 80 -> 8080, probes updated, USER $APP_UID added
  After: build ok, 35 warnings (2 removed), 412 tests passed; smoke: /health 200,
  GET /orders/1 200, POST /orders 201, OrderPlaced consumed, SIGTERM clean in 3s
  Open questions: none
```
