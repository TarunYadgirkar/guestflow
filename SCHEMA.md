# ADR-001: Schema Extensions for Language Lens and Back-Office Standby Protocol

**Status:** Accepted  
**Date:** 2026-05-16  
**Deciders:** GuestFlow team (Hackathon — Hospitality 2030, Rosewood Sand Hill)  
**Context doc:** GuestFlow PRD

---

## Context

GuestFlow includes two first-class features that require non-trivial data contract decisions:

1. **Language Lens** — Guest-facing itineraries must render side-by-side in the guest's native language and English when the guest is non-native English speaking. The decision is a courtesy, not an assumption of low English proficiency.

2. **Back-Office Standby Protocol** — For inferred religious, cultural, or highly specific items (e.g., a prayer mat, a specific ceremonial tea), the system must *not* auto-place them in the room. Instead it must: (a) clear respectful physical space, (b) physically source and hold the item in back-office, and (c) equip the host to offer it within 60 seconds only on guest request. This is the hardest edge of the "creepy line" design problem.

Both features interact with the existing confidence/`doNotMention` layer and must be modeled without blurring that boundary.

---

## Decision

### Language Lens — chosen approach: inline `localizedContent` block on `ItineraryItem`

Each `ItineraryItem` carries an optional `localizedContent` field containing the native-language title and description alongside the English originals. The `GuestItinerary` parent gains a `nativeLanguage` string and a `dualLanguage` boolean that downstream renderers use to decide layout (side-by-side columns vs. English-only).

**Why not a separate parallel itinerary object?**  
A parallel object doubles the array surface area, forces the UI to zip two arrays in sync, and creates a desync risk during dynamic pivots (e.g., a flight delay that re-orders items). Inline localization keeps the pivot atomic — one item update changes both language tracks simultaneously.

**Why not a `translations: Record<string, { title, description }>` map?**  
Overkill for the two-language scope. The inline block is simpler to generate in a single Claude structured-output call and simpler to render without a lookup.

### Back-Office Standby — chosen approach: `StandbyItem[]` on `RoomSpec`, not on `HostBrief`

Standby items are a *room-readiness* concern (sourcing, placement, back-office logistics) that happens before the host ever touches the brief. Attaching them to `RoomSpec` keeps the correct ownership: Housekeeping/Operations reads `RoomSpec`; the host reads `HostBrief`. The host brief then carries a lean `backOfficeStandbyInstructions: string[]` — plain-language cues for how to *offer* the item conversationally, not what to fetch.

**Why not only on `HostBrief`?**  
The host brief is the *last mile*. Sourcing the prayer mat and clearing the shelf must happen during room prep, hours before the host's shift begins. Attaching it solely to the brief risks the item never being sourced.

**Why not a standalone top-level `StandbyManifest`?**  
Adds a fifth artifact to the output contract with no new information. The `OrchestrationResult` is already four artifacts plus a reasoning trace; a fifth object would fragment the demo UI for marginal semantic clarity.

---

## Options Considered

### Language Lens

| | Option A: Inline `localizedContent` (chosen) | Option B: Parallel itinerary object | Option C: `translations` map |
|---|---|---|---|
| Complexity | Low | Medium | Low |
| Dynamic pivot safety | High — one update keeps both tracks in sync | Low — two arrays can desync | High |
| UI rendering | Simple (check `dualLanguage` flag, render two columns) | Complex (zip two arrays) | Simple |
| Extensibility (3+ languages) | Requires refactor | Requires refactor | Native support |
| MVP fit | ✅ | ❌ | ✅ (over-engineered) |

### Back-Office Standby

| | Option A: `StandbyItem[]` on `RoomSpec` (chosen) | Option B: Only on `HostBrief` | Option C: Standalone `StandbyManifest` |
|---|---|---|---|
| Operational timing | Correct — room prep phase | Too late — brief read at shift start | Correct |
| Artifact count | No change (4 artifacts) | No change | Adds 5th artifact |
| Ownership clarity | Clear (Housekeeping owns) | Blurred (host owns sourcing?) | Clear |
| Demo complexity | Low | Low | Higher |

---

## New & Modified Entities

