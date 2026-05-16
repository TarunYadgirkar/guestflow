import { readFileSync } from "fs";
import { resolve } from "path";
import type { Guest, StaffMember, FlightStatus } from "../../shared/types";
import type { GuestSource, StaffSource, FlightSource, EventsSource, DataSources } from "./types";

const DATA_DIR = resolve(process.cwd(), "data");

function load<T>(filename: string): T {
  return JSON.parse(readFileSync(resolve(DATA_DIR, filename), "utf-8")) as T;
}

class MockGuestSource implements GuestSource {
  private guests: Guest[] | null = null;

  private loadGuests(): Guest[] {
    if (!this.guests) {
      this.guests = load<Guest[]>("guests.json");
    }
    return this.guests;
  }

  getGuest(guestId: string): Guest | null {
    const guests = this.loadGuests();
    return guests.find((g) => g.id === guestId) || null;
  }

  getAllGuests(): Guest[] {
    return this.loadGuests();
  }
}

class MockStaffSource implements StaffSource {
  private staff: StaffMember[] | null = null;

  private loadStaff(): StaffMember[] {
    if (!this.staff) {
      this.staff = load<StaffMember[]>("staff.json");
    }
    return this.staff;
  }

  getStaff(): StaffMember[] {
    return this.loadStaff();
  }

  getStaffMember(staffId: string): StaffMember | null {
    const staff = this.loadStaff();
    return staff.find((s) => s.id === staffId) || null;
  }
}

class MockFlightSource implements FlightSource {
  getFlightStatus(flightNumber: string | null, delayMinutes = 0): FlightStatus {
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
}

class MockEventsSource implements EventsSource {
  private events: unknown[] | null = null;

  private loadEvents(): unknown[] {
    if (!this.events) {
      this.events = load<unknown[]>("localEvents.json");
    }
    return this.events;
  }

  getLocalEvents(): unknown[] {
    return this.loadEvents();
  }
}

export function createMockSources(): DataSources {
  return {
    guests: new MockGuestSource(),
    staff: new MockStaffSource(),
    flight: new MockFlightSource(),
    events: new MockEventsSource(),
  };
}
