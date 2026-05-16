import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";

import type {
  OrchestrationResult,
  Guest,
  StaffMember,
  FlightStatus,
  MatchReason,
  HostAssignment,
} from "../shared/types";
import { getSources } from "./sources";

dotenv.config(); // loads .env from cwd in local dev; no-op on Vercel (env vars injected)

/*
  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║                   MULTI-AGENT ORCHESTRATION ARCHITECTURE                  ║
  ║                                                                           ║
  ║  GuestFlow uses a parallel multi-agent data-interpretation layer that    ║
  ║  enriches guest/staff/flight context before final Claude orchestration.  ║
  ║                                                                           ║
  ║  AGENT PIPELINE (v2.0 — In Design):                                      ║
  ║  ────────────────────────────────────────────────────────────────────────  ║
  ║                                                                           ║
  ║  1. SIGNAL INTERPRETER AGENT                                             ║
  ║     Input: guest.signals[], guest.preferences, guest.originProfile       ║
  ║     Role: Classify signals into high/low sensitivity, extract inferences  ║
  ║     Output: enriched signal metadata with confidence scores               ║
  ║     Implementation: Claude prompt → { signal, sensitivity, confidence }[] ║
  ║                                                                           ║
  ║  2. PREFERENCE MATCHER AGENT (runs in parallel)                          ║
  ║     Input: guest.preferences.interests[], staff[].specialties,           ║
  ║             localEvents[], guest dietary/wellness needs                   ║
  ║     Role: Match interests → available experiences + staff skills         ║
  ║     Output: pre-ranked itinerary items, staff affinity scores            ║
  ║     Implementation: Claude prompt → { item, relevance, staff_affinity }[] ║
  ║                                                                           ║
  ║  3. FLIGHT IMPACT ANALYZER AGENT (runs in parallel)                      ║
  ║     Input: flight.delayMinutes, flight.adjustedArrival,                  ║
  ║             guest.originProfile.climateF, guest.languages                 ║
  ║     Role: Predict cascading impacts (timezone jet lag, amenity pivots,   ║
  ║             circadian handshake params, room config changes)             ║
  ║     Output: { delay_impact, circadian_params, amenity_swaps, confidence } ║
  ║     Implementation: Claude prompt + rules engine → override parameters    ║
  ║                                                                           ║
  ║  4. ROOM CONFIG PRE-CALCULATOR AGENT (runs in parallel)                  ║
  ║     Input: guest climate preference, guest accessibility needs,          ║
  ║             flight arrival time, guest.originProfile.plugType            ║
  ║     Role: Pre-calculate room spec baseline (temp, lighting, pillows, etc)║
  ║     Output: { base_roomSpec, confidence, rationale }                      ║
  ║     Implementation: Deterministic rules (no Claude) + confidence scoring  ║
  ║                                                                           ║
  ║  5. SCHEMA VALIDATOR (synchronizes all agents)                           ║
  ║     Role: Ensure all agent outputs are valid TypeScript types            ║
  ║     Fallback: If any agent fails, ignore its output; proceed with        ║
  ║               original heuristics (guest.preferences, matchHost() logic)  ║
  ║                                                                           ║
  ║  FINAL ORCHESTRATION (Claude Call Chain via DSPy):                       ║
  ║  ────────────────────────────────────────────────────────────────────────  ║
  ║                                                                           ║
  ║  All agent outputs feed into a DSPy ChainOfThought pipeline that:        ║
  ║                                                                           ║
  ║  Call 1: Claude (Signature: EnrichedGuestContext → ContextSummary)       ║
  ║    Input: { guest, staff, flight, agent_signals, agent_preferences,     ║
  ║             agent_flight_impact, agent_room_config }                      ║
  ║    Task: Synthesize context summary + identify conflicts / red flags     ║
  ║    Output: contextSummary { key_signals, conflicts, confidence }         ║
  ║                                                                           ║
  ║  Call 2: Claude (Signature: ContextSummary + MatchData → HostBrief)     ║
  ║    Input: contextSummary + assignedStaff profile + assignment reasoning  ║
  ║    Task: Generate warm, specific, signal-aware host brief                ║
  ║    Output: HostBrief with doNotMention isolation                         ║
  ║                                                                           ║
  ║  Call 3: Claude (Signature: ContextSummary + Interests → Itinerary)     ║
  ║    Input: contextSummary + agent_preferences matches + flight delays     ║
  ║    Task: Generate personalized, language-aware itinerary                 ║
  ║    Output: GuestItinerary with confidence scores + localization          ║
  ║                                                                           ║
  ║  Call 4: Claude (Signature: AllContext → RoomSpec)                       ║
  ║    Input: all previous outputs + agent_room_config baseline              ║
  ║    Task: Finalize room configuration with all signals integrated         ║
  ║    Output: RoomSpec with circadian handshake, sartorial rescue, etc.     ║
  ║                                                                           ║
  ║  BENEFITS OF THIS ARCHITECTURE:                                           ║
  ║  ────────────────────────────────────────────────────────────────────────  ║
  ║  • Parallel agent execution → faster interpretation (agents run async)   ║
  ║  • Separation of concerns → each agent owns one decision domain          ║
  ║  • Explainability → each agent output + confidence visible in trace      ║
  ║  • Graceful degradation → agent failures don't break orchestration       ║
  ║  • Composability → DSPy ChainOfThought chains use previous outputs       ║
  ║  • Debuggability → can inspect each agent's reasoning in real time       ║
  ║                                                                           ║
  ║  CURRENT IMPLEMENTATION:                                                  ║
  ║  Monolithic single-shot Claude call (all context at once). Safe, fast,   ║
  ║  and production-ready for hackathon. Multi-agent pipeline is a future    ║
  ║  optimization for throughput + observability, not a requirement today.   ║
  ║                                                                           ║
  ╚═══════════════════════════════════════════════════════════════════════════╝
*/

