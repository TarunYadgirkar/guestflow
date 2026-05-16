# GuestFlow — Product Requirements Document (PRD)

> **Event:** Hospitality 2030 — A Rosewood Sand Hill Hackathon (Sat May 16, 2026)
> **Team:** GuestFlow (3 people)
> **Problem statement targeted:** #1 Hyper-Personalized Arrival Orchestration (with elements of #2 The Invisible Concierge and #3 Post-Stay Continuity folded in)
> **This doc is the single source of truth. Paste it into Claude Code at the start of your session.**

---

## 1. One-line pitch

**GuestFlow turns a returning guest's reservation into a fully choreographed, human-delivered luxury arrival — automatically, and without crossing the line into surveillance.**

## 2. The problem (validated by the market)

Luxury hotels already hold everything they need to make a returning guest feel known — past stays, preferences, dietary needs, occasions. But that data sits in silos, and the system depends on a human reading a brief and remembering to act. At scale, with understaffed teams, they don't. A guest books their fifth stay; the room is still standard, the minibar generic, the front desk un-briefed. Meanwhile, the startups solving this with silent automation (auto-adjusting rooms, predictive offer pop-ups) create the *opposite* problem for ultra-luxury: it feels like being watched, not being cared for.

## 3. The insight (this is the pitch)

Personalization delivered by a **warm, briefed human** feels like being *known*. The exact same intelligence delivered silently by a system feels like *surveillance*. GuestFlow's job is not to replace the human touch — it's to make a specific, named staff member able to deliver it flawlessly, while explicitly drawing the line between "act on this warmly" and "you know this but must never say it out loud."

This single mechanism touches all three of Rosewood's problem statements:
- **PS1 (Arrival):** orchestrates the bespoke arrival end-to-end.
- **PS2 (Invisible Concierge):** the confidence + "do-not-mention" layer *is* the answer to the creepy-line design problem.
- **PS3 (Continuity):** the same host is re-assigned across repeat stays → a real, remembered relationship.

## 4. What we're building

A single agentic pipeline. **Input:** select a returning guest with an upcoming reservation. **The agent then:** pulls stay history, live flight status, weather, and that property's local cultural programming, reasons over it with a visible confidence layer, and produces **four artifacts**:

1. **Room & Amenity Spec** — temperature, pillow, minibar, and a *locally-sourced* welcome amenity tied to Rosewood's "A Sense of Place." High-confidence items auto-apply; low-confidence become staff suggestions.
2. **Guest Itinerary** — genuinely specific local experiences happening during the guest's actual dates, matched to their interests (not "visit a museum").
3. **Host Assignment** — the right named staff member, matched on continuity (hosted them before), language, affinity, and availability, with explicit match reasoning.
4. **Host Brief** — a warm, specific brief addressed to that named host: how to greet them, the 3-5 things to know, subtle service notes, live flight impact — **and a `doNotMention` list**: things the system inferred but the host must never say aloud.

A live **reasoning trace** ("watch it orchestrate") is shown during generation — this is the demo centerpiece.

## 5. The demo (45% of score — design backward from this)

90-second arc the judges watch:
1. Operator picks "Mr. Tarun — arriving tomorrow, flight UA328, Rosewood Sand Hill."
2. Hit **Orchestrate**. The reasoning trace streams live (pulling history → checking flight → matching host → drawing the creepy-line).
3. Four artifacts render, beautifully. Judge sees the room spec, the itinerary, and the host assignment: *"Maria — who hosted Mr. Tarun in Bangkok last year — will greet him at the door."*
4. The kicker: open the Host Brief, show the `doNotMention` panel. "The system knows it's his anniversary from his calendar signal — but it tells Maria to let him mention it first. That's the line between *they just knew* and *that's creepy*."
5. One tasteful 15-sec ElevenLabs moment: the brief read aloud to Maria as a voice memo she'd get on shift.

## 6. Scope

**IN (must build):**
- Guest selector + 3-4 seeded fictional returning guests
- Claude-powered orchestration producing all 4 artifacts against the frozen schema
- Confidence scoring + the `doNotMention` guardrail (this is the differentiator — do not cut it)
- Host-matching logic with visible reasons
- A polished single-screen demo UI with the live reasoning trace
- One ElevenLabs voice-brief moment

**OUT (do not build — scope killers):**
- Real PMS/CRM integration (mock all data)
- Auth, accounts, multi-user, databases (in-memory / JSON only)
- Mobile app, real flight API contracts (a mock flight file is fine; AviationStack only if trivial)
- Anything on the banned list below

## 7. Banned (instant DQ per event rules — do not let Claude drift here)

No basic RAG app, no Streamlit, no image analyzer, no education chatbot, no nutrition/medical/mental-health advisor, no personality analyzer. GuestFlow is an **agentic orchestration product**, not a chatbot.

## 8. Tech stack

- **Orchestration:** Claude via Anthropic API (the agentic spine). Use tool-use / structured JSON output against `/shared/types.ts`.
- **Voice:** ElevenLabs TTS — one tasteful moment only.
- **Web:** lightweight + fast (Vite + React or Next.js). Whatever renders the trace and 4 artifacts beautifully fastest.
- **Data:** static JSON in `/data`. No DB.
- **Deploy:** Vercel (have it ready tonight).

## 9. Success criteria (mapped to judging)

| Judging axis | Weight | How GuestFlow wins it |
|---|---|---|
| Live Demo | 45% | The live reasoning trace + 4 rendered artifacts + voice moment; rehearsed, reliable, no live API gambling (pre-warm/cache a fallback run) |
| Creativity & Originality | 35% | The confidence + `doNotMention` creepy-line layer; host-continuity mechanism. Not in any shipped competitor. |
| Impact Potential | 20% | Validated market gap; investor-legible (adjacent co. Canary raised $80M); maps to Rosewood's actual "Sense of Place" philosophy. |

## 10. Timeline (Sat May 16)

- 9–10:00 — arrive, team formed, repo + schema frozen, roles locked
- 10:30 — hacking starts, 3 parallel Claude Code sessions
- **1:00 — FIRST FULL INTEGRATION (mandatory; do not skip)** + lunch
- 1:00–4:00 — build to demo-complete; integrate hourly
- 4:00 — feature freeze. Only polish + rehearse after this.
- 4:00–5:00 — rehearse the 90-sec demo ≥3 times; record the 1-min submission video
- 5:00 — submit (repo public ✔, demo link live ✔, all teammates added ✔)
