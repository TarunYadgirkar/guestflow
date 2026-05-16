# GuestFlow — Data Contract (SCHEMA)

> **This is frozen at 10:00 AM. Changing it after that requires a 60-second team huddle and everyone re-pulls.**
> The TypeScript version in `/shared/types.ts` is the canonical machine copy. This doc explains it and gives a filled-in example.
> Legend: **(core)** = must build · *(nice)* = only if ahead of schedule.

---

## Entity: `Guest`

| Field | Type | Notes |
|---|---|---|
| `id` | string | e.g. `"g_tarun"` **(core)** |
| `title` | string | "Mr." / "Dr." / "Ms." **(core)** |
| `firstName` | string | **(core)** |
| `lastName` | string | **(core)** |
| `loyaltyTier` | string | e.g. "Rosewood Elite" **(core)** |
| `languages` | string[] | e.g. `["English","Mandarin"]` **(core)** |
| `preferences` | `Preferences` | see below **(core)** |
| `stayHistory` | `PastStay[]` | drives continuity + personalization **(core)** |
| `upcomingReservation` | `Reservation` | the trigger **(core)** |
| `signals` | `Signal[]` | soft inferred signals — *the creepy-line input* **(core)** |

### `Preferences`
| Field | Type | Notes |
|---|---|---|
| `water` | "still" \| "sparkling" | **(core)** |
| `roomTempF` | number | **(core)** |
| `pillowType` | string | "firm" / "down" / "hypoallergenic" **(core)** |
| `floor` | "high" \| "low" \| "any" | **(core)** |
| `quietRoom` | boolean | **(core)** |
| `dietary` | string[] | `["vegan","no shellfish"]` **(core)** |
| `wakeUpTime` | string \| null | "06:00" or null **(core)** |
| `interests` | string[] | `["wine","contemporary art","trail running"]` **(core)** |

### `PastStay`
| Field | Type | Notes |
|---|---|---|
| `property` | string | "Rosewood Bangkok" **(core)** |
| `checkIn` / `checkOut` | string (ISO date) | **(core)** |
| `hostStaffId` | string \| null | who hosted them — continuity key **(core)** |
| `serviceNotes` | string | free text **(core)** |
| `highlight` | string | what delighted them *(nice)* |

### `Reservation`
| Field | Type | Notes |
|---|---|---|
| `property` | string | **(core)** |
| `checkIn` / `checkOut` | string (ISO date) | **(core)** |
| `roomType` | string | **(core)** |
| `partySize` | number | **(core)** |
| `flightNumber` | string \| null | **(core)** |
| `occasion` | string \| null | "anniversary" / "business" / null **(core)** |

### `Signal` — *the creepy-line input*
| Field | Type | Notes |
|---|---|---|
| `kind` | string | "calendar" / "social" / "loyalty" / "weather" **(core)** |
| `detail` | string | "anniversary on stay dates (from linked calendar)" **(core)** |
| `sensitivity` | "low" \| "medium" \| "high" | high = likely `doNotMention` **(core)** |

---

## Entity: `StaffMember`

| Field | Type | Notes |
|---|---|---|
| `id` | string | `"s_maria"` **(core)** |
| `name` | string | **(core)** |
| `role` | string | "Guest Experience Host" / "Concierge" **(core)** |
| `languages` | string[] | **(core)** |
| `specialties` | string[] | `["wine & F&B","local culture"]` **(core)** |
| `pastGuestIds` | string[] | guests they personally hosted → continuity **(core)** |
| `onShift` | boolean | **(core)** |
| `currentLoad` | number | # guests assigned (load-balance) *(nice)* |

---

## Output Artifacts

### 1. `RoomSpec` **(core)**
| Field | Type | Notes |
|---|---|---|
| `temperatureF` | number | |
| `lightingScene` | string | e.g. "Warm Dim" \| "Jetlag Recovery" |
| `pillowType` | string | |
| `minibar` | string[] | |
| `welcomeAmenity` | `{ item: string; rationale: string; isSartorialRescue?: boolean }` | rationale ties to "Sense of Place" |
| `backOfficeStandbyItems` | `Array<{ item, rationale }>` | Items held in back office (Standby Protocol) |
| `environmentNotes` | string[] | "blackout blinds preset" |
| `confidence` | number (0–1) | |
| `autoApplied` | boolean | true if confidence ≥ 0.8 |

