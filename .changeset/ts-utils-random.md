---
"@rxova/ts-utils": minor
---

Add `randomBelow`, `shuffle`, `seededRandom` and `hashString`. `randomBelow` draws without bias by
rejection sampling, where `getRandomValues(…) % bound` favours the low values; `shuffle` is
Fisher-Yates over an injectable draw. `seededRandom` (mulberry32) and `hashString` (FNV-1a) give
orders that come back after a reload — their sequences are part of the API and will not change.
