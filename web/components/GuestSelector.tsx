import React, { useState } from 'react';
import Collapsible from './Collapsible';

interface GuestCard {
  id: string;
  title: string;
  name: string;
  tier: string;
  tripPurpose: string;
  languages: string;
  restrictions: string;
  itineraryStatus: 'confirmed' | 'requested' | 'none';
  assignedHost: string | null;
  eliteAdvisor: boolean;
  flag: string;
  rawData?: Record<string, unknown>;
}

const GUESTS_DATA: Record<string, Record<string, unknown>> = {
  'g_tarun': {
    title: 'Mr.',
    firstName: 'Vikram',
    lastName: 'Sharma',
    loyaltyTier: 'Rosewood Elite',
    preferredLanguage: 'Hindi',
    languages: ['Hindi', 'English'],
    originProfile: {
      timezone: 'Asia/Kolkata',
      climateF: 95,
      plugType: 'Type D',
    },
    preferences: {
      water: 'still',
      roomTempF: 68,
      pillowType: 'firm',
      dietary: ['vegetarian', 'no alcohol'],
      interests: ['contemporary art', 'trail running', 'meditation', 'architecture'],
    },
    stayHistory: [
      { property: 'Rosewood London', checkIn: '2024-11-14', hostStaffId: 's_maria' },
      { property: 'Rosewood Bangkok', checkIn: '2025-03-05', hostStaffId: 's_maria' },
    ],
  },
  'g_mei': {
    title: 'Ms.',
    firstName: 'Mei',
    lastName: 'Chen',
    loyaltyTier: 'Rosewood Elite',
    preferredLanguage: 'Mandarin',
    languages: ['Mandarin', 'English', 'Cantonese'],
    originProfile: { timezone: 'Asia/Shanghai', climateF: 72 },
    preferences: { water: 'sparkling', roomTempF: 72, dietary: ['pescatarian', 'no MSG'] },
  },
  'g_yuki': {
    title: 'Ms.',
    firstName: 'Yuki',
    lastName: 'Tanaka',
    loyaltyTier: 'Rosewood Signature',
    preferredLanguage: 'Japanese',
    languages: ['Japanese', 'English'],
    preferences: { dietary: ['gluten-free'] },
  },
  'g_carlos': {
    title: 'Mr.',
    firstName: 'Carlos',
    lastName: 'Rivera',
    loyaltyTier: 'Rosewood Signature',
    preferredLanguage: 'Spanish',
    languages: ['Spanish', 'English'],
    preferences: { dietary: ['no shellfish'] },
  },
};

const GUESTS: GuestCard[] = [
  {
    id: 'g_tarun',
    title: 'Mr.',
    name: 'Vikram Sharma',
    tier: 'Rosewood Elite',
    tripPurpose: 'Anniversary – 9 yrs',
    languages: 'Hindi & English',
    restrictions: 'Vegetarian, no eggs',
    itineraryStatus: 'confirmed',
    assignedHost: 'Maria Santos',
    eliteAdvisor: true,
    flag: '🇮🇳',
    rawData: GUESTS_DATA['g_tarun'],
  },
  {
    id: 'g_mei',
    title: 'Ms.',
    name: 'Mei Chen',
    tier: 'Rosewood Elite',
    tripPurpose: 'Business – conference',
    languages: 'Mandarin & English',
    restrictions: 'No MSG, pescatarian',
    itineraryStatus: 'requested',
    assignedHost: 'Sophia Chen',
    eliteAdvisor: true,
    flag: '🇨🇳',
    rawData: GUESTS_DATA['g_mei'],
  },
  {
    id: 'g_yuki',
    title: 'Ms.',
    name: 'Yuki Tanaka',
    tier: 'Rosewood Signature',
    tripPurpose: 'Wellness retreat',
    languages: 'Japanese & English',
    restrictions: 'Gluten-free',
    itineraryStatus: 'confirmed',
    assignedHost: null,
    eliteAdvisor: false,
    flag: '🇯🇵',
    rawData: GUESTS_DATA['g_yuki'],
  },
  {
    id: 'g_carlos',
    title: 'Mr.',
    name: 'Carlos Rivera',
    tier: 'Rosewood Signature',
    tripPurpose: 'Business – investor meetings',
    languages: 'Spanish & English',
    restrictions: 'No shellfish',
    itineraryStatus: 'none',
    assignedHost: 'James Okafor',
    eliteAdvisor: false,
    flag: '🇲🇽',
    rawData: GUESTS_DATA['g_carlos'],
  },
];

