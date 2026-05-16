import React, { useState } from 'react';
import type { GuestItinerary, ItineraryItem } from '../../../shared/types';

interface Props {
  itinerary: GuestItinerary;
  className?: string;
  style?: React.CSSProperties;
}

const TYPE_ICONS: Record<ItineraryItem['type'], string> = {
  dining: '🍽',
  cultural: '🎨',
  wellness: '🧘',
  excursion: '🌿',
};

export default function ItineraryPanel({ itinerary, className, style }: Props) {
  const [lang, setLang] = useState<'native' | 'english'>('native');
  const showNative = itinerary.dualLanguage && lang === 'native';

  return (
    <div
      className={`rounded-xl border overflow-hidden ${className ?? ''}`}
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', ...style }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-serif text-xl font-light">Stay Plan & Bookings</h3>
            <p className="text-xs tracking-widest uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>Concierge-assembled itinerary</p>
          </div>

          {/* Language Lens toggle */}
          {itinerary.dualLanguage && (
            <div className="text-right">
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className="text-xs px-2 py-1 rounded-full cursor-pointer transition-all"
                  onClick={() => setLang('native')}
                  style={{
                    backgroundColor: lang === 'native' ? 'var(--text-primary)' : 'var(--surface-alt)',
                    color: lang === 'native' ? 'white' : 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {itinerary.nativeLanguage}
                </span>
                <span
                  className="text-xs px-2 py-1 rounded-full cursor-pointer transition-all"
                  onClick={() => setLang('english')}
                  style={{
                    backgroundColor: lang === 'english' ? 'var(--text-primary)' : 'var(--surface-alt)',
                    color: lang === 'english' ? 'white' : 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  English
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--accent)' }}>Language Lens active</p>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '520px' }}>
        {itinerary.items.map((item, i) => {
          const title = showNative && item.localizedContent ? item.localizedContent.title : item.title;
          const description = showNative && item.localizedContent ? item.localizedContent.description : item.description;

          return (
            <div
              key={i}
              className="pb-4 border-b last:border-b-0 last:pb-0"
              style={{ borderColor: 'var(--border-light)' }}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5 flex-shrink-0">{TYPE_ICONS[item.type]}</span>
                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-serif text-base font-medium leading-snug">{title}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: item.status === 'auto' ? 'var(--success-bg)' : 'var(--pivot-bg)',
                          color: item.status === 'auto' ? 'var(--success)' : 'var(--pivot)',
                        }}
                      >
                        {item.status === 'auto' ? 'Auto' : 'Review'}
                      </span>
                    </div>
                  </div>

                  {/* When + Location */}
                  <p className="text-xs mt-0.5 mb-1.5" style={{ color: 'var(--accent)' }}>
                    {item.when} • {item.status === 'auto' ? 'On-property' : 'Off-property'}
                  </p>

                  {/* Description */}
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>

                  {/* Source & Status */}
                  <div className="mt-2 flex gap-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: item.status === 'auto' ? 'var(--success-bg)' : 'var(--pivot-bg)',
                        color: item.status === 'auto' ? 'var(--success)' : 'var(--pivot)',
                      }}
                    >
                      {item.status === 'auto' ? '✓ Confirmed' : '○ Requested'}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: 'var(--surface-alt)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Source: {item.whyThisGuest.includes('concierge') ? 'Concierge suggested' : item.whyThisGuest.includes('guest') ? 'Guest request' : 'Package'}
                    </span>
                  </div>

                  {/* Dietary notes if applicable */}
                  {item.whyThisGuest.toLowerCase().includes('vegetarian') && (
                    <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                      🥗 Vegetarian, no alcohol, quiet seating
                    </p>
                  )}

                  {/* Show both languages when dual-language */}
                  {itinerary.dualLanguage && item.localizedContent && lang === 'native' && (
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {item.title}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