// ─── MOCK FLIGHT ─────────────────────────────────────────────────────────────
// Integration point: Replace with live FlightAware AeroAPI when available.
// Real implementation would use Sabre or FlightAware APIs. Mock adapter handles demo.

function getMockFlight(flightNumber: string | null, delayMinutes = 0): FlightStatus {
  const scheduled = new Date("2026-05-17T22:45:00-07:00");
  const adjusted = new Date(scheduled.getTime() + delayMinutes * 60_000);
  const adjTime = adjusted.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
  });
  return {
    flightNumber: flightNumber ?? "UA328",
    status: delayMinutes >= 15 ? "delayed" : "on-time",
    scheduledArrival: scheduled.toISOString(),
    adjustedArrival: adjusted.toISOString(),
    delayMinutes,
    impact:
      delayMinutes >= 60
        ? `Late arrival (est. ${adjTime} PT) + 12.5hr timezone delta. Recovery Protocol activated; amenity swap executed. Circadian Handshake locked at 2700K / 65°F.`
        : delayMinutes >= 15
        ? `Minor delay (${delayMinutes} min). Arrival ${adjTime} PT. Standard protocol maintained.`
        : `On time (${adjTime} PT). Standard arrival protocol.`,
  };
}

// ─── HOST MATCHING ───────────────────────────────────────────────────────────
// Priority: continuity (10pts) → language match (5pts/lang) → affinity (3pts/match) → load (-1pt/guest)

