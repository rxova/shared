---
name: rx-dotnet-workers
description: Builds and upgrades BackgroundService workers and message consumers in .NET 10, covering cancellation and graceful shutdown, scoped services, retries, poison messages, idempotency, the outbox, and MassTransit or native Azure Service Bus, RabbitMQ, SQS and Kafka clients. Use when writing or changing a hosted service or consumer, or when verifying workers after a framework upgrade.
---

# rx-dotnet-workers

A worker must stop cleanly, survive a bad message, and never do the same work twice with a
different result. Assume every message arrives at least once, sometimes out of order, and
sometimes during a deploy.

## When to use

- Writing or changing a `BackgroundService`, `IHostedService` or message consumer.
- A worker hangs on shutdown, loses messages on deploy, or loops on one bad message.
- Upgrading a worker service to .NET 10 and you need to prove it still behaves.

## Steps

1. **Find what runs.** `AddHostedService<T>` registrations, consumer registrations
   (`AddMassTransit`, `AddConsumer`, `ServiceBusProcessor`, `IConsumer<,>` for Kafka), and how
   the process is hosted (web app plus workers, or `Host.CreateApplicationBuilder` alone).
2. **Cancellation.** Pass `stoppingToken` to every await in `ExecuteAsync`: delays, database
   calls, HTTP calls, broker receives. A loop checks `!stoppingToken.IsCancellationRequested`.
   Treat `OperationCanceledException` during shutdown as normal, not an error.
3. **Shutdown budget.** `HostOptions.ShutdownTimeout` (30 seconds by default) must be shorter
   than the orchestrator's grace period (Kubernetes `terminationGracePeriodSeconds`, 30 by
   default). Finish or abandon the in-flight message inside it; unacked messages come back.
4. **Scopes.** Workers are singletons. Resolve `DbContext` and other scoped services per
   message or per iteration through `IServiceScopeFactory.CreateAsyncScope()`. Never inject a
   scoped service into the worker's constructor.
5. **Failures.** Since .NET 6 an unhandled exception from `ExecuteAsync` stops the host
   (`BackgroundServiceExceptionBehavior.StopHost`). Catch per message, log with the message
   id, and let the broker's retry or dead-letter rules decide; do not swallow and continue
   silently, and do not let one bad message kill the process.
6. **Retries.** Retry transient faults (timeouts, 5xx, deadlocks) a few times with backoff;
   send permanent faults (validation, missing data) straight to the dead-letter or error queue.
   Make the attempt count visible in logs.
7. **Idempotency.** Key each handler on a stable message id or business key. Record processed
   ids in the same transaction as the side effect (unique index on `(consumer, message_id)`),
   or make the write naturally idempotent (upsert, conditional update).
8. **Outbox.** When a handler writes to the database and publishes, use an outbox so both
   happen or neither: MassTransit's EF Core outbox, or a table written in the same transaction
   and relayed by a worker.
9. **Health.** Add a health check that fails when the worker has not completed a loop or
   handled a message within an expected window (store a heartbeat timestamp in a singleton),
   plus broker connectivity checks for readiness.
10. **Observability.** Log start, stop, message id, attempt and outcome; propagate trace
    context through message headers (see rx-datadog-dotnet).

## Broker notes

| Broker               | Client                       | Points to check                                                                                                                                                                       |
| -------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Azure Service Bus    | `Azure.Messaging.ServiceBus` | `ServiceBusProcessor` with `AutoCompleteMessages = false`, complete after success; `MaxDeliveryCount` moves to the dead-letter subqueue; set `MaxConcurrentCalls` deliberately        |
| RabbitMQ             | `RabbitMQ.Client` 7.x        | Fully async API (`IChannel`, `BasicAckAsync`); set prefetch with `BasicQosAsync`; `BasicNackAsync(requeue: false)` plus a dead-letter exchange instead of endless requeue             |
| Amazon SQS           | `AWSSDK.SQS`                 | Long polling (`WaitTimeSeconds = 20`); visibility timeout longer than processing; redrive policy `maxReceiveCount` to a DLQ; delete only after success                                |
| Kafka                | `Confluent.Kafka`            | `Consume` blocks, so run the loop on its own thread; `EnableAutoCommit = false` and commit after processing; `Close()` on shutdown to leave the group cleanly                         |
| Any, via MassTransit | `MassTransit`                | `UseMessageRetry` then `UseDelayedRedelivery`; faults land in `<queue>_error`; v9 needs a commercial licence, v8 remains open source, so confirm which the team uses before upgrading |

## After a .NET 10 upgrade, verify

- **Startup order.** `ExecuteAsync` now runs entirely in the background, so code before its
  first `await` no longer blocks other services from starting. Anything that must finish
  first (cache warm-up, schema check) moves to `StartAsync` before `base.StartAsync`, or to
  `IHostedLifecycleService`.
- **Signals.** The runtime no longer installs a default `SIGTERM` handler. The generic host
  does, so hosted apps are fine; a hand-rolled console consumer without the host needs
  `PosixSignalRegistration` or should move onto the host.
- **Trace headers.** The default propagator is W3C (`traceparent`, `baggage`); consumers that
  read `Correlation-Context` or old custom headers need checking end to end.
- **Client libraries.** Broker SDK majors often move with the upgrade (RabbitMQ.Client 7 is a
  rewrite); read their migration notes rather than fixing compile errors one by one.
- **Behaviour.** Send `SIGTERM` during processing: the in-flight message completes or is
  redelivered, nothing is lost, the process exits within the budget.

## Example

```csharp
public sealed class OrderExpiryWorker(
    IServiceScopeFactory scopes, WorkerHeartbeat heartbeat,
    ILogger<OrderExpiryWorker> log, TimeProvider clock) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1), clock);
        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                try
                {
                    await using var scope = scopes.CreateAsyncScope();
                    var db = scope.ServiceProvider.GetRequiredService<OrdersDb>();
                    var cutoff = clock.GetUtcNow().AddHours(-24);
                    var expired = await db.Orders
                        .Where(o => o.Status == Status.Pending && o.CreatedAt < cutoff)
                        .ExecuteUpdateAsync(s => s.SetProperty(o => o.Status, Status.Expired), stoppingToken);
                    log.LogInformation("Expired {Count} orders", expired);
                    heartbeat.Beat();
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    log.LogError(ex, "Order expiry run failed; retrying next tick");
                }
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            log.LogInformation("Order expiry worker stopping");
        }
    }
}
```

The update is idempotent (a second run changes nothing), each tick has its own scope, and
the heartbeat feeds a health check that fails if no tick completed in five minutes.

## Verify it works

- Unit test the handler with a fake clock (`FakeTimeProvider`) and a real database container.
- Integration test the consumer against the broker in a container (Testcontainers).
- Poison message: publish one that always fails and confirm it reaches the dead-letter queue
  after the configured attempts while other messages keep flowing.
