# GuestFlow — Team Handoff Doc

**Event:** Rosewood Hospitality 2030 Hackathon @ Rosewood Sand Hill  
**Date:** May 16, 2026 | **Timeline:** 10am–5pm  
**Team Size:** 3 people | **First Integration:** 1pm (mandatory) | **Feature Freeze:** 4pm | **Submit:** 5pm

---

## 🎯 What We're Building

**GuestFlow** is an agentic orchestration product for luxury hotel arrivals. When a staff member selects a returning guest, a Claude pipeline runs in real-time and produces four polished artifacts:

1. **Room Spec** — room configuration, lighting, temperature, amenities
2. **Guest Itinerary** — personalized activities, dining, spa, concierge
3. **Host Assignment** — which staff member should greet, why
4. **Host Brief** — what to say, what to observe, what to *never mention*

The signature feature is the **`doNotMention` layer**: the system separates "act on this warmly" from "you know this but must never say it aloud." That contrast is the entire pitch. **Never cut or simplify this logic.**

---

## 👥 Team Structure

| Role | Folder | Owner | Responsibility |
|------|--------|-------|-----------------|
| **Person A** | `/agent` | Orchestration | Claude API calls, prompt engineering, confidence scoring, host matching |
| **Person B** | `/web` | UI/Demo | React components, live trace streaming, artifact panels, demo UX |
| **Person C** | `/data` | Mock Data | `guests.json`, `staff.json`, events, flight module, demo script |

**Hard rule:** Code only in your assigned folder. Do not create or edit files outside it.

---

## 🔧 Current State

✅ **Setup Complete**
- `package.json` restored, dependencies installed
- TypeScript configured (`tsconfig.json`, `tsconfig.agent.json`)
- ESLint set up with modern config
- Type checking & linting pass
- `shared/types.ts` is the FROZEN data contract

✅ **Documentation Ready**
- `PRD.md` — full product spec
- `SCHEMA.md` — detailed type definitions
- `CLAUDE.md` — dev rules & conventions
- `demo-script.md` — demo narrative

⏳ **In Progress**
- Agent orchestration pipeline (Person A)
- Web UI components (Person B)
- Mock data seeding (Person C)

---

## 📋 The Frozen Data Contract (`shared/types.ts`)

**DO NOT MODIFY.** If a type seems wrong, stop and call a team huddle.

Main entities:
- **Guest** — preferences, stay history, reservation, profile
- **StaffMember** — roles, languages, specialties, availability
- **FlightStatus** — arrival time, delays, cabin class
- **RoomSpec** — configuration for the room
- **GuestItinerary** — activities, dining, experiences
- **HostAssignment** — assigned staff, confidence, reasoning
- **HostBrief** — instructions, tone, guardrails, `doNotMention`
- **OrchestrationResult** — the top-level output: all four artifacts + confidence + trace

---

## 🚀 Getting Started (By Role)

### Person A — Agent Orchestration (`/agent`)

**Goal:** Implement `orchestrate(guestId: string) -> Promise<OrchestrationResult>`

1. **Understand the spec.** Read `PRD.md`, `SCHEMA.md`, and `CLAUDE.md`.
2. **Mock data.** Use `guests.json` and `staff.json` from `/data` (Person C will seed these).
3. **Build the prompt.** Claude should produce JSON matching `OrchestrationResult` exactly. Include:
   - Room config based on guest profile, flight status, preferences
   - Personalized itinerary (dining, spa, activities)
   - Host matching (which staff member, confidence score)
   - Host brief with `doNotMention` array
4. **Validate output.** Handle malformed responses gracefully; always return a typed fallback.
5. **Add confidence scoring.** Each artifact gets a 0–1 confidence. Higher = more personalized.
6. **Stream reasoning.** For the live demo trace, emit intermediate steps.

**Key Files:**
- `/agent/orchestrate.ts` — main entry point
- `/agent/prompt.ts` — the Claude system + user prompt
- `/agent/validate.ts` — response validation & fallback
- Use `/shared/types.ts` for all type definitions

### Person B — Web UI (`/web`)

**Goal:** Build a single, beautiful demo screen with live trace & artifact panels.

1. **Guest Selector** — dropdown or grid to pick a guest (gets IDs from `/data/guests.json`)
2. **Live Trace Viewer** — stream reasoning steps from Person A in real-time (fancy animations optional; clarity mandatory)
3. **Four Artifact Panels** — render `RoomSpec`, `Itinerary`, `HostAssignment`, `HostBrief` as cards/panels
4. **`doNotMention` Highlight** — make this panel visually distinct; it's the story of the product
5. **Demo Controls** — "Run Orchestration" button, optional "Inject Flight Delay" button (for dynamic demo)

**Design Notes:**
- Luxury aesthetic: lots of whitespace, serif fonts, elegant colors
- Responsive on demo laptop (probably 1920×1080 or 1440×900)
- "Dress for the Rosewood" applies to pixels too