### 2. `GuestItinerary` **(core)**
`items: ItineraryItem[]` where `ItineraryItem`:
| Field | Type | Notes |
|---|---|---|
| `title` | string | a real, specific local thing |
| `type` | "dining"\|"cultural"\|"wellness"\|"excursion" | |
| `when` | string | "Fri 7:30 PM" |
| `description` | string | English version |
| `translatedDescription` | string \| null | Native Language version (Language Lens) |
| `whyThisGuest` | string | personalization rationale |
| `confidence` | number (0–1) | |
| `status` | "auto"\|"staff-review" | |

### 3. `HostAssignment` **(core)**
| Field | Type | Notes |
|---|---|---|
| `assignedStaffId` | string | |
| `continuityFlag` | boolean | hosted this guest before |
| `matchReasons` | `MatchReason[]` | `{ factor, detail, weight }` factor ∈ continuity\|language\|affinity\|availability |
| `confidence` | number (0–1) | |

### 4. `HostBrief` **(core)** — the showpiece
| Field | Type | Notes |
|---|---|---|
| `forStaffId` | string | |
| `greeting` | string | warm, by name, references something specific & safe |
| `keyFacts` | string[] | the 3–5 must-knows |
| `serviceNotes` | string[] | subtle things to do |
| `doNotMention` | string[] | **inferred but must NOT be said aloud — the differentiator** |
| `flightStatus` | `{ flightNumber, status, scheduledArrival, adjustedArrival, impact }` | |

### Top-level: `OrchestrationResult` **(core)**
| Field | Type |
|---|---|
| `guestId` | string |
| `generatedAt` | string (ISO) |
| `roomSpec` | RoomSpec |
| `itinerary` | GuestItinerary |
| `hostAssignment` | HostAssignment |
| `hostBrief` | HostBrief |
| `reasoningTrace` | `TraceStep[]` — `{ label, status, detail }` — drives the live "watch it think" animation |
| `overallConfidence` | number (0–1) |

---

## Worked example (one fully-populated guest — copy this shape into `guests.json`)

```json
{
  "id": "g_tarun",
  "title": "Mr.",
  "firstName": "Tarun",
  "lastName": "Y",
  "loyaltyTier": "Rosewood Elite",
  "languages": ["English", "Hindi"],
  "preferences": {
    "water": "still",
    "roomTempF": 68,
    "pillowType": "firm",
    "floor": "high",
    "quietRoom": true,
    "dietary": ["vegetarian"],
    "wakeUpTime": "06:00",
    "interests": ["contemporary art", "trail running", "natural wine"]
  },
  "stayHistory": [
    {
      "property": "Rosewood Bangkok",
      "checkIn": "2025-11-12",
      "checkOut": "2025-11-15",
      "hostStaffId": "s_maria",
      "serviceNotes": "Requested still water on arrival both days; ran at 6am; loved the rooftop.",
      "highlight": "Private gallery walk arranged by host"
    }
  ],
  "upcomingReservation": {
    "property": "Rosewood Sand Hill",
    "checkIn": "2026-05-17",
    "checkOut": "2026-05-19",
    "roomType": "Garden Suite",
    "partySize": 2,
    "flightNumber": "UA328",
    "occasion": "anniversary"
  },
  "signals": [
    { "kind": "calendar", "detail": "Wedding anniversary falls on stay dates (linked calendar)", "sensitivity": "high" },
    { "kind": "weather", "detail": "Rain forecast on day 2", "sensitivity": "low" }
  ]
}
```

> Note how the `high` sensitivity anniversary signal becomes a `doNotMention` ("don't congratulate him on the anniversary — let him bring it up; instead quietly upgrade turndown") while still driving a warm action. **That contrast is the whole pitch.**
