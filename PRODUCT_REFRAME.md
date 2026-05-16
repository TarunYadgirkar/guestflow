# GuestFlow → Rosewood Operations Dashboard (Reframe)

## From: Agentic arrival orchestration (futuristic)
## To: Realistic butler/concierge operations tool (today)

---

## Core Principle

This tool surfaces:
- **Guest profile data** that Rosewood explicitly collects: contact info, stay history, preferences (room, dietary, language, interests, ages of children), spend/dates, loyalty tier, advisor relationship
- **Operational data**: reservation details, room type, package, property, dates, on-property bookings, Elite status
- **Consent-based data only**: if calendar/social integration exists, it's opt-in and clearly labeled

It does NOT imply scraping social media, personal calendars, or LinkedIn unless the guest explicitly enables it in settings.

---

## Screen 1: Arrivals & VIP Dashboard

**Purpose**: Front-of-house sees who's arriving, their tier, trip purpose, key needs, and assigned hosts.

**Guest Cards** (arriving guests row):
- Name + title
- Loyalty tag: "Rosewood Elite", "VIP (via advisor)", "Corporate account", "Return guest"
- Trip purpose tag: "Anniversary – 9 yrs", "Family vacation", "Business – conference", "Wellness retreat"
- Language preference: "Prefers: Hindi & English" (plural languages OK, English assumed)
- Key restrictions: "Strict vegetarian, no eggs", "No alcohol", "Allergic: shellfish", "Ages 4 & 7"
- Status badges:
  - Concierge itinerary: ✓ Confirmed / ○ Requested / ✗ None
  - Assigned host: "Maria Santos" or "Unassigned"
  - Elite advisor: ✓ Yes / ○ No

**Controls**:
- Flight status dropdown: "On-time", "Delayed 30 min", "Delayed 2 hr", "Delayed 4+ hr" + ETA
- Room readiness: "Clean & ready", "Being cleaned", "Not ready"
- Trip purpose selector: for briefing/personalization
- Button: "Generate arrival plan" (replaces "Orchestrate")
- Checkbox: "Simulate delay (testing)" — clearly sandboxed

**Reasoning trace**:
Rewrite steps with real data sources:
1. "Pulled stay history" → "London (Nov 2024), Bangkok (Mar 2025). Yoga 6 AM, vegetarian no eggs, no turndown, 68°F."
2. "Current reservation & Elite advisor notes" → "Rosewood Elite, anniversary, traveling with Priya, Hindi greeting preferred."
3. "Flight status API: UA328 delayed 240 min. Late arrival → recovery focus."
4. "Room & welcome protocol adjusted: still water, herbal tea, warm lighting, recovery mindset."
5. "Assigned host Maria (continuity + Hindi fluency + wellness specialty)."
6. "Generated brief & notes for Maria + concierge team."

---

## Screen 2: Room Setup + Stay Plan

**Room & Amenity Spec** (left card):
Rename to "Room Setup Protocol"

Fields:
- Temperature setpoint (68°F, from preference or first-night default)
- Lighting scene: "Warm evening welcome", "Sleep-ready", "Full blackout"
- Blackout blinds: "Closed until natural wake", "Open on sunrise"
- Minibar: toggles for "Remove alcohol", "Stock sparkling water (companion)", "Add herbal tea for jet lag"
- Bedding: pillow type, extra blankets, kids amenities
- Service notes: "No turndown per past stay notes", "Do-not-disturb preferences", "Early wake-up yoga setup"
- (Rename "Circadian Handshake" → "Sleep & Jet Lag Protocol" or just "Room Environment")

**Guest Itinerary** (right card):
Reframe as "Stay Plan & On-Property Bookings"

Each item:
- Title: "Sunrise Yoga – Garden Terrace", "Cantor Arts Center tour", "Dinner at Madera"
- Date/time window
- Location: "On-property" or "Off-property (5 min drive)"
- Booking status: "Confirmed", "Requested", "Held", "Suggested"
- Source: "Included in package", "Guest requested", "Concierge suggested"
- Dietary/access notes: "Vegetarian, no alcohol, quiet seating"
- Language toggle: "English / Hindi" (for internal notes & host talk-track)