interface GuestSelectorProps {
  selectedGuestId: string | null;
  onSelect: (id: string) => void;
  propertyId: string;
  disabled?: boolean;
}

// Map properties to guest IDs
const PROPERTY_GUEST_MAP: Record<string, string[]> = {
  'rsw-sandhill': ['g_tarun', 'g_carlos'],
  'rsw-beijing': ['g_mei'],
  'rsw-miyakojima': ['g_yuki'],
};

// Generate comprehensive AI summary of guest data
function generateGuestSummary(data: Record<string, unknown>): string {
  const prefs = data.preferences as Record<string, unknown> | undefined;
  const origin = data.originProfile as Record<string, unknown> | undefined;
  const langs = data.languages as string[] | undefined;
  const dietary = prefs?.dietary as string[] | undefined;
  const interests = prefs?.interests as string[] | undefined;
  const history = data.stayHistory as Array<Record<string, unknown>> | undefined;
  const companion = data.companion as Record<string, unknown> | undefined;
  const tech = data.technologyProfile as Record<string, unknown> | undefined;
  const diningPrefs = prefs?.diningPreferences as Record<string, unknown> | undefined;
  const attire = prefs?.attire as Record<string, unknown> | undefined;

  const parts: string[] = [];

  // Origin location
  if (origin?.city && origin?.region) {
    const city = origin.city as string;
    const climateF = origin.climateF as number;
    parts.push(`Traveling from ${city} (${climateF}°F climate)`);
  }

  // Companion info
  if (companion?.firstName) {
    const compName = companion.firstName as string;
    const compRel = companion.relationship as string;
    parts.push(`Coming with ${compRel}: ${compName}`);
  }

  // Language & communication
  if (langs?.length) {
    parts.push(`Languages: ${langs.join('/')}`);
  }

  // Dietary & allergies
  if (dietary?.length) {
    const dietary_str = dietary.join(', ');
    const compAllergies = companion?.preferences ? (companion.preferences as Record<string, unknown>).allergies as string[] | undefined : undefined;
    if (compAllergies?.length) {
      parts.push(`Dietary: ${dietary_str}. Companion has ${compAllergies.join(', ')} allergies`);
    } else {
      parts.push(`Dietary: ${dietary_str}`);
    }
  }

  // Dining style
  if (diningPrefs?.cuisines) {
    const cuisines = diningPrefs.cuisines as string[];
    parts.push(`Enjoys: ${cuisines.slice(0, 2).join(', ')}`);
  }

  // Attire & packing
  if (attire?.packingStyle) {
    parts.push(`Style: ${attire.packingStyle}`);
  }

  // Technology & charging
  if (tech?.devices) {
    const devices = tech.devices as Array<Record<string, unknown>>;
    const chargerTypes = [...new Set(devices.map(d => d.charger))].join('/');
    parts.push(`Tech: Needs ${chargerTypes} chargers`);
  }

  // Activity patterns
  if (interests?.length) {
    parts.push(`Interests: ${interests.slice(0, 2).join(', ')}`);
  }

  // Previous stay count
  if (history?.length) {
    parts.push(`${history.length} previous stay${history.length > 1 ? 's' : ''} on record`);
  }

  return parts.join(' • ');
}

