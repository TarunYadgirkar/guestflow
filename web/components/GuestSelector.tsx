import React from 'react';

interface GuestCard {
  id: string;
  title: string;
  name: string;
  tier: string;
  tags: string[];
  flag: string;
}

const GUESTS: GuestCard[] = [
  {
    id: 'g_tarun',
    title: 'Mr.',
    name: 'Tarun Singh',
    tier: 'Rosewood Elite',
    tags: ['Anniversary · 9 yrs', 'Hindi Language Lens', 'Sikh Standby Protocol', 'UA328 Mumbai'],
    flag: '🇮🇳',
  },
  {
    id: 'g_mei',
    title: 'Ms.',
    name: 'Mei Chen',
    tier: 'Rosewood Elite',
    tags: ['Stanford AI Summit', 'Mandarin Language Lens', 'Privacy Protocol', 'CX870 Hong Kong'],
    flag: '🇨🇳',
  },
  {
    id: 'g_yuki',
    title: 'Ms.',
    name: 'Yuki Tanaka',
    tier: 'Rosewood Signature',
    tags: ['Japanese Language Lens', 'Ceramics · Wellness', 'JL068 Tokyo'],
    flag: '🇯🇵',
  },
  {
    id: 'g_carlos',
    title: 'Mr.',
    name: 'Carlos Rivera',
    tier: 'Rosewood Signature',
    tags: ['Sand Hill VC Summit', 'Spanish Language Lens', 'AM696 Mexico City'],
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
        Arriving Guests
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {GUESTS.map(guest => {
          const isSelected = selectedGuestId === guest.id;
          return (
            <button
              key={guest.id}
              onClick={() => !disabled && onSelect(guest.id)}
              disabled={disabled}
              className="relative text-left p-5 rounded-xl border transition-all duration-200"
              style={{
                borderColor: isSelected ? 'var(--text-primary)' : 'var(--border)',
                backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--surface)',
                boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled && !isSelected ? 0.6 : 1,
              }}
            >
              {/* Flag + tier */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">{guest.flag}</span>
                <span
                  className="text-xs tracking-wide"
                  style={{ color: isSelected ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)' }}
                >
                  {guest.tier}
                </span>
              </div>

              {/* Name */}
              <p
                className="font-serif text-xl font-light leading-tight mb-1"
                style={{ color: isSelected ? '#FFFFFF' : 'var(--text-primary)' }}
              >
                {guest.title} {guest.name}
              </p>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {guest.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.12)' : 'var(--surface-alt)',
                      color: isSelected ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {isSelected && (
                <div className="absolute top-4 right-4">
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
