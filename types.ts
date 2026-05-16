// GuestFlow — FROZEN DATA CONTRACT
// Do NOT edit after 10:00 AM without a team huddle + everyone re-pulls.
// Every Claude Code session must code against THESE types.

export type Sensitivity = "low" | "medium" | "high";

export interface Preferences {
  water: "still" | "sparkling";
  roomTempF: number;
  pillowType: string;          // "firm" | "down" | "hypoallergenic"
  floor: "high" | "low" | "any";
  quietRoom: boolean;
  dietary: string[];           // ["vegetarian", "no shellfish"]
  wakeUpTime: string | null;   // "06:00" or null
  interests: string[];         // ["contemporary art", "natural wine"]
}

export interface PastStay {
  property: string;
  checkIn: string;             // ISO date
  checkOut: string;            // ISO date
  hostStaffId: string | null;  // continuity key
  serviceNotes: string;
  highlight?: string;
}

export interface Reservation {
  property: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  partySize: number;
  flightNumber: string | null;
  occasion: string | null;     // "anniversary" | "business" | null
}

export interface Signal {
  kind: string;                // "calendar" | "social" | "loyalty" | "weather"
  detail: string;
  sensitivity: Sensitivity;    // high => likely doNotMention
}

export interface Guest {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  loyaltyTier: string;
  languages: string[];
  preferences: Preferences;
  stayHistory: PastStay[];
  upcomingReservation: Reservation;
  signals: Signal[];
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  languages: string[];
  specialties: string[];
  pastGuestIds: string[];      // continuity
  onShift: boolean;
  currentLoad?: number;
}

// ---- Output artifacts ----

export interface RoomSpec {
  temperatureF: number;
  pillowType: string;
  minibar: string[];
  welcomeAmenity: { item: string; rationale: string };
  environmentNotes: string[];
  confidence: number;          // 0..1
  autoApplied: boolean;        // true if confidence >= 0.8
}

export interface ItineraryItem {
  title: string;
  type: "dining" | "cultural" | "wellness" | "excursion";
  when: string;                // "Fri 7:30 PM"
  description: string;
  whyThisGuest: string;
  confidence: number;
  status: "auto" | "staff-review";
}

export interface GuestItinerary {
  items: ItineraryItem[];
}

export interface MatchReason {
  factor: "continuity" | "language" | "affinity" | "availability";
  detail: string;
  weight: number;              // 0..1
}

export interface HostAssignment {
  assignedStaffId: string;
  continuityFlag: boolean;
  matchReasons: MatchReason[];
  confidence: number;
}

export interface HostBrief {
  forStaffId: string;
  greeting: string;
  keyFacts: string[];
  serviceNotes: string[];
  doNotMention: string[];      // THE differentiator
  flightStatus: {
    flightNumber: string | null;
    status: string;
    scheduledArrival: string;
    adjustedArrival: string;
    impact: string;
  };
}

export interface TraceStep {
  label: string;               // "Checking flight UA328..."
  status: "pending" | "running" | "done";
  detail?: string;
}

export interface OrchestrationResult {
  guestId: string;
  generatedAt: string;         // ISO
  roomSpec: RoomSpec;
  itinerary: GuestItinerary;
  hostAssignment: HostAssignment;
  hostBrief: HostBrief;
  reasoningTrace: TraceStep[];
  overallConfidence: number;
}
