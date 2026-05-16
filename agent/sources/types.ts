import type { Guest, StaffMember, FlightStatus } from "../../shared/types";

export interface GuestSource {
  getGuest(guestId: string): Guest | null;
  getAllGuests(): Guest[];
}

export interface StaffSource {
  getStaff(): StaffMember[];
  getStaffMember(staffId: string): StaffMember | null;
}

export interface FlightSource {
  getFlightStatus(flightNumber: string | null, delayMinutes?: number): FlightStatus;
}

export interface EventsSource {
  getLocalEvents(): unknown[];
}

export interface DataSources {
  guests: GuestSource;
  staff: StaffSource;
  flight: FlightSource;
  events: EventsSource;
}
