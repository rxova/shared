---
name: rx-claude-api
description: Adds AI features with the Claude API using the official TypeScript or Python SDK, covering model choice, system prompts, streaming to the UI, tool use, structured JSON output, prompt caching and cost and abuse limits. Use when building a chat, extraction, classification or agent feature on Claude, or when an AI demo is slow, expensive or leaking its key.
---

# rx-claude-api

Call Claude from your server, stream the answer to the UI, and cap usage before the demo
goes public. The key never touches the browser or the mobile bundle.

## When to use

- Adding chat, summarising, extraction, classification or an agent loop to an app.
- Output needs to be valid JSON your code can trust.
- Responses are slow, costs are climbing, or a public demo could be abused.

## Which model

Model families: **Opus** (most capable), **Sonnet** (balance of speed and quality),
**Haiku** (fastest, cheapest). Take exact model IDs from the models overview page
(platform.claude.com/docs, "Models overview"), not from memory; put the ID in an env var
so you can switch without a deploy.

| Task                                                  | Start with |
| ----------------------------------------------------- | ---------- |
| Classification, routing, short extraction, moderation | Haiku      |
| Chat, RAG answers, most product features              | Sonnet     |
| Hard reasoning, long agentic tasks, code generation   | Opus       |

## Steps

1. **Install:** `npm i @anthropic-ai/sdk` or `uv add anthropic`. Both read
   `ANTHROPIC_API_KEY` from the environment.
2. **Server only.** Call the API from a route handler, server action, API or edge function.
   Never `NEXT_PUBLIC_`, `VITE_` or `EXPO_PUBLIC_` the key.
3. **System prompt** sets role, rules and output format; user content goes in `messages`.
   Wrap untrusted input (user text, fetched pages) in tags and tell the model it is data.
4. **Stream** long answers: use the SDK's stream helper and forward text chunks to the
   client (SSE or a `ReadableStream`).
5. **Tool use:** describe tools with a JSON schema; when `stop_reason` is `tool_use`, run the
   tool, send back a `tool_result` block with the matching `tool_use_id`, and loop.
6. **Structured output:** pass `output_config.format` with a JSON schema to get schema-valid
   JSON. Still validate with zod or pydantic before using it. Check the "Structured outputs"
   docs page for supported models.
7. **Prompt caching:** mark a large, repeated prefix (instructions, documents, tool list)
   with `cache_control: { type: 'ephemeral' }`. Put stable content first, changing content
   last. Check `usage` for cache read tokens to confirm hits.
8. **Limits:** set `max_tokens`, a per-IP or per-user rate limit, an input length cap, and a
   spend limit in the Console.

## Example

```ts
// app/api/chat/route.ts (Next.js); streams plain text to the browser
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY
const Body = z.object({ message: z.string().min(1).max(4000) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return new Response("Bad request", { status: 400 });
  // rate-limit here (per IP or user) before spending tokens

  const stream = client.messages.stream({
    model: process.env.CLAUDE_MODEL!, // from the models overview page
    max_tokens: 1024,
    system: [{ type: "text", text: LONG_PRODUCT_DOCS, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: parsed.data.message }],
  });

  const body = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      stream.on("text", (t) => controller.enqueue(enc.encode(t)));
      stream.on("error", (e) => controller.error(e));
      await stream.finalMessage();
      controller.close();
    },
  });
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
const LONG_PRODUCT_DOCS = "You answer questions about ...";
```

```python
# Structured extraction (Python)
import anthropic, json, os
client = anthropic.Anthropic()
resp = client.messages.create(
    model=os.environ["CLAUDE_FAST_MODEL"], max_tokens=512,
    messages=[{"role": "user", "content": f"<ticket>{ticket_text}</ticket>\nClassify this ticket."}],
    output_config={"format": {"type": "json_schema", "schema": {
        "type": "object", "additionalProperties": False, "required": ["category", "urgent"],
        "properties": {"category": {"type": "string", "enum": ["bug", "billing", "other"]},
                       "urgent": {"type": "boolean"}}}}},
)
result = json.loads(resp.content[0].text)
```

```bash
# .env.example
ANTHROPIC_API_KEY=
CLAUDE_MODEL=
CLAUDE_FAST_MODEL=
```

## Gotchas

- Reading `response.content[0].text` blindly breaks when the first block is not text
  (thinking, tool use). Filter blocks by `type`.
- Streaming through a proxy or serverless platform may buffer; test on the deployed URL.
- Caching only kicks in above a minimum prefix length, and any change in the prefix misses.
- 429 and 529 responses happen under load; the SDKs retry some automatically, so keep your
  own retry light and show a friendly message.
- Conversation history grows cost linearly; trim or summarise old turns.

## Verify it works

- The key does not appear in the browser bundle: search built assets for `sk-ant`.
- The first streamed token shows in the UI within a couple of seconds.
- Sending 20 rapid requests from one client hits your rate limit, not your budget.
