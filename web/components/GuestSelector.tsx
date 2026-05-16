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
  disabled?: boolean;
}

export default function GuestSelector({ selectedGuestId, onSelect, disabled }: GuestSelectorProps) {
  return (
    <section>
      <h2
        className="text-xs tracking-[0.2em] uppercase mb-5 font-sans"
        style={{ color: 'var(--text-muted)' }}
      >
        Arriving Guests Today
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {GUESTS.map(guest => {
          const isSelected = selectedGuestId === guest.id;
          return (
            <button
              key={guest.id}
              onClick={() => !disabled && onSelect(guest.id)}
              disabled={disabled}
              className="relative text-left p-4 rounded-xl border transition-all duration-200"
              style={{
                borderColor: isSelected ? 'var(--text-primary)' : 'var(--border)',
                backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--surface)',
                boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled && !isSelected ? 0.6 : 1,
              }}
            >
              {/* Header: flag + tier */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-lg">{guest.flag}</span>
                <span
                  className="text-xs font-medium tracking-wide"
                  style={{ color: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}
                >
                  {guest.tier}
                </span>
              </div>

              {/* Name */}
              <p
                className="font-serif text-lg font-light leading-tight"
                style={{ color: isSelected ? '#FFFFFF' : 'var(--text-primary)' }}
              >
                {guest.title} {guest.name}
              </p>

              {/* Trip purpose (primary info) */}
              <p
                className="text-xs mt-1.5 mb-2.5"
                style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--accent)' }}
              >
                {guest.tripPurpose}
              </p>

              {/* Languages + restrictions (compact) */}
              <div className="space-y-0.5 text-xs mb-3" style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
                <p>Languages: {guest.languages}</p>
                <p>Restrictions: {guest.restrictions}</p>
              </div>

              {/* Status badges (bottom) */}
              <div className="flex flex-wrap gap-1">
                {/* Itinerary status */}
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' :
                      guest.itineraryStatus === 'confirmed' ? 'var(--success-bg)' :
                      guest.itineraryStatus === 'requested' ? 'var(--pivot-bg)' :
                      'var(--surface-alt)',
                    color: isSelected ? 'rgba(255,255,255,0.8)' :
                      guest.itineraryStatus === 'confirmed' ? 'var(--success)' :
                      guest.itineraryStatus === 'requested' ? 'var(--pivot)' :
                      'var(--text-muted)',
                  }}
                >
                  {guest.itineraryStatus === 'confirmed' ? '✓ Itinerary' :
                   guest.itineraryStatus === 'requested' ? '○ Itinerary' :
                   '✗ No itinerary'}
                </span>

                {/* Host assignment */}
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : guest.assignedHost ? 'var(--surface-alt)' : 'var(--surface-alt)',
                    color: isSelected ? 'rgba(255,255,255,0.8)' : guest.assignedHost ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  {guest.assignedHost ? `👤 ${guest.assignedHost.split(' ')[0]}` : '👤 Unassigned'}
                </span>

                {/* Elite advisor */}
                {guest.eliteAdvisor && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(156,125,90,0.1)',
                      color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--accent)',
                    }}
                  >
                    ✦ Elite advisor
                  </span>
                )}
              </div>

              {isSelected && (
                <div className="absolute top-3 right-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
