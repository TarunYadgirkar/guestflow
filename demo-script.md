# GuestFlow — Demo Runbook & Pitch Script

> Demo is **45%** of the score and judged by Rosewood execs + investors. This document is owned by Person C and rehearsed by the whole team ≥3 times before 5 PM. Round 1 demo is ~3 min + 1–2 min Q&A.

---

## The golden rules

1. **Never gamble on a live API in the demo.** Run the orchestration once before you present and have a cached `OrchestrationResult` ready as the default path. Live call is a *bonus*, not the spine.
2. **One guest, one story.** Don't show the system's range — show one guest's arrival become magic. Use `g_singh` (Sikh context + Language Lens + flight delay = every feature fires).
3. **End on the creepy-line.** It's the most original thing you have. Land it last; let it be the mic-drop.
4. **Show, don't narrate the tech.** Judges are operators and investors, not engineers. Talk guest experience and business, not prompts and JSON.

## The 90-second script (then ~30s buffer + Q&A)

**[0:00–0:15] The hook — the problem, stated as a story.**
> "A guest just booked their sixth stay with Rosewood. You know he likes still water, a high quiet floor, that he ran every morning in Bangkok, and his language preference. Today, none of that reaches his room or the person at the door — because a busy human was supposed to remember. GuestFlow fixes that."

**[0:15–0:25] One click.**
> "His reservation arrives. We hit Orchestrate." *(click — the reasoning trace streams live)*

**[0:25–0:50] Watch it think, then the artifacts.**
> "It's pulling his history, checking flight UA328 — delayed 4 hours — reading the local programming around Sand Hill, and drawing one line most systems never do." *(four panels render)* "His room: 65°, Jetlag Recovery lighting, and a welcome amenity of bone broth and tea — because his 2 AM arrival triggered our Dynamic Empathy protocol."

**[0:50–1:05] The human layer (continuity & language).**
> "It doesn't hand this to a screen. It assigns Maria — who hosted him in London last year and speaks fluent Hindi — and gives her a brief. It even generates his itinerary in side-by-side Hindi and English via our Language Lens, ensuring he feels known, not just processed."

**[1:05–1:30] The kicker — the creepy line & standby logic. Slow down here.**
> "Here's the part that matters for luxury." *(open the doNotMention panel)* "The system inferred Mr. Singh is Sikh from past notes. It does **not** place a prayer mat in the room — that would be presumptuous. Instead, it places it in **Back-Office Standby** and clears a respectful space in the room. Maria knows where the local Gurdwara is, but only if he asks. That's the difference between *'they just knew'* and *'that's creepy'* — and that line is the product." *(optional 15s: play the ElevenLabs voice brief Maria would hear on shift.)*

**Close (one breath):**
> "Validated market, Rosewood's own philosophy, delivered through people — not instead of them. That's GuestFlow."

## Roles during the live demo

- **Driver** (clicks, never talks) — owns the laptop, has the cached run loaded, browser already on the screen, zoom level set, notifications off.
- **Narrator** (talks, never touches the laptop) — runs the script, makes eye contact with judges.
- **Closer/Q&A** — handles questions; pre-load answers to the likely three below.

## Q&A — pre-loaded answers

- *"How is this different from [Canary / Riviera / Lance]?"* → "Those automate calls and ops. We orchestrate the *arrival* through a briefed human, and we're the only one that explicitly engineers the surveillance line — which is the #1 luxury objection to personalization."
- *"Is the data real?"* → "Seeded for the demo; the contract maps 1:1 to a real PMS/CRM — that's an integration, not a redesign."
- *"What's the business?"* → "Per-property SaaS to luxury operators; adjacent co. Canary just raised $80M. We start where the gap is widest: returning-guest arrivals."
- *"Privacy?"* → "The `doNotMention` layer *is* the privacy feature — inferred-but-sensitive signals are walled off from anything said to the guest, by design."
- *"Language Lens and Standby?"* → "The Language Lens ensures clarity without assuming a lack of proficiency. The Back-Office Standby ensures cultural readiness without the creepiness of assumption. Both reinforce Rosewood's 'Sense of Place' and 'Sense of Person'."

## Pre-demo checklist (run at 4:45 PM)

- [ ] Cached orchestration result loads instantly, offline
- [ ] Screen mirrored/tested on the actual presentation display
- [ ] Browser zoom set so the back row can read the panels
- [ ] Notifications + Slack/Discord silenced; laptop charged + plugged
- [ ] ElevenLabs clip pre-rendered to a local file (don't generate it live)
- [ ] Narrator has done the full run start-to-finish ≥3 times out loud
- [ ] 1-minute submission video recorded and uploaded before 5 PM