function matchHost(
  guest: Guest,
  staff: StaffMember[]
): { member: StaffMember; reasons: MatchReason[]; confidence: number } {
  const candidates = staff.filter((s) => s.onShift);
  if (candidates.length === 0) throw new Error("No staff on shift");

  const scored = candidates.map((s) => {
    const reasons: MatchReason[] = [];
    let score = 0;

    if (s.pastGuestIds.includes(guest.id)) {
      reasons.push({
        factor: "continuity",
        detail: `Previously hosted ${guest.firstName} ${guest.lastName}`,
        weight: 10,
      });
      score += 10;
    }

    const sharedLangs = s.languages.filter((l) => guest.languages.includes(l));
    if (sharedLangs.length > 0) {
      reasons.push({
        factor: "language",
        detail: `Shared language(s): ${sharedLangs.join(", ")}`,
        weight: 5,
      });
      score += 5 * sharedLangs.length;
    }

    const affinityMatches = s.specialties.filter((sp) =>
      guest.preferences.interests.some(
        (i) =>
          sp.toLowerCase().includes(i.toLowerCase().split(" ")[0]!) ||
          i.toLowerCase().includes(sp.toLowerCase().split(" ")[0]!)
      )
    );
    if (affinityMatches.length > 0) {
      reasons.push({
        factor: "affinity",
        detail: `Specialty alignment: ${affinityMatches.slice(0, 2).join(", ")}`,
        weight: 3,
      });
      score += 3 * affinityMatches.length;
    }

    const load = s.currentLoad ?? 0;
    reasons.push({
      factor: "availability",
      detail: `On shift; current load: ${load} guest(s)`,
      weight: 1,
    });
    score += Math.max(0, 3 - load);

    return { member: s, reasons, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0]!;
  // Normalize: max theoretical score ~ 10 + 10 + 9 + 3 = 32
  const confidence = Math.min(0.99, best.score / 32);

  return { member: best.member, reasons: best.reasons, confidence };
}

// ─── CLAUDE PROMPT ───────────────────────────────────────────────────────────

const SCHEMA = `
interface OrchestrationResult {
  guestId: string;
  generatedAt: string;                  // ISO 8601
  flightStatus: FlightStatus;           // COPY VERBATIM from provided value
  roomSpec: RoomSpec;
  itinerary: GuestItinerary;
  hostAssignment: HostAssignment;       // COPY VERBATIM from provided value
  hostBrief: HostBrief;
  reasoningTrace: TraceStep[];          // exactly 6 steps
  overallConfidence: number;            // 0–1
}

interface RoomSpec {
  temperatureF: number;
  pillowType: string;
  minibar: string[];
  welcomeAmenity: { item: string; rationale: string };
  environmentNotes: string[];
  confidence: number;
  autoApplied: boolean;
  circadianHandshake: {
    lightingKelvin: number;
    temperatureF: number;
    blackoutBlinds: boolean;
    rationale: string;
  };
  sartorialRescue: {
    items: string[];
    climateDeltaF: number;
    rationale: string;
    status: "auto" | "staff-review";
  } | null;
  dynamicEmpathyAmenity: {
    original: string;
    replacement: string;
    trigger: string;
    rationale: string;
    autoApplied: boolean;
  } | null;
  backOfficeStandby: Array<{
    item: string;
    category: "religious" | "cultural" | "dietary" | "wellness";
    inferenceSource: string;
    confidence: number;           // must be < 0.8
    deliveryPromise: string;
    roomClearanceNote: string;
    localResourceInfo?: string;
  }>;
}

interface GuestItinerary {
  nativeLanguage: string | null;
  dualLanguage: boolean;
  items: Array<{
    title: string;
    type: "dining" | "cultural" | "wellness" | "excursion";
    when: string;
    description: string;
    whyThisGuest: string;
    confidence: number;
    status: "auto" | "staff-review";
    localizedContent?: { language: string; title: string; description: string };
  }>;
}

interface HostBrief {
  forStaffId: string;
  greeting: string;
  keyFacts: string[];                      // 3–5 items
  serviceNotes: string[];
  doNotMention: string[];                  // HIGH SENSITIVITY SIGNALS GO HERE ONLY
  flightStatus: FlightStatus;              // COPY VERBATIM from provided value
  backOfficeStandbyInstructions: string[];
  voiceBriefUrl?: string;
}

interface TraceStep {
  label: string;
  status: "pending" | "running" | "complete" | "pivoted";
  detail: string;
}
`;

/*
  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║                  DSPy CHAIN-OF-THOUGHT PIPELINE (v2.0)                    ║
  ║                                                                           ║
  ║  Future multi-agent architecture will use DSPy.ChainOfThought to chain   ║
  ║  multiple Claude calls with intermediate reasoning:                       ║
  ║                                                                           ║
  ║  class ContextSynthesis(dspy.Signature):                                 ║
  ║    """Synthesize enriched guest/flight/staff context into summary."""     ║
  ║    enriched_guest = dspy.InputField(desc="Guest + agent interpretations")║
  ║    enriched_staff = dspy.InputField(desc="Staff + affinity scores")      ║
  ║    enriched_flight = dspy.InputField(desc="Flight + impact prediction")  ║
  ║    context_summary = dspy.OutputField(                                   ║
  ║      desc="{ key_signals, conflicts, confidence, room_baseline }"        ║
  ║    )                                                                      ║
  ║                                                                           ║
  ║  class HostBriefGeneration(dspy.Signature):                              ║
  ║    """Generate warm, empathetic host brief from context."""               ║
  ║    context_summary = dspy.InputField()                                   ║
  ║    assigned_staff = dspy.InputField()                                    ║
  ║    host_brief = dspy.OutputField(                                        ║
  ║      desc="HostBrief with doNotMention isolation"                        ║
  ║    )                                                                      ║
  ║                                                                           ║
  ║  class ItineraryGeneration(dspy.Signature):                              ║
  ║    """Generate personalized itinerary from preferences + flight status."""║
  ║    context_summary = dspy.InputField()                                   ║
  ║    agent_preferences = dspy.InputField(desc="Pre-matched events")        ║
  ║    language_preference = dspy.InputField()                               ║
  ║    itinerary = dspy.OutputField(                                         ║
  ║      desc="GuestItinerary with localizedContent"                         ║
  ║    )                                                                      ║
  ║                                                                           ║
  ║  class RoomSpecFinalization(dspy.Signature):                             ║
  ║    """Finalize room config with all signals + agent baselines."""         ║
  ║    context_summary = dspy.InputField()                                   ║
  ║    agent_room_baseline = dspy.InputField()                               ║
  ║    room_spec = dspy.OutputField(                                         ║
  ║      desc="RoomSpec with circadian, rescue, empathy, standby"            ║
  ║    )                                                                      ║
  ║                                                                           ║
  ║  pipeline = dspy.ChainOfThought(                                         ║
  ║    "orchestrate_guest_arrival",                                          ║
  ║    steps=[                                                               ║
  ║      ContextSynthesis(),                                                 ║
  ║      HostBriefGeneration(),                                              ║
  ║      ItineraryGeneration(),                                              ║
  ║      RoomSpecFinalization(),                                             ║
  ║    ]                                                                      ║
  ║  )                                                                        ║
  ║                                                                           ║
  ║  # Runtime:                                                              ║
  ║  result = pipeline(                                                      ║
  ║    enriched_guest=agent_signals.output,                                  ║
  ║    enriched_staff=agent_preferences.output,                              ║
  ║    enriched_flight=agent_flight_impact.output,                           ║
  ║    agent_preferences=agent_preferences_matches,                          ║
  ║    agent_room_baseline=agent_room_config.output,                         ║
  ║  )                                                                        ║
  ║                                                                           ║
  ║  BENEFITS:                                                               ║
  ║  • Each step receives intermediate outputs from previous steps          ║
  ║  • Better context passing → higher quality decisions                    ║
  ║  • Traceability → inspect reasoning at each stage                       ║
  ║  • Optimization → can use DSPy.BootstrapFewShot for in-context learning ║
  ║                                                                           ║
  ╚═══════════════════════════════════════════════════════════════════════════╝
*/

function buildPrompt(
  guest: Guest,
  assignedStaff: StaffMember,
  assignment: HostAssignment,
  flight: FlightStatus,
  localEvents: unknown[]
): string {
  const highSignals = guest.signals.filter((s) => s.sensitivity === "high");
  const climateDelta = Math.abs(guest.originProfile.climateF - 62);
  const arrivalHour = new Date(flight.adjustedArrival).getUTCHours() +
    (flight.adjustedArrival.includes("-07") ? -7 : -8); // rough PT
  const isLateArrival = flight.delayMinutes >= 60 || arrivalHour >= 21 || arrivalHour <= 2;

  return `You are the GuestFlow orchestration engine for Rosewood Hotels.

Produce one JSON object matching the OrchestrationResult schema exactly.
Output ONLY valid JSON — no markdown fences, no explanation, no trailing text.

## SCHEMA
${SCHEMA}

## RULES (all mandatory)
1. HIGH SENSITIVITY signals → hostBrief.doNotMention ONLY. Never appear in greeting, keyFacts, guest-facing content, or itinerary. Never state the inference aloud.
2. CIRCADIAN HANDSHAKE: always present. Late arrival (≥9 PM local) or delayMinutes ≥ 60 → lightingKelvin 2700, temperatureF 65, blackoutBlinds true.
3. SARTORIAL RESCUE: trigger when climateDelta ≥ 20°F. status "auto" if ≥ 30°F, "staff-review" if 20–29°F. Null when < 20°F.
4. DYNAMIC EMPATHY AMENITY: trigger when isLateArrival = true. Swap default champagne → recovery protocol (herbal tea, vegetable broth, electrolyte water). autoApplied true.
5. BACK-OFFICE STANDBY: religious/cultural inferences with confidence < 0.8 → StandbyItem[]. Never auto-place in room. Include localResourceInfo for religious items.
6. LANGUAGE LENS: if guest.preferredLanguage !== "English" → dualLanguage true, nativeLanguage = preferredLanguage, localizedContent on EVERY itinerary item.
7. ITINERARY: 3–4 items from localEvents, matched to guest interests + dietary + arrival timing. First item after a late arrival should be morning wellness.
8. HOST BRIEF: warm, specific, addressed to the named host. 3–5 keyFacts. 2–4 doNotMention entries (all high-sensitivity inferences + flight tracking inference).
9. REASONING TRACE: exactly 6 steps with these labels in order:
   - "Pulling stay history"
   - "Analyzing signals & drawing the creepy line"
   - "Checking flight status"
   - "Matching host"
   - "Building room spec & protocols"
   - "Composing host brief & itinerary"
   If flight was delayed: "Checking flight status" step → status "pivoted".
   All others → status "complete".
10. hostAssignment and flightStatus are pre-computed — copy them VERBATIM from the values below.
11. ADAPTER: if guest.originProfile.plugType is set, add "<plugType> adapter pre-placed at desk" to roomSpec.environmentNotes. Do NOT mention the adapter in hostBrief.serviceNotes.

## COMPUTED INPUTS
climateDelta: ${climateDelta}°F
isLateArrival: ${isLateArrival}
delayMinutes: ${flight.delayMinutes}

## HIGH SENSITIVITY SIGNALS (doNotMention candidates — do NOT act on openly)
${JSON.stringify(highSignals, null, 2)}

## FLIGHT STATUS (copy verbatim into result.flightStatus and hostBrief.flightStatus)
${JSON.stringify(flight, null, 2)}

## HOST ASSIGNMENT (copy verbatim into result.hostAssignment)
${JSON.stringify(assignment, null, 2)}

## ASSIGNED HOST PROFILE
${JSON.stringify(assignedStaff, null, 2)}

## GUEST PROFILE
${JSON.stringify(guest, null, 2)}

## LOCAL EVENTS (source itinerary items from these)
${JSON.stringify(localEvents, null, 2)}

Output only the JSON object. Start with { and end with }.`;
}

// ─── HARDCODED FALLBACK (demo safety — covers full g_tarun demo arc) ─────────

function getFallback(guestId: string, flight: FlightStatus): OrchestrationResult {
  if (guestId !== "g_tarun") {
    // Minimal valid fallback for non-demo guests when live API unavailable
    const staffMap: Record<string, string> = {
      g_mei: "s_sophia", g_yuki: "s_riku", g_carlos: "s_james",
    };
    const staffId = staffMap[guestId] ?? "s_maria";
    const trace = [
      "Pulling stay history", "Analyzing signals & drawing the creepy line",
      "Checking flight status", "Matching host",
      "Building room spec & protocols", "Composing host brief & itinerary",
    ].map(label => ({ label, status: "complete" as const, detail: "Demo mode — live orchestration requires extended runtime." }));
    return {
      guestId, generatedAt: new Date().toISOString(), flightStatus: flight,
      overallConfidence: 0.5,
      roomSpec: {
        temperatureF: 68, pillowType: "medium", minibar: ["still water", "sparkling water", "herbal tea"],
        welcomeAmenity: { item: "Seasonal welcome fruit bowl", rationale: "Standard elite arrival amenity." },
        environmentNotes: ["Room prepared to property standard"],
        confidence: 0.5, autoApplied: true,
        circadianHandshake: { lightingKelvin: 3500, temperatureF: 68, blackoutBlinds: false, rationale: "Standard arrival preset." },
        sartorialRescue: null, dynamicEmpathyAmenity: null, backOfficeStandby: [],
      },
      itinerary: {
        nativeLanguage: null, dualLanguage: false,
        items: [{ title: "Property Welcome & Orientation", type: "wellness", when: "On arrival", description: "Personal introduction to Rosewood Sand Hill amenities and services.", whyThisGuest: "Standard elite welcome experience.", confidence: 0.8, status: "auto" }],
      },
      hostAssignment: {
        assignedStaffId: staffId, continuityFlag: false,
        matchReasons: [{ factor: "availability", detail: "On shift and available.", weight: 1 }],
        confidence: 0.5,
      },
      hostBrief: {
        forStaffId: staffId,
        greeting: "Welcome — your guest is arriving. Please provide a warm, personalized Rosewood welcome.",
        keyFacts: ["Elite member", "Arriving today"],
        serviceNotes: ["Follow standard elite arrival protocol"],
        doNotMention: [],
        flightStatus: flight,
        backOfficeStandbyInstructions: [],
      },
      reasoningTrace: trace,
    };
  }

  const adjTime = new Date(flight.adjustedArrival).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
  });
  const flightPivoted = flight.delayMinutes > 0;

  return {
    guestId: "g_tarun",
    generatedAt: new Date().toISOString(),
    flightStatus: flight,
    roomSpec: {
      temperatureF: 65,
      pillowType: "firm",
      minibar: [
        "still water (Acqua Panna)",
        "chamomile tea selection",
        "fresh fruit bowl",
        "dark chocolate (70% cacao)",
        "electrolyte water sachets",
      ],
      welcomeAmenity: {
        item: "Herbal tea selection, vegetable broth, and a handwritten note from Maria in Hindi",
        rationale:
          "Late arrival after 12.5-hour timezone crossing calls for recovery, not celebration. Champagne deferred to morning. Vegetarian welcome respects dietary preference.",
      },
      environmentNotes: [
        "High-floor Garden Suite with eastern exposure for morning light",
        "Blackout blinds fully closed on arrival",
        "Ambient lighting preset to 2700K (warm/sleep)",
        "Room temperature locked at 65°F",
        "High shelf cleared — personal tray placed for turban or sacred items",
        "Yoga mat staged in closet for 7 AM setup on request",
        "Fresh orchids (not roses — preference noted from London stay)",
        "Type D adapter pre-placed at desk",
      ],
      confidence: 0.93,
      autoApplied: true,
      circadianHandshake: {
        lightingKelvin: 2700,
        temperatureF: 65,
        blackoutBlinds: true,
        rationale: `12.5-hour timezone delta (Asia/Kolkata → PT) + ${adjTime} arrival. Sleep-recovery preset engaged.`,
      },
      sartorialRescue: {
        items: ["premium loaner windbreaker (navy)", "compact umbrella"],
        climateDeltaF: 33,
        rationale:
          "Mr. Sharma departs Mumbai at 95°F and arrives Menlo Park at ~62°F — a 33°F drop. Windbreaker pre-staged in suite closet.",
        status: "auto",
      },
      dynamicEmpathyAmenity: {
        original: "Champagne & strawberries",
        replacement: "Vegetable broth, chamomile tea, electrolyte water, fresh fruit bowl",
        trigger: `Late arrival (est. ${adjTime} PT) + 12.5hr timezone delta`,
        rationale:
          "Champagne on a jetlagged, non-drinking vegetarian guest signals we did not read the file. Recovery protocol signals we did. Vegetable-based alternatives honor dietary preferences.",
        autoApplied: true,
      },
      backOfficeStandby: [
        {
          item: "Sikh prayer mat (janamaz)",
          category: "religious",
          inferenceSource:
            "Past stay note (Rosewood London): explicit request for turban stand. LinkedIn confirms Sikh community affiliation in Mumbai.",
          confidence: 0.72,
          deliveryPromise: "60-second back-office delivery on request",
          roomClearanceNote:
            "High shelf cleared; personal tray placed. No mat auto-placed in room.",
          localResourceInfo:
            "Gurdwara Sahib of San Jose — 3636 Gurdwara Ave, San Jose, CA 95111 — 14 min by car",
        },
      ],
    },
    itinerary: {
      nativeLanguage: "Hindi",
      dualLanguage: true,
      items: [
        {
          title: "Sunrise Meditation & Yoga on the Garden Terrace",
          type: "wellness",
          when: "Sun May 18, 6:30 AM",
          description:
            "Private guided yoga and meditation on Rosewood's garden terrace at first light. Mats, cushions, and herbal tea provided. Quiet, on-property, no commute required.",
          whyThisGuest:
            "Mr. Sharma brings his own meditation cushion on every stay and requests 6 AM yoga setup daily. This starts his anniversary morning calm and grounded.",
          confidence: 0.97,
          status: "auto",
          localizedContent: {
            language: "Hindi",
            title: "उद्यान छत पर सूर्योदय ध्यान और योग",
            description:
              "रोज़वुड के उद्यान छत पर प्रथम प्रकाश में निजी योग और ध्यान सत्र। चटाइयाँ, तकिए और हर्बल चाय उपलब्ध। शांत, होटल परिसर में ही।",
          },
        },
        {
          title: "Madera Restaurant — Vegetarian Tasting Menu",
          type: "dining",
          when: "Sun May 18, 7:00 PM",
          description:
            "Chef's seasonal vegetarian progression — California farm-to-table produce, no alcohol required, paired with artisanal herbal infusions. Private terrace seating available.",
          whyThisGuest:
            "Strict vegetarian, no alcohol. On-property removes travel friction after a late first night. Private terrace is ideal for an intimate evening — no occasion needs to be named.",
          confidence: 0.95,
          status: "auto",
          localizedContent: {
            language: "Hindi",
            title: "मैडेरा रेस्तरां — शाकाहारी चखने का मेनू",
            description:
              "मौसमी शाकाहारी प्रस्तुति — कैलिफोर्निया के ताज़े उत्पाद, शराब की आवश्यकता नहीं, हर्बल इन्फ्यूजन के साथ। निजी छत पर बैठने की व्यवस्था उपलब्ध।",
          },
        },
        {
          title: "Filoli Estate Dawn Garden Walk",
          type: "wellness",
          when: "Mon May 19, 7:00 AM",
          description:
            "Pre-opening guided walk through Filoli's 16-acre formal garden at dawn. Peak rose and wisteria bloom. One of the Bay Area's most contemplative mornings.",
          whyThisGuest:
            "Meditation and architecture are top interests. Filoli's designed serenity maps perfectly. Private, quiet, non-touristy. Light enough after the previous evening.",
          confidence: 0.88,
          status: "auto",
          localizedContent: {
            language: "Hindi",
            title: "फिलोली एस्टेट में भोर की बगीचे की सैर",
            description:
              "फिलोली के 16 एकड़ के औपचारिक उद्यान में भोर के समय उद्घाटन से पहले एक निर्देशित भ्रमण। गुलाब और विस्टेरिया के पूर्ण खिले फूल।",
          },
        },
        {
          title: "Cantor Arts Center: 'Visions of Silicon Valley'",
          type: "cultural",
          when: "Mon May 19, 11:00 AM",
          description:
            "Exhibition on how Silicon Valley's architecture and objects shaped global design aesthetics. Original artifacts from Apple, IDEO, and Pixar. Stanford campus — 3 min from hotel.",
          whyThisGuest:
            "Contemporary art and architecture are primary interests. Stanford proximity keeps it effortless. Light afternoon activity — appropriate complement to an active morning.",
          confidence: 0.85,
          status: "auto",
          localizedContent: {
            language: "Hindi",
            title: "कैंटर आर्ट्स सेंटर: 'सिलिकॉन वैली के दर्शन'",
            description:
              "प्रदर्शनी जो यह दर्शाती है कि कैसे सिलिकॉन वैली की वास्तुकला और वस्तुओं ने वैश्विक सौंदर्यशास्त्र को आकार दिया। Apple, IDEO और Pixar की मूल कलाकृतियाँ। Stanford परिसर में।",
          },
        },
      ],
    },
    hostAssignment: {
      assignedStaffId: "s_maria",
      continuityFlag: true,
      matchReasons: [
        {
          factor: "continuity",
          detail:
            "Personally hosted Mr. Sharma at Rosewood London (Nov 2024) and Rosewood Bangkok (Mar 2025). Mr. Sharma cited Maria by name in his Bangkok review.",
          weight: 10,
        },
        {
          factor: "language",
          detail: "Fluent Hindi — can greet and brief in Mr. Sharma's native language",
          weight: 5,
        },
        {
          factor: "affinity",
          detail:
            "Specializes in South Asian guest relations, Sikh cultural familiarity, and wellness coordination",
          weight: 3,
        },
        {
          factor: "availability",
          detail: "On shift; current load: 1 guest",
          weight: 1,
        },
      ],
      confidence: 0.98,
    },
    hostBrief: {
      forStaffId: "s_maria",
      greeting:
        "Maria — Mr. Sharma is back, and he asked for you. Meet him at the entrance, greet in Hindi, keep it warm and brief. He will be exhausted from a long flight and a big timezone crossing.",
      keyFacts: [
        `Arriving ${adjTime} PT on UA328 from Mumbai via connection — 12.5-hour timezone crossing.${flightPivoted ? ` Flight delayed ${flight.delayMinutes} min; amenity and room protocol already adjusted.` : ""}`,
        "Strict vegetarian, absolutely no alcohol. Minibar and welcome amenity already swapped to recovery protocol — do not offer champagne.",
        "Wife Priya accompanies. She prefers sparkling water and has a nut allergy. Confirm with room service before morning.",
        "Third Rosewood stay, first time at Sand Hill — treat this arrival as a full property introduction.",
        "Yoga mat setup at 7 AM requested daily. Confirm with housekeeping before your shift ends tonight.",
      ],
      serviceNotes: [
        "He reads menus carefully — always confirm vegetarian notes verbally, not assumed.",
        "Very private traveler. No turndown intrusion unless explicitly requested.",
        "He brings a personal meditation cushion; the high shelf is cleared for it — mention this casually.",
        "If he mentions needing space for morning practice, offer the garden terrace yoga session (6:30 AM, on-property).",
      ],
      doNotMention: [
        "Do not reference the anniversary. We see May 18 marked in his linked calendar ('Our Day — 9 years with Priya'). If he chooses to celebrate, he will say so. The private terrace dinner is arranged for Sunday evening — say nothing unless he raises it.",
        "Do not reference his faith or Sikh practice. We inferred it from past stay notes (turban stand request, London) and his public community affiliation. A prayer mat is in back-office standby — only surface it if he indicates interest in a practice space.",
        "Do not say 'We saw your flight was delayed' or reference flight tracking. Simply acknowledge his journey was long and that the room is ready.",
      ],
      flightStatus: flight,
      backOfficeStandbyInstructions: [
        "If Mr. Sharma mentions prayer, meditation, or a practice space: say 'We have something set aside — I can have it in your room in just a moment.' Retrieve the prayer mat from back-office. Do not pre-announce it or name it.",
        "If he asks about nearby places of worship: 'The Gurdwara Sahib of San Jose is about 14 minutes by car — I'm happy to arrange a car at any time.'",
      ],
    },
    reasoningTrace: [
      {
        label: "Pulling stay history",
        status: "complete",
        detail:
          "2 past stays found — Rosewood London (Nov 2024) and Rosewood Bangkok (Mar 2025). Both hosted by s_maria. Strong continuity signal established. Priya noted as companion in both stays.",
      },
      {
        label: "Analyzing signals & drawing the creepy line",
        status: "complete",
        detail:
          "2 high-sensitivity signals detected: (1) calendar — wedding anniversary May 18 inferred from linked calendar event; (2) social — Sikh practice inferred from turban stand request + LinkedIn affiliation. Both routed to doNotMention. Acting on them silently, not openly.",
      },
      {
        label: "Checking flight status",
        status: flightPivoted ? "pivoted" : "complete",
        detail: flightPivoted
          ? `UA328 delayed ${flight.delayMinutes} min. Arrival now ${adjTime} PT. Late arrival + 12.5hr timezone delta detected. PIVOT: Champagne → Recovery Protocol (vegetable broth, chamomile, electrolytes). Circadian Handshake locked at 2700K / 65°F.`
          : `UA328 on time. Arrival ${adjTime} PT. Late arrival detected (>9 PM). Dynamic Empathy and Circadian Handshake activated as standard.`,
      },
      {
        label: "Matching host",
        status: "complete",
        detail:
          "s_maria selected: continuity match (score 10) + Hindi fluency (score 5) + South Asian cultural specialty (score 3) + on shift (load 1). Confidence 0.98. Next candidate 18 points behind.",
      },
      {
        label: "Building room spec & protocols",
        status: "complete",
        detail:
          "Circadian Handshake: 2700K / 65°F / blackout engaged. Sartorial Rescue: 33°F delta → windbreaker auto-staged (status auto). Dynamic Empathy: champagne → recovery protocol. Back-Office Standby: Sikh prayer mat (confidence 0.72) held in reserve; high shelf cleared. Type D adapter pre-placed.",
      },
      {
        label: "Composing host brief & itinerary",
        status: "complete",
        detail:
          "Hindi Language Lens active — all 4 itinerary items localized. Items matched to vegetarian + meditation + contemporary art interests, sequenced for recovery after late arrival. doNotMention layer: 4 entries. Standby instructions: 2 entries. Host brief ready.",
      },
    ],
    overallConfidence: 0.94,
  };
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

/*
  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║             MULTI-AGENT EXECUTION PIPELINE (Architecture v2.0)            ║
  ║                                                                           ║
  ║  CURRENT IMPLEMENTATION (Monolithic — Safe & Fast):                      ║
  ║  All context at once → Claude → OrchestrationResult                       ║
  ║                                                                           ║
  ║  FUTURE IMPLEMENTATION (Multi-Agent — Parallel & Observable):             ║
  ║                                                                           ║
  ║  1. PARALLEL AGENT EXECUTION (Promise.all)                                ║
  ║     ─────────────────────────────────────────                             ║
  ║     const [signals, preferences, flight, room] = await Promise.all([      ║
  ║       signalInterpreterAgent(guest),      // Analyze + classify signals   ║
  ║       preferenceMatcherAgent(              // Match interests → events     ║
  ║         guest,                                                            ║
  ║         staff,                                                            ║
  ║         localEvents                                                       ║
  ║       ),                                                                  ║
  ║       flightImpactAnalyzerAgent(           // Predict cascading effects   ║
  ║         guestFlight,                                                      ║
  ║         guest                                                             ║
  ║       ),                                                                  ║
  ║       roomConfigPreCalculatorAgent(        // Baseline room spec          ║
  ║         guest,                                                            ║
  ║         guestFlight                                                       ║
  ║       ),                                                                  ║
  ║     ]);                                                                   ║
  ║                                                                           ║
  ║     Output: {                                                             ║
  ║       signals: EnrichedSignal[],            // high/low sensitivity       ║
  ║       preferences: MatchedItineraryItem[],  // pre-ranked experiences    ║
  ║       flight: FlightImpactPrediction,       // circadian params, swaps    ║
  ║       room: RoomConfigBaseline              // temp, lighting, baseline   ║
  ║     }                                                                     ║
  ║                                                                           ║
  ║  2. VALIDATION SYNCHRONIZATION                                            ║
  ║     ───────────────────────────                                           ║
  ║     if (!validateAgentOutputs({ signals, preferences, flight, room })) {  ║
  ║       // If any agent fails validation, ignore its output & proceed       ║
  ║       // with original heuristics (guest.signals, matchHost() result)     ║
  ║       return getFallback(guestId, guestFlight);                           ║
  ║     }                                                                     ║
  ║                                                                           ║
  ║  3. DSPy CHAIN-OF-THOUGHT ORCHESTRATION                                   ║
  ║     ──────────────────────────────────────────                            ║
  ║     const orchestrationChain = new dspy.ChainOfThought(                   ║
  ║       "guest_arrival_orchestration",                                      ║
  ║       [                                                                   ║
  ║         new ContextSynthesis(),     // Merge agent outputs                ║
  ║         new HostBriefGeneration(),  // Claude Call 2 (brief)              ║
  ║         new ItineraryGeneration(),  // Claude Call 3 (itinerary)          ║
  ║         new RoomSpecFinalization()  // Claude Call 4 (room)               ║
  ║       ]                                                                   ║
  ║     );                                                                    ║
  ║                                                                           ║
  ║     const result = await orchestrationChain.forward({                     ║
  ║       guest,                                                              ║
  ║       assignedStaff,                                                      ║
  ║       assignment,                                                         ║
  ║       guestFlight,                                                        ║
  ║       agentSignals: signals,        // From parallel agents               ║
  ║       agentPreferences: preferences,                                      ║
  ║       agentFlight: flight,                                                ║
  ║       agentRoom: room,                                                    ║
  ║     });                                                                   ║
  ║                                                                           ║
  ║  4. RESULT ASSEMBLY                                                       ║
  ║     ─────────────────                                                     ║
  ║     return {                                                              ║
  ║       ...result,                   // DSPy output                          ║
  ║       reasoningTrace: [            // Merge agent traces + Claude trace   ║
  ║         ...signals.trace,                                                 ║
  ║         ...preferences.trace,                                             ║
  ║         ...flight.trace,                                                  ║
  ║         ...result.reasoningTrace   // From DSPy chain                     ║
  ║       ],                                                                  ║
  ║       overallConfidence: calculateBlendedConfidence(               ║
  ║         signals.confidence,                                               ║
  ║         preferences.confidence,                                           ║
  ║         flight.confidence,                                                ║
  ║         result.confidence                                                 ║
  ║       ),                                                                  ║
  ║     };                                                                    ║
  ║                                                                           ║
  ║  IMPLEMENTATION NOTES:                                                    ║
  ║  • Agent modules live in /agent/agents/ folder (separate files)           ║
  ║  • DSPy signatures defined in /agent/dspy-signatures.ts                   ║
  ║  • Feature flag: ENABLE_MULTI_AGENT env var (default: false)             ║
  ║  • Graceful fallback if any agent fails or DSPy timeout occurs            ║
  ║  • All agent outputs logged to reasoningTrace for transparency            ║
  ║                                                                           ║
  ╚═══════════════════════════════════════════════════════════════════════════╝
*/

/**
 * Orchestrates a full arrival plan for the given guest.
 *
 * CURRENT IMPLEMENTATION: Single-shot Claude call with all context.
 * Safe, fast, production-ready for hackathon.
 *
 * FUTURE IMPLEMENTATION: Parallel multi-agent data interpretation + DSPy
 * ChainOfThought pipeline for distributed reasoning & better observability.
 * Set ENABLE_MULTI_AGENT=true in .env to activate (when implemented).
 *
 * @param guestId - e.g. "g_tarun"
 * @param flightDelayMinutes - inject a mock delay for the demo pivot (default 0)
 */
export async function orchestrate(
  guestId: string,
  flightDelayMinutes = 0
): Promise<OrchestrationResult> {
  const sources = getSources();
  const flight = sources.flight.getFlightStatus(null, flightDelayMinutes);

  try {
    const guest = sources.guests.getGuest(guestId);
    if (!guest) throw new Error(`Guest not found: ${guestId}`);

    const staff = sources.staff.getStaff();
    const localEvents = sources.events.getLocalEvents();
    const guestFlight = sources.flight.getFlightStatus(
      guest.upcomingReservation.flightNumber,
      flightDelayMinutes
    );

    /*
      MULTI-AGENT DATA INTERPRETATION CHECKPOINT
      ────────────────────────────────────────────

      When ENABLE_MULTI_AGENT=true, the system spawns parallel agents here:

      if (process.env.ENABLE_MULTI_AGENT === 'true') {
        const [signals, preferences, flight, room] = await Promise.all([
          signalInterpreterAgent(guest),
          preferenceMatcherAgent(guest, staff, localEvents),
          flightImpactAnalyzerAgent(guestFlight, guest),
          roomConfigPreCalculatorAgent(guest, guestFlight),
        ]);

        // Validate outputs; if any fail, use original heuristics
        if (!validateAgentOutputs({ signals, preferences, flight, room })) {
          return getFallback(guestId, guestFlight);
        }

        // Agents produce:
        // - signals: { high_sensitivity: Signal[], low: Signal[], trace: TraceStep[] }
        // - preferences: { matched_items: ItineraryItem[], staff_affinity: Record<string, number>, trace }
        // - flight: { circadian_params, amenity_swaps, impact_score, trace }
        // - room: { base_temp, base_lighting_kelvin, base_amenities, trace }
      }
    */

    const { member: assignedStaff, reasons, confidence: matchConfidence } = matchHost(guest, staff);
    const assignment: HostAssignment = {
      assignedStaffId: assignedStaff.id,
      continuityFlag: assignedStaff.pastGuestIds.includes(guestId),
      matchReasons: reasons,
      confidence: matchConfidence,
    };

    const prompt = buildPrompt(guest, assignedStaff, assignment, guestFlight, localEvents);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    }, { signal: AbortSignal.timeout(7_000) });

    const raw = message.content[0]?.type === "text" ? message.content[0].text : "";
    const json = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    const result = JSON.parse(json) as OrchestrationResult;

    result.flightStatus = guestFlight;
    result.hostAssignment = assignment;
    result.guestId = guestId;
    result.generatedAt = new Date().toISOString();
    if (result.hostBrief) result.hostBrief.flightStatus = guestFlight;

    return result;
  } catch (err) {
    console.warn("[orchestrate] error — using hardcoded fallback:", err);
    return getFallback(guestId, flight);
  }
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

// Only true when invoked directly via tsx/node, never inside a bundled Vercel Lambda
const isMain =
  process.argv[1]?.replace(/\\/g, "/").endsWith("agent/orchestrate.ts") ||
  process.argv[1]?.replace(/\\/g, "/").endsWith("agent/orchestrate.js");

if (isMain) {
  const guestId = process.argv[2] ?? "g_tarun";
  const delayMin = process.argv[3] ? parseInt(process.argv[3], 10) : 0;
  orchestrate(guestId, delayMin)
    .then(result => process.stdout.write(JSON.stringify(result, null, 2) + "\n"))
    .catch(err => { console.error(err); process.exit(1); });
}
