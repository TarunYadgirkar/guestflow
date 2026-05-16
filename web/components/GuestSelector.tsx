import React from 'react';

// Minimal interface for the UI cards
interface GuestProfile {
  id: string;
  name: string;
  description: string;
}

const GUESTS: GuestProfile[] = [
  { id: 'g_tarun', name: 'Tarun Singh', description: 'Returning Guest • Anniversary • High Continuity' },
  { id: 'g_priscilla', name: 'Priscilla Tan', description: 'First-Time • Business / VC • High Tech Gap' },
  { id: 'g_park', name: 'Daniel Park', description: 'Family Stay • Birthday • Continuity' },
];

interface GuestSelectorProps {
  selectedGuestId: string | null;
  onSelect: (guestId: string) => void;
}

export default function GuestSelector({ selectedGuestId, onSelect }: GuestSelectorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <h2 className="text-xl font-medium text-gray-900 mb-6 font-serif">Select Guest Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {GUESTS.map((guest) => {
          const isSelected = selectedGuestId === guest.id;
          return (
            <button
              key={guest.id}
              onClick={() => onSelect(guest.id)}
              className={`
                relative flex flex-col text-left p-6 rounded-xl border transition-all duration-300
                ${isSelected 
                  ? 'border-black bg-black text-white shadow-lg scale-[1.02]' 
                  : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400 hover:shadow-md'
                }
              `}
            >
              <span className={`text-sm font-medium tracking-wider uppercase mb-2 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                {guest.id}
              </span>
              <span className="text-2xl font-serif mb-3">
                {guest.name}
              </span>
              <span className={`text-sm leading-relaxed ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}>
                {guest.description}
              </span>
              
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
