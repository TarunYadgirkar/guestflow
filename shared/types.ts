/**
 * GuestFlow — Canonical Data Contract
 * Frozen: 2026-05-16 10:00 AM
 *
 * Schema version: 1.1.0
 * ADR: ADR-001 (Language Lens + Back-Office Standby extensions)
 *
 * Changing this file after freeze requires a 60-second team huddle
 * and all teammates must re-pull.
 *
 * Legend:
 *   (core)  = must build
 *   (nice)  = only if ahead of schedule
 */

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORTING TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * (core) Captures the guest's departure-city context.
 * Feeds: CircadianHandshake, SartorialRescue, Tech Continuity lens.
 */
export interface OriginProfile {
  timezone: string;                                             // e.g. "Asia/Kolkata", "Europe/London"
  climateF: number;                                            // departure city temp in °F
  plugType: string;                                            // e.g. "Type D" (India), "Type G" (UK), "Type A" (US)
  preferredTelecom: "WhatsApp" | "WeChat" | "SMS" | "iMessage"; // communication channel to use
}

/**
 * (core) A soft inferred signal — the raw input to the confidence / creepy-line layer.
 * High sensitivity signals are almost always doNotMention candidates.
 */
export interface Signal {
  kind: "calendar" | "social" | "loyalty" | "weather";
  detail: string;             // e.g. "Wedding anniversary falls on stay dates (linked calendar)"
  sensitivity: "low" | "medium" | "high"; // high → likely doNotMention
}

// ─────────────────────────────────────────────────────────────────────────────
// GUEST ENTITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * (core) Guest preferences drawn from stay history and profile data.
 */
export interface Preferences {
  water: "still" | "sparkling";
  roomTempF: number;
  pillowType: "firm" | "down" | "hypoallergenic";
  floor: "high" | "low" | "any";
  quietRoom: boolean;
  dietary: string[];          // e.g. ["vegetarian", "no shellfish"]
  wakeUpTime: string | null;  // "06:00" | null
  interests: string[];        // e.g. ["contemporary art", "trail running", "natural wine"]
}

/**
 * (core) A single past stay record — the primary continuity + personalization signal.
 */
export interface PastStay {
  property: string;           // e.g. "Rosewood Bangkok"
  checkIn: string;            // ISO date
  checkOut: string;           // ISO date
  hostStaffId: string | null; // continuity key — who hosted them
  serviceNotes: string;       // free-text notes from that stay
  highlight?: string;         // (nice) what specifically delighted them
}

/**
 * (core) The upcoming reservation — the pipeline trigger.
 */
export interface Reservation {
  property: string;
  checkIn: string;            // ISO date
  checkOut: string;           // ISO date
  roomType: string;           // e.g. "Garden Suite"
  partySize: number;
  flightNumber: string | null;
  occasion: string | null;    // "anniversary" | "business" | "birthday" | null
}

/**
 * (core) Root guest entity.
 * v1.1 additions: preferredLanguage, originProfile
 */
export interface Guest {
  id: string;                          // e.g. "g_tarun"
  title: string;                       // "Mr." | "Dr." | "Ms."
  firstName: string;
  lastName: string;
  loyaltyTier: string;                 // e.g. "Rosewood Elite"
  preferredLanguage: string;           // (v1.1) explicit primary language — drives Language Lens
  languages: string[];                 // all spoken languages, primary first
  originProfile: OriginProfile;        // (v1.1) departure context
  preferences: Preferences;
  stayHistory: PastStay[];
  upcomingReservation: Reservation;
  signals: Signal[];                   // soft inferred signals — creepy-line input
}

// ─────────────────────────────────────────────────────────────────────────────
// STAFF ENTITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * (core) A staff member eligible for host assignment.
 */
export interface StaffMember {
  id: string;                 // e.g. "s_maria"
  name: string;
  role: string;               // "Guest Experience Host" | "Concierge" | "Butler"
  languages: string[];
  specialties: string[];      // e.g. ["wine & F&B", "local culture"]
  pastGuestIds: string[];     // guest IDs they personally hosted → continuity
  onShift: boolean;
  currentLoad?: number;       // (nice) # guests currently assigned
}

