---
name: rx-dotnet-api
description: Builds and maintains ASP.NET Core APIs on .NET 10 with minimal APIs or controllers, route groups, validation, ProblemDetails errors, auth, built-in OpenAPI, health checks, options, logging and rate limiting. Use when adding or changing endpoints in a .NET service, or when an API upgrade to .NET 10 changes hosting, OpenAPI or error behaviour.
---

# rx-dotnet-api

Follow the style the service already uses. A controller codebase stays on controllers; new
endpoints in a minimal API service go in route groups. What matters is one error shape,
validation at the edge, and auth that is on by default.

## When to use

- Adding or changing endpoints in an ASP.NET Core service.
- Upgrading an API to .NET 10 and the hosting, OpenAPI or error behaviour moved.
- Replacing Swashbuckle, or an API returns a mix of strings, HTML and JSON errors.

## Minimal APIs or controllers

| Situation                                                   | Pick                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| Existing controllers, filters, model binding customisations | Keep controllers                                           |
| New small or medium service, few cross-cutting filters      | Minimal APIs with `MapGroup`                               |
| Both already in one service                                 | Fine; share services and the error setup, not base classes |

## Steps

1. **Hosting.** `WebApplication.CreateBuilder(args)`. `WebHostBuilder`, `IWebHost` and
   `WebHost` are obsolete in ASP.NET Core 10 (`ASPDEPR004`, `ASPDEPR008`); move old
   `Startup`/`CreateDefaultBuilder` code as part of the upgrade.
2. **Routes.** Group by resource with `app.MapGroup("/orders").WithTags("Orders")` and
   apply auth, rate limits and filters on the group. Return `TypedResults` so the result
   types appear in OpenAPI and tests can check them.
3. **Validation.**
   - Controllers with `[ApiController]` return a 400 validation problem automatically.
   - Minimal APIs on .NET 10: `builder.Services.AddValidation()` validates
     `System.ComponentModel.DataAnnotations` attributes on parameters and bodies and returns
     400 with problem details. Opt a route out with `.DisableValidation()`.
   - If the service already uses FluentValidation or similar, keep it; do not run two.
4. **Errors.** `builder.Services.AddProblemDetails()`, `app.UseExceptionHandler()` and
   `app.UseStatusCodePages()`. Put exception mapping in one `IExceptionHandler`
   (`AddExceptionHandler<T>()`). In ASP.NET Core 10, an exception your handler reports as
   handled (`TryHandleAsync` returns `true`) is no longer logged by the middleware, so log
   it yourself or set `ExceptionHandlerOptions.SuppressDiagnosticsCallback`.
5. **Auth.** `AddAuthentication().AddJwtBearer(...)` plus `AddAuthorization` with named
   policies. Prefer a fallback policy that requires an authenticated user, then mark public
   endpoints with `AllowAnonymous()`. Cookie auth in ASP.NET Core 10 returns 401/403 on
   known API endpoints instead of redirecting to a login page.
6. **OpenAPI.** Built in via `Microsoft.AspNetCore.OpenApi`: `AddOpenApi()` and
   `MapOpenApi()` (document at `/openapi/v1.json`). .NET 10 emits OpenAPI 3.1 by default and
   uses Microsoft.OpenApi 2.x, whose object model changed (for example `OpenApiAny` gave way
   to `JsonNode`). No UI is included; add Swagger UI or Scalar if people need one. Expose the
   document outside Development only on purpose.
7. **Health checks.** `AddHealthChecks()` with checks for real dependencies (DbContext,
   broker). Map liveness (`/health/live`, no dependency checks) and readiness
   (`/health/ready`, with them) separately, using tags and `HealthCheckOptions.Predicate`.
8. **Options.** Bind with `AddOptions<T>().BindConfiguration("Section")
.ValidateDataAnnotations().ValidateOnStart()`. From .NET 10, JSON `null` binds as `null`
   (and as `default` for value types) instead of an empty string.
