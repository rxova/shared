---
"@rxova/agent-kit": minor
---

danger-zone no longer judges hosting and cloud CLIs (Vercel, Fly, Railway, Cloudflare `wrangler`, AWS), so it behaves the same whichever platform a project deploys to. It still blocks `rm -r` outside the project, force pushes to `main`, discarding uncommitted work, SQL drops, database resets, `terraform destroy` and disk writes.
