# GuestFlow

**Agentic arrival orchestration for luxury hotels.** Built at Hospitality 2030 — A Rosewood Sand Hill Hackathon (May 16, 2026).

Selecting a returning guest triggers a Claude pipeline that produces a choreographed arrival — room & amenity spec, a guest itinerary, the right human host (matched on prior relationship), and that host's brief — including a `doNotMention` layer that draws the line between *"they just knew"* and *"that's creepy."*

## Run locally

```bash
cp .env.example .env        # add ANTHROPIC_API_KEY and ELEVENLABS_API_KEY
npm install
npm run dev
```

## Structure

- `/agent` — Claude orchestration + host-matching → `orchestrate(guestId)`
- `/web` — demo UI + live reasoning trace
- `/data` — seeded guests/staff/events, mock flight, pitch script
- `/shared/types.ts` — the data contract
- `PRD.md`, `SCHEMA.md`, `CLAUDE.md` — spec, contract, and team operating manual

## Team

GuestFlow — 3 builders.