9. **Logging.** Structured messages (`logger.LogInformation("Order {OrderId} placed", id)`),
   never string interpolation in the template. `UseHttpLogging` needs `AddHttpLogging()`
   since .NET 8. Keep secrets and tokens out of logs.
10. **Rate limiting.** `AddRateLimiter` with a named policy, `app.UseRateLimiter()`, and
    `.RequireRateLimiting("name")` on groups. Set `RejectionStatusCode = 429`; the default is 503.
11. **Behind a proxy.** `ForwardedHeadersOptions` must list the proxies (`KnownProxies`) or
    networks (`KnownIPNetworks` with `System.Net.IPNetwork`; `KnownNetworks` is obsolete in
    ASP.NET Core 10, `ASPDEPR005`). Since .NET 8 headers from unknown proxies are ignored.

## Leaving Swashbuckle

- Swashbuckle is not in the templates since .NET 9. Moving is optional; do it in its own
  pull request, not in the framework upgrade, unless Swashbuckle blocks the upgrade.
- Map filters to transformers: `IDocumentFilter` to `AddDocumentTransformer`,
  `IOperationFilter` to `AddOperationTransformer`, `ISchemaFilter` to
  `AddSchemaTransformer`.
- Diff the generated document before and after; client generators notice renamed schemas.
- `WithOpenApi()` is deprecated in ASP.NET Core 10 (`ASPDEPR002`); use `WithSummary`,
  `WithDescription`, or `AddOpenApiOperationTransformer` on the endpoint.

## Example

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<DomainExceptionHandler>();
builder.Services.AddValidation();
builder.Services.AddOpenApi();
builder.Services.AddAuthentication().AddJwtBearer();
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());
builder.Services.AddHealthChecks().AddDbContextCheck<OrdersDb>(tags: ["ready"]);
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddFixedWindowLimiter("per-client", w => { w.PermitLimit = 100; w.Window = TimeSpan.FromMinutes(1); });
});

var app = builder.Build();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapOpenApi().AllowAnonymous();
app.MapHealthChecks("/health/live", new() { Predicate = _ => false }).AllowAnonymous();
app.MapHealthChecks("/health/ready", new() { Predicate = c => c.Tags.Contains("ready") }).AllowAnonymous();

var orders = app.MapGroup("/orders").WithTags("Orders").RequireRateLimiting("per-client");
orders.MapGet("/{id:guid}", async Task<Results<Ok<OrderDto>, NotFound>> (Guid id, OrdersDb db, CancellationToken ct) =>
    await db.Orders.AsNoTracking().Where(o => o.Id == id).Select(o => new OrderDto(o.Id, o.Total)).FirstOrDefaultAsync(ct)
        is { } dto ? TypedResults.Ok(dto) : TypedResults.NotFound());
orders.MapPost("/", async (CreateOrder cmd, OrdersDb db, CancellationToken ct) =>
{
    var order = Order.Create(cmd.CustomerId, cmd.Total);
    db.Orders.Add(order);
    await db.SaveChangesAsync(ct);
    return TypedResults.Created($"/orders/{order.Id}", new OrderDto(order.Id, order.Total));
});

app.Run();

public record CreateOrder([property: Required] Guid CustomerId, [property: Range(0.01, 1_000_000)] decimal Total);
public record OrderDto(Guid Id, decimal Total);
```

## Gotchas

- Pass `CancellationToken` from the handler into every async call; the request abort flows
  through it.
- Middleware order matters: exception handler first, then auth, then rate limiter, then
  endpoints.
- `AddValidation()` must be called in the assembly that declares the endpoints.
- `AddDbContextCheck` comes from the
  `Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore` package.
- The generated `Program` class is public in .NET 10; delete old `public partial class
Program {}` lines when analyzer `ASP0027` suggests it.

## Verify it works

- Bad body returns 400 `application/problem+json`; missing token 401; unknown id 404; a
  thrown bug 500 without a stack trace, and the error is in the logs.
- `/openapi/v1.json` lists every route with the right status codes.
- Liveness stays 200 when the database is down; readiness goes unhealthy.
