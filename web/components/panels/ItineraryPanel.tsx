import React, { useState } from 'react';
import type { GuestItinerary } from '../../../shared/types';
import Collapsible from '../Collapsible';

interface Props {
  itinerary: GuestItinerary;
  className?: string;
  style?: React.CSSProperties;
}

export default function ItineraryPanel({ itinerary, className, style }: Props) {
  const [lang, setLang] = useState<'native' | 'english'>('english');

  return (
    <div
      className={`${className ?? ''}`}
      style={{ borderTop: '3px solid var(--accent)', paddingTop: '16px', ...style }}
    >
      {/* Header with Language Toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Itinerary
        </h2>

        {itinerary.dualLanguage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang('english')}
              className="text-sm px-3 py-1"
              style={{
                backgroundColor: lang === 'english' ? 'var(--accent)' : 'transparent',
                color: lang === 'english' ? 'white' : 'var(--accent)',
                border: '1px solid var(--accent)',
                fontWeight: lang === 'english' ? 'bold' : 'normal',
                cursor: 'pointer',
              }}
            >
              English
            </button>
            <button
              onClick={() => setLang('native')}
              className="text-sm px-3 py-1"
              style={{
                backgroundColor: lang === 'native' ? 'var(--accent)' : 'transparent',
                color: lang === 'native' ? 'white' : 'var(--accent)',
                border: '1px solid var(--accent)',
                fontWeight: lang === 'native' ? 'bold' : 'normal',
                cursor: 'pointer',
              }}
            >
              {itinerary.nativeLanguage}
            </button>
          </div>
        )}
      </div>

      {/* Items as Bullets */}
      <div className="space-y-3">
        {itinerary.items.map((item, i) => {
          const showNative = itinerary.dualLanguage && lang === 'native';
          const title = showNative && item.localizedContent ? item.localizedContent.title : item.title;
          const description = showNative && item.localizedContent ? item.localizedContent.description : item.description;

          return (
            <div key={i} className="flex gap-3 items-start">
              <span className="font-bold text-xl" style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }}>•</span>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold leading-snug">{title}</p>
                <Collapsible title="Details & Data Source" defaultOpen={false}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>{description}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '4px' }}>
                    Data source:
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    ✓ Inferred from guest profile preferences, past stay history, and local events matching guest interests
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.when} • {item.status === 'auto' ? 'Confirmed' : 'Pending'}
                  </p>
                </Collapsible>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
