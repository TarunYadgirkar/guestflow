# CLAUDE.md — GuestFlow

Claude Code reads this file automatically. It is the operating manual for every session on this repo. Read `PRD.md` and `SCHEMA.md` before writing code.

## What we are building

GuestFlow: an **agentic arrival-orchestration product** for luxury hotels (built for the Rosewood Hospitality 2030 hackathon). Selecting a returning guest triggers a Claude pipeline that produces four artifacts — Room Spec, Guest Itinerary, Host Assignment, Host Brief — plus a live reasoning trace. The signature feature is a **confidence + `doNotMention` layer**: the system separates "act on this warmly" from "you know this but must never say it aloud." That contrast is the entire pitch. **Never cut or simplify the `doNotMention` logic.**

## Hard rules

1. **Code only in your assigned folder.** Person A → `/agent`, Person B → `/web`, Person C → `/data`. Do not create or edit files outside it.
2. **`/shared/types.ts` is the frozen contract.** Code against it exactly. Do NOT modify it — if a type seems wrong, stop and tell the human to call a team huddle.
3. **Mock everything external.** No real PMS/CRM/DB/auth. Data is static JSON in `/data`. A mock flight module is fine.
4. **Stay agentic, not a chatbot.** This is an orchestration product. We are NOT building a chat UI, RAG app, Streamlit app, image analyzer, education/nutrition/medical/mental-health bot, or personality analyzer. Any of those = instant disqualification. If a suggestion drifts that way, refuse and redirect.
5. **The demo is 45% of the score.** Favor a reliable, beautiful, fast path over ambitious-but-fragile. Always include a cached/fallback orchestration result so a live API hiccup never breaks the demo.
6. Commit small and often. Keep diffs inside your folder.

## Conventions

- TypeScript. Functional, minimal dependencies. No state libraries unless essential.
- Claude calls: request structured JSON that validates against `types.ts` (`OrchestrationResult` and its parts). Always handle malformed output gracefully with a typed fallback.
- Keep secrets in `.env` (gitignored). Never hardcode keys. Never log keys.
- UI: clean, restrained, luxury feel — lots of whitespace, serif/elegant type, no clutter. "Dress for the Rosewood" applies to the pixels too.

## Folder responsibilities

- **`/agent`** — orchestration logic, the Claude prompt(s), confidence scoring, the host-matching algorithm, and producing a valid `OrchestrationResult`. Exposes one function: `orchestrate(guestId) -> OrchestrationResult`.
- **`/web`** — the single demo screen: guest selector, the live streaming reasoning trace, and the four artifact panels rendered beautifully. Consumes `orchestrate()` output only via the `types.ts` shapes.
- **`/data`** — `guests.json`, `staff.json`, `localEvents.json`, mock flight module, and `/pitch/demo-script.md`. Owns seeded fictional data and the demo narrative.

## Definition of done (per the judging axes)

A judge picks a guest, watches the trace stream, sees four polished artifacts, and the `doNotMention` panel delivers the "they just knew vs. that's creepy" line. It runs the same way every time. If that works end-to-end and looks elegant, we win.
