# GuestFlow

**Agentic arrival orchestration for luxury hotels.**  
Built at *Hospitality 2030 — A Rosewood Sand Hill Hackathon* · May 16, 2026

---

## What It Does

The moment a returning guest's reservation hits the system, GuestFlow's agentic pipeline autonomously assembles a bespoke arrival — no staff intervention required until the guest walks through the door.

Claude chains through a multi-lens orchestration pass, pulling:

- **Guest history** — past stay notes, room preferences, cultural/apparel context
- **Live flight status** — delay math, revised ETA, late-arrival triggers
- **Timezone & climate delta** — origin → destination shift for circadian recovery planning
- **Booking metadata** — rate code, party composition, email domain, day-of-week patterns
- **Origin country tech profile** — plug type, voltage, preferred telecom (WhatsApp vs. SMS)

It applies four lenses to every reservation:

| Lens | What It Does |
|---|---|
| **Guest Purpose Lens** | Vacationer → high-touch butler · Business/Corporate → "silent convenience" |
| **Party Composition Lens** | Detects infants, children's ages, solo adults; provisions accordingly (cribs, scavenger hunt passports, diaper pails) |
| **Cultural Nuance Lens** | Derives apparel hardware, greeting protocols, dietary defaults from past stay notes — never from name-based inference alone |
| **Tech Continuity Lens** | Bridges international plug gaps, eSIM provisioning, local connectivity norms |

---

## The Three Arrival Artifacts

### 1 · Staff Pre-Arrival Brief
A host-facing brief with subtle service notes, purpose alignment, and the **doNotMention layer** — the explicit line between *"they just knew"* and *"that's creepy."*

> *"Mr. Singh's flight UA328 from London is delayed 40 min. Party: 2 adults, 1 child (6), 1 infant. Rate: Andreessen Horowitz corporate. Purpose Lens: Business/Relocation. Prioritize silent convenience — no room tour, no butler unpacking. Offer chilled citrus at door, hand keys immediately, escort directly to suite. Cultural note: Guest wears a turban; do not offer to take headwear at entry. Tech note: Use WhatsApp only after explicit opt-in — not SMS."*

### 2 · Room & Amenity Spec
Auto-generated and tailored across five axes — Environment, Culture, Purpose, Party, and Tech.

> *Desk cleared of all hotel collateral for immediate laptop use. Steamer pre-staged outside closet. Lighting dim/warm on arrival. Thermostat locked at 65 °F. Smart humidifier counters climate transition. Wooden crib + diaper pail placed away from high-traffic zones. Two Type-G-to-US adapters pre-plugged into bedside outlets. Complimentary eSIM QR code on desk. Padded turban stand + rounded hangers in master closet. Rosewood Explorers scavenger hunt passport + locally sourced tart cherry juice on the children's bed.*

### 3 · Guest-Facing Pre-Loaded Itinerary
Tiered by age, circadian recovery stage, trip purpose, and climate shock.

> *Adult module: 7 AM garden walk for sunlight exposure. Explorer module: morning pool games. Tech quick-start: eSIM activation guide. Family-overlap module: quiet early dinner to beat jet lag. All proactive butler upsells suppressed — business rate active.*

---

## The Confidence + Consent Layer (the "Creepy Line")

Luxury operators' #1 objection to AI personalization is the creepiness risk. GuestFlow makes its reasoning **visible** — and only auto-acts on high-confidence, non-invasive inferences.

**Auto-Act (High Confidence / Non-Invasive)**
- Set room temp to 65 °F based on origin climate
- Place diaper pail — `children_ages` includes a 6-month-old
- Place padded turban stand — past stay notes explicitly mention it
- Pre-install correct international adapters from `origin_country_tech_profile`
- Skip 5-minute room tour — guest arriving at 11 PM on corporate rate

**Staff Suggestion (Borderline / Would Feel Invasive if Silent)**
- *"Do not place a prayer mat — inferred from last name only. Too low confidence. No auto-action."*
- *"Do not text guest on WhatsApp pre-arrival without explicit opt-in."*
- *"Do not auto-unpack luggage — invasive on a business rate. Leave steamer visible; surface expedited pressing via iPad menu instead."*

The agent shows its full chain-of-thought so staff can audit every decision.

---

## Demo Flow

Type a guest name + flight number → hit **Go** → watch Claude chain through the full orchestration live:

1. Pulls seeded guest history + mock flight status
2. Applies all four lenses in sequence
3. Evaluates each inference against the confidence/consent layer
4. Generates the brief, room spec, and itinerary simultaneously
5. ElevenLabs reads the staff brief aloud as a 20-second voice memo to the GM

---

## Run Locally

```bash
cp .env.example .env        # add ANTHROPIC_API_KEY and ELEVENLABS_API_KEY
npm install
npm run dev
```

---

## Structure