**Key Files:**
- `/web/components/GuestSelector.tsx`
- `/web/components/TraceViewer.tsx`
- `/web/components/ArtifactPanel.tsx`
- `/web/App.tsx` — main page, orchestration flow
- `/web/styles/` — Tailwind or CSS modules (elegant, restrained)

### Person C — Mock Data (`/data`)

**Goal:** Seed realistic, compelling test data and provide the demo narrative.

1. **`guests.json`** — 3–5 returning guests with rich profiles:
   - Name, preferences, stay history, upcoming reservation
   - At least one with a flight delay (for demo injection)
   - Different personas: business traveler, honeymooner, wellness guest, VIP
2. **`staff.json`** — 5–8 staff members with roles, languages, specialties
3. **`localEvents.json`** — sample events/dining options the itinerary can reference
4. **`mockFlight.ts`** — simple module that returns flight status (with delay injection for demo)
5. **`demo-script.md`** — the 45-second demo narrative
   - Guest selection
   - Orchestration trigger
   - Trace animation
   - Flight delay injection (optional, for "see how it pivots")
   - Final artifact showcase

**Key Files:**
- `/data/guests.json`
- `/data/staff.json`
- `/data/localEvents.json`
- `/data/mockFlight.ts`
- `/data/demo-script.md`

---

## 🔌 Integration Points

1. **Person A → Person B:** Person B calls `orchestrate(guestId)`, gets back `OrchestrationResult`, streams trace & renders panels
2. **Person B → Person C:** Person B reads guest list from `/data/guests.json` for selector
3. **Person A → Person C:** Person A reads guests & staff from `/data` for context

**Integration Checklist (by 1pm):**
- [ ] Person A has `orchestrate()` returning a valid `OrchestrationResult`
- [ ] Person B has a guest selector & can call `orchestrate()`
- [ ] Person C has mock data in place
- [ ] Types compile without errors
- [ ] `npm run typecheck && npm run lint` pass

---

## 📖 How to Run

```bash
# Install dependencies (already done)
npm install

# Type check & lint
npm run typecheck
npm run lint

# Dev server (Person B, once set up)
npm run dev

# Build (before submission)
npm run build
```

---

## 🎬 Demo Narrative (45 seconds)

1. **Select a guest** from dropdown (e.g., "Sarah Chen, returning guest")
2. **Click "Orchestrate"** — live trace starts streaming
3. *[Optional] Inject a flight delay* — watch confidence adjust, itinerary pivot
4. **View the four artifacts:**
   - Room Spec: "Adjust to +2 hours delayed arrival, cool-down mode"
   - Itinerary: "Move 7pm dinner to 9pm, add rest hour"
   - Host Assignment: "Assign Maya (speaks Mandarin, wellness expert)"
   - Host Brief: "Warm greeting, observe jet lag, *never mention* her son's surgery"
5. **Highlight `doNotMention`** — "The system knows, but you speak only warmth, never fact."

---

## ⏱️ Timeline & Milestones

| Time | Milestone | Owners |
|------|-----------|--------|
| 10:00 AM | Kickoff, team syncs | All |
| 11:00 AM | Parallel builds; scaffolding done | A, B, C |
| **1:00 PM** | **First integration: types compile, orchestrate() works** | A, B, C |
| 2:00 PM | Live demo runs end-to-end | A, B, C |
| **4:00 PM** | **Feature freeze** | All |
| 5:00 PM | Submit | All |

---

## 🚨 Hard Rules

1. **Code only in your folder.** `/agent` (Person A), `/web` (Person B), `/data` (Person C). No exceptions.
2. **`shared/types.ts` is frozen.** Do NOT modify. If something's wrong, huddle.
3. **Mock everything external.** No real APIs, databases, or auth. Static JSON + mock flight module only.
4. **Stay agentic.** This is orchestration, not a chatbot, RAG, image analyzer, or education tool. If it drifts, refuse & redirect.
5. **The demo is 45% of the score.** Favor a reliable, beautiful, fast demo over ambitious-but-fragile features.
6. **Always include a fallback.** If the live API call fails, render a cached/hardcoded `OrchestrationResult` so the demo never breaks.
7. **Commit small and often.** Keep diffs inside your folder.

---

## 📚 Key Files to Read

- **`PRD.md`** — product requirements & feature breakdown
- **`SCHEMA.md`** — full type definitions with examples
- **`CLAUDE.md`** — dev rules, conventions, folder responsibilities
- **`types.ts`** — the frozen data contract (source of truth)
- **`demo-script.md`** — the demo narrative

---

## 🤝 Communication

- **Blockers?** Huddle immediately. Don't work around broken types or missing data.
- **Questions?** Check `CLAUDE.md` first, then ask the team.
- **Small decisions:** Decide within your folder & commit.
- **Big decisions:** Huddle (e.g., changing type semantics, pivoting the demo).

---

## 🎯 Definition of Done

A judge picks a guest, watches the trace stream, sees four polished artifacts, and the `doNotMention` panel delivers the "they just knew vs. that's creepy" line. It runs the same way every time.

If that works end-to-end and looks elegant, we win.

**Good luck! You've got this.** ✨
