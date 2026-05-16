# GuestFlow — Product Requirements Document (PRD)

> **Event:** Hospitality 2030 — A Rosewood Sand Hill Hackathon (Sat May 16, 2026)
> **Team:** GuestFlow (3 people)
> **Problem statement targeted:** #1 Hyper-Personalized Arrival Orchestration (with elements of #2 The Invisible Concierge and #3 Post-Stay Continuity folded in)
> **This doc is the single source of truth. Paste it into Claude Code at the start of your session.**

---

## 1. One-line pitch

**GuestFlow turns a returning guest's reservation into a fully choreographed, human-delivered luxury arrival — automatically, and without crossing the line into surveillance.**

## 2. The problem (validated by the market)

Luxury hotels already hold everything they need to make a returning guest feel known — past stays, preferences, dietary needs, occasions. But that data sits in silos, and the system depends on a human reading a brief and remembering to act. At scale, with understaffed teams, they don't. A guest books their fifth stay; the room is still standard, the minibar generic, the front desk un-briefed.

Meanwhile, the startups solving this with silent automation (auto-adjusting rooms, predictive offer pop-ups) create the opposite problem for ultra-luxury: it feels like being watched, not being cared for.

## 3. The insight (this is the pitch)

Personalization delivered by a **warm, briefed human** feels like being *known*. The exact same intelligence delivered silently by a system feels like *surveillance*.

GuestFlow's job is not to replace the human touch — it's to make a specific, named staff member able to deliver it flawlessly, while explicitly drawing the line between "act on this warmly," "hold this in reserve," and "you know this but must never say it out loud."

This single mechanism touches all three of Rosewood's problem statements:
*   **PS1 (Arrival):** orchestrates the bespoke arrival end-to-end.
*   **PS2 (Invisible Concierge):** the confidence + "doNotMention" + "Back-Office Standby" layers answer the creepy-line design problem.
*   **PS3 (Continuity):** the same host is re-assigned across repeat stays → a real, remembered relationship.

## 4. What we're building

A single agentic pipeline. **Input:** select a returning guest with an upcoming reservation. The agent pulls stay history, live flight status, timezone delta, climate disparity, language profile, and local programming. It reasons over it with a visible confidence layer, and produces **four artifacts**:

1.  **Room & Amenity Spec**
    *   Auto-generates environmental and amenity pivots. Features the **Circadian Handshake** (ambient room OS adjusting lighting/temp for jetlag recovery), **Dynamic Empathy Amenities** (swapping standard champagne for bone broth/tea on delayed 2 AM arrivals), and **Sartorial Rescue** (pre-staging a loaner windbreaker if there's a 30°F climate drop). High-confidence items auto-apply.
    *   **Back-Office Standby Protocol:** For inferred religious, cultural, or highly specific dietary items (e.g., Sikh prayer mats, specialized teas based on demographics), the system does not auto-place them in the room (which is presumptuous). Instead, it clears respectful space in the room and physically sources the items to be held in the back office, ensuring a 60-second delivery only if the guest requests them.
2.  **Guest Itinerary (The Language Lens)**
    *   Genuinely specific local experiences happening during the guest's actual dates, matched to their biological clock and interests.
    *   **Dual-Language Format:** If the guest is non-native English speaking, the itinerary automatically generates side-by-side (Native Language / English) to ensure clarity without assuming a lack of English proficiency.
3.  **Host Assignment**
    *   Matches the right named staff member based on continuity (hosted them before), language fluency, affinity, and availability, with explicit match reasoning.
4.  **Host Brief**
    *   A warm, specific brief addressed to that named host: how to greet them, the 3-5 things to know, subtle service notes, and live flight impact.
    *   **The doNotMention list:** Things the system inferred but the host must never say aloud (e.g., "We saw your flight was delayed" or "We know it's your anniversary").

A live **reasoning trace** ("watch it orchestrate") is shown during generation — this is the demo centerpiece.

## 5. The demo (45% of score — design backward from this)

The 90-second arc the judges watch:

1.  Operator picks **"Mr. Singh — arriving tomorrow, flight UA328, Rosewood Sand Hill."**
2.  Hit **Orchestrate**. The reasoning trace streams live (pulling history → checking flight → matching host → drawing the creepy-line / back-office standby logic).
3.  **The Pivot (Dynamic Injection):** Operator injects a 4-hour mock flight delay. The trace instantly updates: *"Late arrival + timezone delta detected. Pivoting amenity from Champagne to Recovery Protocol. Executing Circadian Handshake (locking room at 2700K / 65°F)."*
4.  Four artifacts render beautifully. Judge sees the tailored room spec, the dual-language itinerary, and the host assignment: *"Maria — who hosted Mr. Singh in London last year and speaks fluent Hindi — will greet him at the door."*
5.  The kicker: Open the Host Brief, show the **doNotMention panel** and **Standby logic**. *"The system inferred Mr. Singh is Sikh based on past apparel notes. It tells Maria NOT to place a prayer mat in the room (creepy/presumptuous). Instead, it clears a high shelf for his personal items, puts the mat in back-office standby, and gives Maria the address to the San Jose Gurdwara."*
6.  One tasteful 15-sec ElevenLabs moment: the brief read aloud to Maria as a voice memo she'd get on shift.

## 6. Scope

**IN (must build):**
*   Guest selector + 3-4 seeded fictional returning guests (ensure diverse profiles for the Language Lens and Standby Protocol).
*   Claude-powered orchestration producing all 4 artifacts against the frozen schema.
*   Contextual triggers: Circadian Handshake, Dynamic Empathy, Sartorial Rescue, Language Lens, Back-Office Standby.
*   Confidence scoring + the doNotMention guardrail (this is the differentiator — do not cut it).
*   Host-matching logic with visible reasons.
*   A polished single-screen demo UI with the live reasoning trace.
*   One ElevenLabs voice-brief moment.

**OUT (do not build — scope killers):**
*   Real PMS/CRM integration (mock all data).
*   Auth, accounts, multi-user, databases (in-memory / JSON only).
*   Mobile app, real flight/weather API contracts (mock data files for flight delays and climate drops are required).
*   Anything on the banned list below.

## 7. Banned (instant DQ per event rules — do not let Claude drift here)

No basic RAG app, no Streamlit, no image analyzer, no education chatbot, no nutrition/medical/mental-health advisor, no personality analyzer. GuestFlow is an **agentic orchestration product**, not a chatbot.

## 8. Tech stack

*   **Orchestration:** Claude via Anthropic API (the agentic spine). Use tool-use / structured JSON output against `/shared/types.ts`.
*   **Voice:** ElevenLabs TTS — one tasteful moment only.
*   **Web:** lightweight + fast (Vite + React or Next.js). Whatever renders the trace and 4 artifacts beautifully fastest.
*   **Data:** static JSON in `/data`. No DB.
*   **Deploy:** Vercel (have it ready tonight).

## 9. Success criteria (mapped to judging)

| Judging Axis | Weight | How GuestFlow wins it |
| :--- | :--- | :--- |
| **Live Demo** | 45% | Live reasoning trace + dynamic flight delay pivot + dual-language UI + voice moment; rehearsed, reliable, no API gambling. |
| **Creativity & Originality** | 35% | The doNotMention layer, Back-Office Standby protocol, Circadian Handshake, and Language Lens. Not in any shipped competitor. |
| **Impact Potential** | 20% | Validated market gap (Canary raised $80M); perfectly maps to Rosewood's actual "Sense of Place" philosophy without surveillance risk. |

## 10. Timeline (Sat May 16)

*   **9:00–10:00:** Arrive, team formed, repo + schema frozen, roles locked.
*   **10:30:** Hacking starts, 3 parallel Claude Code sessions.
*   **1:00:** FIRST FULL INTEGRATION (mandatory; do not skip) + lunch.
*   **1:00–4:00:** Build to demo-complete; integrate hourly.
*   **4:00:** Feature freeze. Only polish + rehearse after this.
*   **4:00–5:00:** Rehearse the 90-sec demo ≥3 times; record the 1-min submission video.
*   **5:00:** Submit (repo public ✔, demo link live ✔, all teammates added ✔).