// ─────────────────────────────────────────────────────────────────────────────
// FLIGHT STATUS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * (core) Live (mock) flight data — promoted to top-level OrchestrationResult
 * so all four artifacts can react to it independently.
 * Previously an inline shape on HostBrief; extracted in v1.1 (ADR-001).
 */
export interface FlightStatus {
  flightNumber: string;
  status: "on-time" | "delayed" | "cancelled";
  scheduledArrival: string;   // ISO 8601 datetime
  adjustedArrival: string;    // ISO 8601 datetime
  delayMinutes: number;       // 0 when on-time
  impact: string;             // human-readable impact note for the reasoning trace
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT ARTIFACT 1 — ROOM & AMENITY SPEC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * (core) Environmental adjustments derived from timezone delta and arrival time.
 * Always autoApplied — objective origin data, no creepy-line risk.
 */
export interface CircadianHandshake {
  lightingKelvin: number;     // 2700K (warm/sleep) for late arrivals; 5000K for morning
  temperatureF: number;       // adjusted from guest preference + origin climate math
  blackoutBlinds: boolean;
  rationale: string;          // e.g. "9.5hr delta + 2 AM arrival → sleep-recovery preset"
}

/**
 * (core) Pre-staged loaner items triggered by ≥20°F climate delta.
 * Auto-applied when delta is large and objective; staff-review for borderline cases.
 */
export interface SartorialRescue {
  items: string[];            // e.g. ["loaner windbreaker", "compact umbrella"]
  climateDeltaF: number;      // computed drop that triggered this
  rationale: string;
  status: "auto" | "staff-review";
}

/**
 * (core) Welcome amenity pivot — replaces the default when arrival conditions change.
 * E.g. late flight + timezone delta → swap champagne for recovery protocol.
 * Null when no pivot is needed.
 */
export interface DynamicEmpathyAmenity {
  original: string;           // e.g. "Champagne & strawberries"
  replacement: string;        // e.g. "Bone broth, chamomile tea, electrolyte water"
  trigger: string;            // e.g. "Late arrival (est. 2 AM) + 9.5hr timezone delta"
  rationale: string;
  autoApplied: boolean;
}

/**
 * (core) An item held in the back office — never auto-placed in the room.
 * The host offers it conversationally; 60-second delivery guaranteed on request.
 * Confidence is always < 0.8 (high-confidence items are auto-applied, not held).
 */
export interface StandbyItem {
  item: string;               // e.g. "Sikh prayer mat"
  category: "religious" | "cultural" | "dietary" | "wellness";
  inferenceSource: string;    // e.g. "Past stay note: requested turban stand at Rosewood London"
  confidence: number;         // 0–1; always < 0.8 for standby items
  deliveryPromise: string;    // e.g. "60-second back-office delivery on request"
  roomClearanceNote: string;  // what space was cleared: "High shelf cleared; personal tray placed"
  localResourceInfo?: string; // e.g. "San Jose Gurdwara: 3636 Gurdwara Ave, San Jose, CA"
}

/**
 * (core) Full room and amenity staging specification.
 * v1.1 additions: circadianHandshake, sartorialRescue, dynamicEmpathyAmenity, backOfficeStandby
 */
export interface RoomSpec {
  // Baseline preferences
  temperatureF: number;
  pillowType: string;
  minibar: string[];

  // Welcome amenity (may be overridden by dynamicEmpathyAmenity)
  welcomeAmenity: {
    item: string;
    rationale: string;        // ties to "Sense of Place" philosophy
  };

  environmentNotes: string[]; // e.g. ["blackout blinds preset", "fresh flowers — orchids not roses"]

  // Confidence layer
  confidence: number;         // 0–1
  autoApplied: boolean;       // true if confidence ≥ 0.8

