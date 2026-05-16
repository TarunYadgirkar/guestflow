import React from 'react';

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
}

const GUESTS: GuestCard[] = [
  {
    id: 'g_tarun',
    title: 'Mr.',
    name: 'Tarun Singh',
    tier: 'Rosewood Elite',
    tripPurpose: 'Anniversary – 9 yrs',
    languages: 'Hindi & English',
    restrictions: 'Vegetarian, no eggs',
    itineraryStatus: 'confirmed',
    assignedHost: 'Maria Santos',
    eliteAdvisor: true,
    flag: '🇮🇳',
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

export default function GuestSelector({ selectedGuestId, onSelect, propertyId, disabled }: GuestSelectorProps) {
  const arrivingGuestIds = PROPERTY_GUEST_MAP[propertyId] || [];
  const arrivingGuests = GUESTS.filter(g => arrivingGuestIds.includes(g.id));

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      )}
    </section>
  );
}