export default function GuestSelector({ selectedGuestId, onSelect, propertyId, disabled }: GuestSelectorProps) {
  const [expandedGuestId, setExpandedGuestId] = useState<string | null>(null);
  const arrivingGuestIds = PROPERTY_GUEST_MAP[propertyId] || [];
  const arrivingGuests = GUESTS.filter(g => arrivingGuestIds.includes(g.id));
  const selectedGuest = GUESTS.find(g => g.id === selectedGuestId);

  return (
    <section>
      <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text)' }}>
        Select Guest for Arrival Planning
      </h2>
      {arrivingGuests.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }} className="text-lg">
          No guests arriving today at this property.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {arrivingGuests.map((guest, idx) => {
              const isSelected = selectedGuestId === guest.id;
              return (
                <button
                  key={guest.id}
                  onClick={() => !disabled && onSelect(guest.id)}
                  disabled={disabled}
                  className="reveal text-left transition-all duration-500"
                  style={{
                    background: isSelected ? 'var(--accent)' : '#F5F5F5',
                    border: `3px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '0',
                    padding: '28px 24px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled && !isSelected ? 0.5 : 1,
                    animationDelay: `${idx * 100}ms`,
                  }}
                >
                  {/* Guest name - Primary */}
                  <h3
                    className="mb-3 font-bold text-xl"
                    style={{
                      color: isSelected ? 'white' : 'var(--text)',
                    }}
                  >
                    {guest.title} {guest.name}
                  </h3>

                  {/* Tier + Trip purpose */}
                  <p className="text-sm mb-4" style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)' }}>
                    <strong>{guest.tier}</strong> • {guest.tripPurpose}
                  </p>

                  {/* Languages - Highlight matching in green */}
                  <p className="text-sm mb-2" style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : 'var(--text)' }}>
                    {guest.languages.includes('English') && <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Speaks English • </span>}
                    {guest.languages}
                  </p>

                  {/* Restrictions */}
                  <p className="text-sm mb-4" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                    {guest.restrictions}
                  </p>

                  {/* Status quick indicators */}
                  <div className="flex gap-2 text-xs font-semibold">
                    {guest.itineraryStatus === 'confirmed' && (
                      <span style={{ color: isSelected ? 'white' : 'var(--accent)' }}>✓ Itinerary</span>
                    )}
                    {guest.assignedHost && (
                      <span style={{ color: isSelected ? 'white' : 'var(--text-muted)' }}>👤 {guest.assignedHost.split(' ')[0]}</span>
                    )}
                    {guest.eliteAdvisor && (
                      <span style={{ color: isSelected ? 'white' : 'var(--accent)', fontWeight: 'bold' }}>★ Elite</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Expanded Data Section for Selected Guest */}
          {selectedGuest && selectedGuest.rawData && (
            <div style={{ borderTop: '2px solid var(--accent)', paddingTop: '24px' }}>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text)' }}>
                {selectedGuest.title} {selectedGuest.name} — AI Data Summary
              </h3>

              {/* AI Summary */}
              <div style={{ backgroundColor: '#F9F9F9', padding: '16px', borderLeft: '3px solid var(--accent)', marginBottom: '16px' }}>
                <p className="text-sm" style={{ color: 'var(--text)', lineHeight: '1.6' }}>
                  {generateGuestSummary(selectedGuest.rawData)}
                </p>
              </div>

              {/* Toggleable Raw JSON */}
              <Collapsible title="View All Data the AI Interprets (JSON)" defaultOpen={false}>
                <pre style={{
                  backgroundColor: '#F5F5F5',
                  padding: '12px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '0.75rem',
                  color: 'var(--text)',
                  lineHeight: '1.4',
                  border: '1px solid var(--border)',
                }}>
                  {JSON.stringify(selectedGuest.rawData, null, 2)}
                </pre>
              </Collapsible>
            </div>
          )}
        </>
      )}
    </section>
  );
}
