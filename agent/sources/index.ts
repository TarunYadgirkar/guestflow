import { createMockSources } from "./mock";
import type { DataSources } from "./types";

export type { DataSources, GuestSource, StaffSource, FlightSource, EventsSource } from "./types";

/**
 * Get data sources (mock or real).
 * Currently returns mock sources. Swap to real sources when Rosewood integrations are ready.
 * Real sources would implement GuestSource, StaffSource, FlightSource, EventsSource interfaces
 * and fetch from Salesforce/Hapi, OPERA, FlightAware, etc.
 */
export function getSources(): DataSources {
  // TODO: add environment logic here
  // if (process.env.USE_REAL_SOURCES) return createRealSources();
  return createMockSources();
}