### New: `OriginProfile`
Captures the guest's departure context — timezone, climate, plug type, and preferred communication channel. Feeds the Circadian Handshake, Sartorial Rescue, and Tech Continuity logic.

```typescript
interface OriginProfile {
  timezone: string;          // e.g. "Asia/Kolkata"
  climateF: number;          // departure city temp in °F
  plugType: string;          // e.g. "Type D" (India), "Type G" (UK)
  preferredTelecom: "WhatsApp" | "WeChat" | "SMS" | "iMessage";
}
```

Added to: `Guest.originProfile`

---

### New: `CircadianHandshake`
Environmental adjustments derived from timezone delta and arrival time. Always `autoApplied: true` (objective origin data — no creepy-line risk).

```typescript
interface CircadianHandshake {
  lightingKelvin: number;    // 2700K (warm/sleep) for late-night arrivals; 5000K (alert) for morning
  temperatureF: number;      // adjusted from guest preference + climate delta math
  blackoutBlinds: boolean;
  rationale: string;         // human-readable reasoning for the reasoning trace
}
```

Added to: `RoomSpec.circadianHandshake`

---

### New: `SartorialRescue`
Pre-staged loaner items triggered by a ≥20°F climate delta between origin and destination. `autoApplied` if delta is objective and large; `staff-review` for borderline cases.

```typescript
interface SartorialRescue {
  items: string[];           // e.g. ["loaner windbreaker", "compact umbrella"]
  climateDeltaF: number;     // the computed drop that triggered this
  rationale: string;
  status: "auto" | "staff-review";
}
```

Added to: `RoomSpec.sartorialRescue` (nullable)

---

### New: `DynamicEmpathyAmenity`
Replaces the default welcome amenity when arrival conditions change (late flight + timezone delta → recovery pivot). The `trigger` field feeds the live reasoning trace.

```typescript
interface DynamicEmpathyAmenity {
  original: string;          // "Champagne & strawberries"
  replacement: string;       // "Bone broth, chamomile tea, electrolyte water"
  trigger: string;           // "Late arrival (est. 2 AM) + 9.5hr timezone delta"
  rationale: string;
  autoApplied: boolean;
}
```

Added to: `RoomSpec.dynamicEmpathyAmenity` (nullable — null when no pivot needed)

---

### New: `StandbyItem`
The atomic unit of the Back-Office Standby protocol. Never auto-placed in the room.

```typescript
interface StandbyItem {
  item: string;                          // "Sikh prayer mat"
  category: "religious" | "cultural" | "dietary" | "wellness";
  inferenceSource: string;               // "Past stay note: requested turban stand at Rosewood London"
  confidence: number;                    // 0–1; always < 0.8 (else it would be auto-applied)
  deliveryPromise: string;               // "60-second back-office delivery on request"
  roomClearanceNote: string;             // "High shelf cleared; personal tray placed"
  localResourceInfo?: string;            // "San Jose Gurdwara: 3636 Gurdwara Ave, San Jose, CA"
}
```

Added to: `RoomSpec.backOfficeStandby: StandbyItem[]`

---

### New: `FlightStatus` (extracted to top-level)
Previously buried inside `HostBrief.flightStatus` as an inline object. Promoted to a named interface and moved to `OrchestrationResult` so all four artifacts can react to it independently (e.g., the Room Spec uses it for the Dynamic Empathy pivot, not just the Host Brief).

```typescript
interface FlightStatus {
  flightNumber: string;
  status: "on-time" | "delayed" | "cancelled";
  scheduledArrival: string;   // ISO 8601 datetime
  adjustedArrival: string;    // ISO 8601 datetime
  delayMinutes: number;       // 0 if on-time
  impact: string;             // "Recovery Protocol activated; amenity swap executed"
}
```

Added to: `OrchestrationResult.flightStatus`; `HostBrief.flightStatus` now references this type (not an inline shape).

---

### Modified: `ItineraryItem` — Language Lens addition

```typescript
interface LocalizedContent {
  language: string;           // e.g. "Hindi", "Mandarin"
  title: string;
  description: string;
}

interface ItineraryItem {
  // ... all existing fields unchanged ...
  localizedContent?: LocalizedContent;  // present only when GuestItinerary.dualLanguage = true
}
```

