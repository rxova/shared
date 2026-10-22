---
"@rxova/ts-utils": minor
---

Add `readArray(value, readItem, { onInvalid })`: one reader for arrays of untrusted items, over a
snapshot taken with `arrayItems`. An item `readItem` cannot read either loses the whole list
(`reject`, the default) or just itself (`skip`).
