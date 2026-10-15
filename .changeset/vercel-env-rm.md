---
"@rxova/agent-kit": patch
---

danger-zone reads `vercel`'s subcommand instead of any `rm` in the command: `vercel rm` and `vercel project rm` stay blocked, while `vercel env rm`, `domains rm`, `alias rm` and `dns rm` go through.