---

### Modified: `GuestItinerary` — Language Lens flag

```typescript
interface GuestItinerary {
  nativeLanguage: string | null;   // null = English-only; "Hindi" = trigger dual-language layout
  dualLanguage: boolean;           // derived: nativeLanguage !== null && nativeLanguage !== "English"
  items: ItineraryItem[];
}
```

---

### Modified: `Guest` — origin profile + explicit preferred language

```typescript
interface Guest {
  // ... all existing fields unchanged ...
  preferredLanguage: string;       // explicit first language — drives Language Lens
  originProfile: OriginProfile;    // new — drives Circadian Handshake, Sartorial Rescue, Tech Continuity
}
```

---

### Modified: `RoomSpec` — all new protocol fields

```typescript
interface RoomSpec {
  // ... all existing fields unchanged ...
  circadianHandshake: CircadianHandshake;
  sartorialRescue: SartorialRescue | null;
  dynamicEmpathyAmenity: DynamicEmpathyAmenity | null;
  backOfficeStandby: StandbyItem[];
}
```

---

### Modified: `HostBrief` — standby instructions + voice brief

```typescript
interface HostBrief {
  // ... all existing fields unchanged ...
  backOfficeStandbyInstructions: string[];  // how to conversationally offer standby items
  voiceBriefUrl?: string;                   // ElevenLabs TTS URL — generated post-orchestration
}
```

---

### Modified: `OrchestrationResult` — promoted FlightStatus

```typescript
interface OrchestrationResult {
  // ... all existing fields unchanged ...
  flightStatus: FlightStatus;   // promoted from inline HostBrief field; all artifacts reference this
}
```

---

## Trade-off Analysis

**Inline localization vs. separate translation layer**  
The inline approach is correct for the demo: the flight delay pivot must atomically update the itinerary in both languages. A translation service indirection would require a second async call during the pivot, adding latency and a failure mode that could break the live demo.

**StandbyItem on RoomSpec vs. HostBrief**  
The RoomSpec placement correctly models the operational timeline (sourcing happens during room prep, not at shift start) and enforces the ownership boundary (Housekeeping vs. Host). The tradeoff is that `HostBrief` must carry a second field (`backOfficeStandbyInstructions`) as a lightweight echo — but those instructions are conversational language, not operational data, so the duplication is intentional and appropriate.

**FlightStatus promotion**  
Promoting `FlightStatus` to `OrchestrationResult` creates a single source of truth that both the Room Spec pivot logic and the Host Brief can reference. The tradeoff is a slightly larger top-level object, which is a non-issue for an in-memory JSON system.

---

## Consequences

What becomes easier:
- The demo's flight delay pivot naturally triggers `DynamicEmpathyAmenity` and `CircadianHandshake` updates from a single `FlightStatus` mutation — no cascading field updates across multiple artifacts.
- The Back-Office Standby UI can be driven entirely from `RoomSpec.backOfficeStandby`, keeping the Host Brief panel clean.
- Dual-language itinerary rendering is a single conditional on `GuestItinerary.dualLanguage`; no separate data fetching path.

What becomes harder:
- Generating `localizedContent` for every `ItineraryItem` requires the Claude orchestration prompt to output structured JSON for two languages simultaneously. Prompt must be explicit that this is an optional field gated on `dualLanguage`.
- Mock `guests.json` data must now include `originProfile` and `preferredLanguage` for each seeded guest to exercise all code paths.

---

## Action Items

1. [x] ADR written and accepted by team
2. [ ] Freeze `types.ts` with all new interfaces by 10:00 AM
3. [ ] Update `guests.json` seed data: add `originProfile`, `preferredLanguage`, and at least one guest with `languages[0] !== "English"` (Language Lens) and one with a religion/culture-inferred past stay note (Standby Protocol)
4. [ ] Update Claude orchestration system prompt to output `localizedContent` blocks and `StandbyItem[]` in structured JSON
5. [ ] Confirm UI layout: dual-column itinerary renderer; standby panel in RoomSpec card; `doNotMention` + standby instruction panels in Host Brief
