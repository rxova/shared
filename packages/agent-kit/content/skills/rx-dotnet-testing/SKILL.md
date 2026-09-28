---
name: rx-dotnet-testing
description: Writes and fixes .NET tests with Shouldly assertions after detecting the repository's test framework and mocking library, including FluentAssertions leftovers, WebApplicationFactory integration tests, Testcontainers, filtered runs and coverage. Use when adding or changing tests in a .NET service, or when tests break during an upgrade.
---

# rx-dotnet-testing

Detect first, then write tests in the style the project already has. Assertions are Shouldly.
A failing test during an upgrade is information: fix the code or the test's setup, never the
assertion's meaning.

## When to use

- Adding or changing tests in a .NET repository.
- Tests fail or stop being discovered after moving to .NET 10.
- FluentAssertions calls remain and need converting.
- A test uses the EF in-memory provider or mocks the database and misses real bugs.

## Steps

1. **Detect the stack** from the test projects' `PackageReference`s (and
   `Directory.Packages.props` with central package management):
   `grep -hoE 'Include="(xunit[^"]*|NUnit[^"]*|MSTest[^"]*|Moq|NSubstitute|FakeItEasy|Shouldly|FluentAssertions|Testcontainers[^"]*|Microsoft.AspNetCore.Mvc.Testing|coverlet[^"]*)"' -r --include=*.csproj --include=*.props .`

   | Package                               | Means                                                                                   |
   | ------------------------------------- | --------------------------------------------------------------------------------------- |
   | `xunit` + `xunit.runner.visualstudio` | xUnit v2: `[Fact]`, `[Theory]`, `IAsyncLifetime` returns `Task`                         |
   | `xunit.v3`                            | xUnit v3: `IAsyncLifetime` returns `ValueTask`, `TestContext.Current.CancellationToken` |
   | `NUnit`                               | `[Test]`, `[TestCase]`, `[SetUp]`, `[OneTimeSetUp]`                                     |
   | `MSTest` / `MSTest.Sdk`               | `[TestClass]`, `[TestMethod]`, `[DataRow]`                                              |
   | `Moq`                                 | `new Mock<T>()`, `.Setup(...)`, `.Verify(...)`                                          |
   | `NSubstitute`                         | `Substitute.For<T>()`, `.Returns(...)`, `.Received()`                                   |
   | `FakeItEasy`                          | `A.Fake<T>()`, `A.CallTo(...)`                                                          |

   Also check `global.json` for `"test": { "runner": "Microsoft.Testing.Platform" }`, which
   changes how `dotnet test` takes arguments on the .NET 10 SDK.

2. **Match the neighbours.** Copy naming, fixture and builder patterns from the nearest test
   file. Do not introduce a second framework or mocking library.
3. **Assert with Shouldly.** Stable Shouldly is 4.x; 5.0 is in preview. Check the version
   before using anything marked below as 5.x.
4. **Mock at the boundary only** (HTTP clients, clock, broker publisher). Use a real database
   through Testcontainers instead of mocking `DbContext` or using `UseInMemoryDatabase`.
5. **Run narrowly, then fully** (commands below), and compare totals with the baseline.

## Shouldly essentials

```csharp
order.Status.ShouldBe(Status.Placed);
total.ShouldBe(10.5m, tolerance: 0.01m);
createdAt.ShouldBe(expected, TimeSpan.FromSeconds(1));
result.ShouldNotBeNull().Id.ShouldBe(id);          // ShouldNotBeNull returns the value
dto.ShouldBeEquivalentTo(expectedDto);              // member-wise, recursive
ids.ShouldBe([1, 2, 3], ignoreOrder: true);
lines.ShouldHaveSingleItem().Sku.ShouldBe("A-1");
lines.ShouldAllBe(l => l.Quantity > 0);
lines.ShouldContain(l => l.Sku == "A-1");
var ex = Should.Throw<DomainException>(() => order.Cancel());
ex.Message.ShouldContain("already shipped");
var ex2 = await Should.ThrowAsync<NotFoundException>(() => service.GetAsync(id, ct));
await Should.NotThrowAsync(() => service.PingAsync(ct));
order.ShouldSatisfyAllConditions(                   // reports every failure at once
    () => order.Total.ShouldBe(10m),
    () => order.Lines.Count.ShouldBe(2));           // 5.x prefers ShouldSatisfy
```

## FluentAssertions leftovers