  // v1.1 — Protocol triggers
  circadianHandshake: CircadianHandshake;           // always present; drives lighting + temp
  sartorialRescue: SartorialRescue | null;          // null when climate delta < threshold
  dynamicEmpathyAmenity: DynamicEmpathyAmenity | null; // null when no amenity pivot needed
  backOfficeStandby: StandbyItem[];                 // empty array when nothing held in reserve
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT ARTIFACT 2 — GUEST ITINERARY (LANGUAGE LENS)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * (core) Native-language version of an itinerary item's consumer-facing text.
 * Present only when GuestItinerary.dualLanguage = true.
 */
export interface LocalizedContent {
  language: string;           // e.g. "Hindi", "Mandarin", "French"
  title: string;
  description: string;
}

/**
 * (core) A single item in the guest-facing itinerary.
 * v1.1 addition: localizedContent (Language Lens)
 */
export interface ItineraryItem {
  title: string;
  type: "dining" | "cultural" | "wellness" | "excursion";
  when: string;               // e.g. "Fri 7:30 PM"
  description: string;
  whyThisGuest: string;       // personalization rationale
  confidence: number;         // 0–1
  status: "auto" | "staff-review";
  localizedContent?: LocalizedContent; // (v1.1) present only when dualLanguage = true
}

/**
 * (core) The complete guest-facing itinerary.
 * v1.1 additions: nativeLanguage, dualLanguage
 */
export interface GuestItinerary {
  nativeLanguage: string | null; // null = English-only; "Hindi" = trigger dual-language layout
  dualLanguage: boolean;         // true when nativeLanguage is non-null and non-English
  items: ItineraryItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT ARTIFACT 3 — HOST ASSIGNMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * (core) A single match reason in the host assignment scoring.
 */
export interface MatchReason {
  factor: "continuity" | "language" | "affinity" | "availability";
  detail: string;
  weight: number;             // relative weighting used in scoring
}

/**
 * (core) The result of matching a named staff member to this arrival.
 */
export interface HostAssignment {
  assignedStaffId: string;
  continuityFlag: boolean;    // true if this host previously served this guest
  matchReasons: MatchReason[];
  confidence: number;         // 0–1
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT ARTIFACT 4 — HOST BRIEF
// ─────────────────────────────────────────────────────────────────────────────

/**
 * (core) The showpiece artifact — a warm, specific brief addressed to the named host.
 * v1.1 additions: backOfficeStandbyInstructions, voiceBriefUrl
 */
export interface HostBrief {
  forStaffId: string;
  greeting: string;           // warm, references something specific & safe
  keyFacts: string[];         // 3–5 must-knows
  serviceNotes: string[];     // subtle things to do or notice
  doNotMention: string[];     // **DIFFERENTIATOR** — inferred but must NOT be said aloud
  flightStatus: FlightStatus; // references the top-level FlightStatus (not a duplicate)

  // v1.1 — Back-Office Standby
  backOfficeStandbyInstructions: string[]; // how to conversationally offer standby items
                                           // e.g. "If Mr. Singh mentions prayer or meditation,
                                           //       offer 'We have something set aside for you.'"

  // v1.1 — ElevenLabs voice brief
  voiceBriefUrl?: string;     // (nice) TTS URL generated post-orchestration; one moment only
}

// ─────────────────────────────────────────────────────────────────────────────
// REASONING TRACE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * (core) A single step in the live reasoning trace — drives the "watch it think" animation.
 */
export interface TraceStep {
  label: string;              // e.g. "Pulling stay history"
  status: "pending" | "running" | "complete" | "pivoted";
  detail: string;             // e.g. "2 past stays found; Bangkok host = s_maria"
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP-LEVEL ORCHESTRATION RESULT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * (core) The complete output of one GuestFlow orchestration run.
 * v1.1 addition: flightStatus promoted from HostBrief inline field.
 */
export interface OrchestrationResult {
  guestId: string;
  generatedAt: string;        // ISO 8601 datetime
  flightStatus: FlightStatus; // (v1.1) top-level — all artifacts reference this
  roomSpec: RoomSpec;
  itinerary: GuestItinerary;
  hostAssignment: HostAssignment;
  hostBrief: HostBrief;
  reasoningTrace: TraceStep[];
  overallConfidence: number;  // 0–1; aggregate across all artifacts
}
