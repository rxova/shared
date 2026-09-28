---
name: rx-efcore
description: Works with EF Core 10 in .NET 10 services, covering the upgrade from EF Core 6 or 8, migrations and production scripts, SQL Server and Npgsql providers, query performance and testing against real databases. Use when changing a DbContext, model or migration, when upgrading EF Core, or when a query is slow or behaves differently after an upgrade.
---

# rx-efcore

EF Core 10 is the version for .NET 10 (it requires the .NET 10 runtime). Treat the database
as shared and precious: generate SQL, read it, and apply it through the pipeline, never by
hand from a laptop against anything other than your own container.

## When to use

- Upgrading `Microsoft.EntityFrameworkCore.*` from 6.x or 8.x to 10.x.
- Adding or changing entities, relationships or migrations.
- A query got slower or started failing after an upgrade.
- Tests use the in-memory provider and miss real database behaviour.

## Steps

1. **Find the setup.** Locate the `DbContext`, its `AddDbContext`/`AddDbContextPool` call,
   the provider package, the migrations folder and assembly, and whether the app calls
   `Database.Migrate()` at startup or migrations run from a pipeline step.
2. **Upgrade packages together.** Every `Microsoft.EntityFrameworkCore.*` package and the
   provider (`Npgsql.EntityFrameworkCore.PostgreSQL`, `Pomelo...`) to their 10.x line, and the
   `dotnet-ef` tool to 10.x (`dotnet tool update dotnet-ef`, local manifest if the repo has
   `.config/dotnet-tools.json`).
3. **Read the breaking changes for every version crossed**:
   `https://learn.microsoft.com/ef/core/what-is-new/ef-core-10.0/breaking-changes`, then the
   9.0, 8.0 and 7.0 pages when coming from 6. Also read the provider's release notes.
4. **Check the model did not drift.** After upgrading, run `dotnet ef migrations add
UpgradeCheck`. If it is empty, delete it. If not, read it: the change is caused by the
   upgrade (for example discriminator lengths in EF 8, `json` columns on Azure SQL in EF 10)
   and needs a decision, not a blind apply.
5. **Run the tests against a real database** (Testcontainers, see below) and compare the SQL
   for hot queries with logging on (`LogTo` or `Microsoft.EntityFrameworkCore.Database.Command`
   at `Information`).

## Upgrade changes most likely to bite

| Change                                                     | Version | What to do                                                                              |
| ---------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| SqlClient defaults to `Encrypt=True`                       | 7       | Trust the server certificate properly; `TrustServerCertificate=True` only for local dev |
| SQL Server tables with triggers fail on save               | 7       | `ToTable(t => t.UseSqlOutputClause(false))` (8+) on those entities                      |
| Some warnings throw again (e.g. ambient transaction)       | 7       | Fix the cause rather than ignoring the event                                            |
| `Contains` over a list uses `OPENJSON`                     | 8       | Needs compatibility level 130+; check old databases                                     |
| Enums inside JSON columns stored as ints                   | 8       | Add `HasConversion<string>()` if existing data holds strings                            |
| `Migrate()` throws on pending model changes                | 9       | Add the missing migration; do not suppress the warning                                  |
| `Migrate()` inside your own transaction throws             | 9       | Remove the outer transaction and execution strategy wrapper                             |
| Parameterised collections use multiple parameters          | 10      | Watch plans for large lists; `UseParameterizedCollectionMode` if needed                 |
| SQL parameter names simplified (`@city`)                   | 10      | Update SQL snapshot tests and log parsers; expect plan recompiles after deploy          |
| `ExecuteUpdateAsync` takes a normal lambda                 | 10      | Rewrite hand-built expression trees                                                     |
| Multi-targeted projects need `--framework` for `dotnet ef` | 10      | Pass it in scripts and CI                                                               |
| `json` column type with `UseAzureSql` or compat level 170  | 10      | Read the generated migration before applying                                            |

## Migrations workflow

- Add: `dotnet ef migrations add AddOrderStatus -p src/Orders.Data -s src/Orders.Api`.
  Review the generated `Up` and `Down` like any code: renames that became drop plus add,
  column type changes, and non-nullable columns without defaults on large tables.
- Script for review: `dotnet ef migrations script <from> <to> -o migration.sql`.
- Production: an idempotent script (`dotnet ef migrations script --idempotent -o
migrate.sql`) applied by the pipeline, or a bundle (`dotnet ef migrations bundle
--self-contained -o efbundle`) run with the connection string from the environment.
- Keep startup `Migrate()` only if the team already relies on it; EF 9+ takes a lock, but a
  pipeline step is easier to observe and roll back.
- Destructive changes (drop column or table, shrink a type) go in two releases: stop using it,
  then remove it.

## Never

- Never run `dotnet ef database update`, `database drop` or a generated script against a shared
  environment (dev, staging, production) from a local machine. Ask, or hand it to the
  pipeline.
- Never edit a migration that has already been applied anywhere shared; add a new one.
- Never delete the model snapshot to "fix" drift.

## Performance basics

- Read-only queries: `AsNoTracking()`, and project to DTOs with `Select` instead of loading
  whole graphs.
- N+1: a query inside a loop, or lazy loading in a list endpoint. Use `Include`, a projection,
  or one query with `Where(x => ids.Contains(x.Id))`. `AsSplitQuery()` for wide includes.
- Bulk changes: `ExecuteUpdateAsync` / `ExecuteDeleteAsync` instead of load, modify, save.
- Always pass the `CancellationToken`; never `.Result` or `.Wait()` on EF calls.
- Compiled queries (`EF.CompileAsyncQuery`) and compiled models only when profiling shows
  query compilation or startup as the cost. `EF.Constant()` inside compiled queries throws
  since EF 9.
- `AddDbContextPool` only if the context has no per-request state in fields.

## Testing

Use a real database in a container, not `UseInMemoryDatabase`: the in-memory provider ignores
constraints, transactions and SQL translation, so it passes tests production would fail.
SQLite in memory is closer but still a different engine. See rx-dotnet-testing for the
fixture pattern.

## Example

```csharp
// Npgsql, pooled, retries on transient errors, SQL visible in Development
builder.Services.AddDbContextPool<OrdersDb>(o =>
{
    o.UseNpgsql(builder.Configuration.GetConnectionString("Orders"),
        npg => npg.EnableRetryOnFailure());
    if (builder.Environment.IsDevelopment()) o.EnableSensitiveDataLogging();
});

// Read path: no tracking, projected, cancellable
public Task<List<OrderSummary>> RecentAsync(Guid customerId, CancellationToken ct) =>
    db.Orders.AsNoTracking()
        .Where(o => o.CustomerId == customerId)
        .OrderByDescending(o => o.CreatedAt)
        .Take(20)
        .Select(o => new OrderSummary(o.Id, o.Total, o.Lines.Count))
        .ToListAsync(ct);

// Bulk update without loading entities (EF 10 accepts a block lambda)
await db.Orders.Where(o => o.Status == Status.Pending && o.CreatedAt < cutoff)
    .ExecuteUpdateAsync(s =>
    {
        s.SetProperty(o => o.Status, Status.Expired);
        if (stampExpiry) s.SetProperty(o => o.ExpiredAt, now);
    }, ct);
```

## Verify it works

- `dotnet ef migrations add UpgradeCheck` produces an empty migration (then remove it).
- `dotnet ef migrations script --idempotent` runs cleanly against a fresh container and
  against a copy of the current schema.
- Integration tests pass on the real provider, and hot queries produce the SQL you expect.