---

## Screen 3: Host & Brief

**Host Assignment** (left card):
- Name + role: "Maria Santos – Guest Experience Host"
- Languages: English, Hindi, Spanish, Portuguese
- Strengths: "Luxury arrival", "Cultural immersion", "Wellness", "Repeat-guest rapport"
- Match reasoning (realistic):
  - "Previously hosted in Bangkok & London; strong guest rapport noted."
  - "Shared languages: Hindi & English."
  - "On duty; current load: 1 guest."
  - **Avoid numeric match scores** — use qualitative: "Strong continuity match"

**Host Brief** (right card):
Primary talk-track & key facts for Maria:

- **Greeting**: "Warm and efficient. Guest arrives late (2:45 AM); will be tired. Greet in Hindi if possible."
- **Key facts**:
  - Status: "Rosewood Elite, 3rd stay, first at Sand Hill" (data source icon: past stays)
  - Occasion: "Anniversary – 9 years with Priya" (data source icon: reservation notes)
  - Dietary: "Strict vegetarian, no eggs; no alcohol; spicy-averse" (data source icon: guest profile + past stay notes)
  - Wellness: "6 AM yoga daily; uses personal meditation cushion; prefers 68°F" (data source icon: past stay notes)
  - Privacy: "Declined turndown; values privacy in public spaces" (data source icon: past stay notes)
  
- **Service notes**:
  - "High-floor Garden Suite preferred (noted in past stays)"
  - "Companion Priya: sparkling water, nut allergy — confirm with room service before breakfast"
  - "Type D adapter pre-placed; mention if cold weather"

- **Operational flags** (not shown to guest):
  - "No unsolicited offers of alcohol"
  - "Do-not-disturb on arrival unless guest requests help"
  - "Confirm any social dining before assuming group event"

- **Edit/Confirm** button: "Reconcile preferences at check-in" — host can mark any field as "Confirmed by guest" or "Updated to [new value]"

- **Voice brief** (optional): "Play brief aloud" — uses browser TTS or pre-recorded snippet

---

## Data Model Consistency

**Guest**:
- ID, name, title, contact
- Loyalty tier (Elite, VIP, regular)
- Elite advisor (name, contact)
- Languages (primary first)
- Preferences (room temp, pillow, bed, dietary, accessibility, privacy)
- Stay history (property, dates, notes, host, highlights)
- Upcoming reservation (property, dates, room type, party, rate, package)
- Trip purpose (from reservation or guest form)
- Consent flags (calendar integration, social media, marketing opt-in)

**Reservation**:
- Property, dates, room type, rate, package
- Party: primary guest, companions (names, ages, dietary)
- Trip purpose: anniversary, business, family, wellness, etc.
- Elite advisor assigned
- Concierge notes

**Itinerary Item**:
- Title, date/time, location, booking status
- Source (package, guest request, concierge)
- Dietary/access requirements

**Staff**:
- Name, role (host, concierge, butler, etc.)
- Languages, strengths
- Current assignments, load
- Past guest relationships

---

## Tone & Microcopy

- Professional, calm, operational
- No hype. When AI/automation is used, treat it as a quiet helper: "Suggested by system from past stays"
- Always assume explicit guest consent for sensitive data (dietary, health, wellness)
- Data source icons (small tooltip) show WHERE each fact came from: past stay notes, Elite advisor, guest form, reservation
- "Edit / Confirm with guest" on every preference so staff can reconcile real-time

---

## What Stays the Same

- Layout: same 3-screen flow
- Colors: luxury Rosewood palette (cream, gold, stone)
- Typography: Cormorant serif + Inter sans
- Component density: same card-based panels
- Animation: same trace animation, reasoning step reveal