| FluentAssertions                                  | Shouldly                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------ |
| `x.Should().Be(y)` / `NotBe(y)`                   | `x.ShouldBe(y)` / `x.ShouldNotBe(y)`                               |
| `x.Should().BeNull()` / `NotBeNull()`             | `x.ShouldBeNull()` / `x.ShouldNotBeNull()`                         |
| `x.Should().BeTrue()`                             | `x.ShouldBeTrue()`                                                 |
| `x.Should().BeOfType<T>()`                        | `x.ShouldBeOfType<T>()` (returns the cast value)                   |
| `x.Should().BeEquivalentTo(y)` on objects         | `x.ShouldBeEquivalentTo(y)`                                        |
| `list.Should().BeEquivalentTo(other)` (any order) | `list.ShouldBe(other, ignoreOrder: true)`                          |
| `list.Should().Equal(a, b)`                       | `list.ShouldBe([a, b])`                                            |
| `list.Should().HaveCount(n)`                      | `list.Count.ShouldBe(n)`                                           |
| `list.Should().ContainSingle()`                   | `list.ShouldHaveSingleItem()`                                      |
| `list.Should().OnlyContain(p)`                    | `list.ShouldAllBe(p)`                                              |
| `list.Should().BeEmpty()`                         | `list.ShouldBeEmpty()`                                             |
| `s.Should().Contain("x")`                         | `s.ShouldContain("x")` (case-sensitive; `Case.Insensitive` option) |
| `n.Should().BeGreaterThan(y)`                     | `n.ShouldBeGreaterThan(y)`                                         |
| `d.Should().BeCloseTo(y, span)`                   | `d.ShouldBe(y, span)`                                              |
| `act.Should().Throw<T>().WithMessage("x*")`       | `Should.Throw<T>(act).Message.ShouldStartWith("x")`                |
| `await act.Should().ThrowAsync<T>()`              | `await Should.ThrowAsync<T>(act)`                                  |
| `using (new AssertionScope())`                    | `ShouldSatisfyAllConditions(...)`                                  |

Shouldly has no `.And` / `.Which`; split into statements. `ShouldBe` is strict on types, so
compare `int` with `int`, not `long`. `BeEquivalentTo(...).Excluding(...)` has no 4.x
equivalent: assert the members that matter. Remove the `FluentAssertions` package once no
usages remain. Official map: `https://docs.shouldly.org/documentation/migrating-from-fluentassertions`.

## Integration tests

- `WebApplicationFactory<Program>` from `Microsoft.AspNetCore.Mvc.Testing`. In .NET 10 the
  generated `Program` class is public, so no `public partial class Program {}` is needed.
- Replace dependencies in `ConfigureTestServices` (runs after the app's registrations):
  remove the real `DbContextOptions<T>` and add one pointing at the container.
- Test auth: register an `AuthenticationHandler<AuthenticationSchemeOptions>` under a "Test"
  scheme that builds a `ClaimsPrincipal` from a request header, and make it the default scheme.
  Its constructor takes `(IOptionsMonitor<...>, ILoggerFactory, UrlEncoder)`; the `ISystemClock`
  overload is obsolete since .NET 8.
- Testcontainers modules: `Testcontainers.PostgreSql`, `Testcontainers.MsSql`,
  `Testcontainers.RabbitMq`, `Testcontainers.Kafka`, `Testcontainers.LocalStack` (SQS),
  `Testcontainers.ServiceBus`. Start one container per test collection or fixture, not per test,
  and reset data between tests (transaction rollback or a cleanup script).

## Example

```csharp
public sealed class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _db = new PostgreSqlBuilder("postgres:16-alpine").Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder) =>
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<DbContextOptions<OrdersDb>>();
            services.AddDbContext<OrdersDb>(o => o.UseNpgsql(_db.GetConnectionString()));
            services.AddAuthentication("Test")
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });
        });

    public async ValueTask InitializeAsync()            // xUnit v3; v2 uses Task
    {
        await _db.StartAsync();
        using var scope = Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<OrdersDb>().Database.MigrateAsync();
    }

    public override async ValueTask DisposeAsync() { await _db.DisposeAsync(); await base.DisposeAsync(); }
}

public class CreateOrderTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Rejects_non_positive_total()
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-User", "user-1");

        var res = await client.PostAsJsonAsync("/orders", new { customerId = Guid.NewGuid(), total = 0 });

        res.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        res.Content.Headers.ContentType!.MediaType.ShouldBe("application/problem+json");
    }
}
```

Older Testcontainers versions use `new PostgreSqlBuilder().WithImage(...)`; follow the repo.

## Running tests

- VSTest mode (default): `dotnet test --filter "FullyQualifiedName~Orders"` or
  `--filter "Category=Integration"` (NUnit/MSTest categories, xUnit traits).
- Microsoft.Testing.Platform mode: arguments depend on the framework, for example xUnit v3
  `--filter-class`, `--filter-method`, `--filter-trait "Category=Integration"`; MSTest and NUnit
  keep `--filter`. Check `dotnet test --help` in the repository.
- Coverage: use what is referenced. `coverlet.collector`: `dotnet test --collect:"XPlat Code
Coverage"`. `dotnet-coverage` tool: `dotnet-coverage collect "dotnet test"`. MTP with
  `Microsoft.Testing.Extensions.CodeCoverage`: `dotnet test --coverage`.

## Never

- Never delete, skip (`Skip =`, `[Ignore]`), or weaken an assertion to make an upgrade pass.
  If a behaviour change is intended, change the expectation and say why in the pull request.
- Never write a test with no assertion, or one that asserts only that no exception was thrown
  when there is a result to check.
- Never make a test pass by catching the exception it should expose.
