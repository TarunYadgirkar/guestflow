import React, { useState } from 'react';
import type { HostBrief } from '../../../shared/types';
import staffData from '../../../data/staff.json';
import Collapsible from '../Collapsible';

interface StaffRecord { id: string; name: string; role: string; }

interface Props {
  hostBrief: HostBrief;
  className?: string;
  style?: React.CSSProperties;
}

// Data source labels (no icons)
const DATA_SOURCES = {
  past: { label: 'Past stay', color: 'var(--accent)' },
  advisor: { label: 'Elite status', color: 'var(--accent)' },
  form: { label: 'Guest form', color: 'var(--accent)' },
  reservation: { label: 'Reservation', color: 'var(--accent)' },
};

export default function HostBriefPanel({ hostBrief, className, style }: Props) {
  const [voicePlaying, setVoicePlaying] = useState(false);
  const staff = (staffData as unknown as StaffRecord[]).find(s => s.id === hostBrief.forStaffId);

  const flight = hostBrief.flightStatus;
  const isDelayed = flight.status === 'delayed';

  function handleVoiceBrief() {
    if (voicePlaying) {
      window.speechSynthesis.cancel();
      setVoicePlaying(false);
      return;
    }

    const text = `${hostBrief.greeting} Key facts: ${hostBrief.keyFacts.join('. ')}. Service notes: ${hostBrief.serviceNotes.join('. ')}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google US English'));
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => setVoicePlaying(false);
    utterance.onerror = () => setVoicePlaying(false);

    setVoicePlaying(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div
      className={`${className ?? ''}`}
      style={{ borderTop: '3px solid var(--accent)', paddingTop: '16px', ...style }}
    >
      {/* Header */}
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>Host Brief</h2>

      <div className="space-y-4">
        {/* Greeting - Prominent */}
        <div>
          <p className="text-base font-bold italic">{hostBrief.greeting}</p>
        </div>

        {/* Flight Status */}
        <div>
          <p className="font-bold text-sm mb-1">Flight: {flight.flightNumber}</p>
          <p className="text-sm" style={{ color: isDelayed ? 'var(--accent)' : 'var(--text)' }}>
            {flight.status === 'on-time' ? 'On-time' : `Delayed ${flight.delayMinutes}m`}
          </p>
        </div>

        {/* Key Facts - Bullets with Data Sources */}
        {hostBrief.keyFacts.length > 0 && (
          <div>
            <p className="font-bold text-sm mb-2">Key Facts to Share</p>
            <ul className="space-y-2">
              {hostBrief.keyFacts.map((fact, i) => (
                <li key={i} className="flex gap-2 items-start text-sm">
                  <span className="font-bold" style={{ color: 'var(--accent)' }}>•</span>
                  <div className="flex-1">
                    <p>{fact}</p>
                    <Collapsible title="Data source" defaultOpen={false}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ✓ Verified from guest profile, past stay records, or reservation notes
                      </p>
                    </Collapsible>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Service Notes */}
        {hostBrief.serviceNotes.length > 0 && (
          <Collapsible title="Service Notes">
            <ul className="space-y-1 text-sm">
              {hostBrief.serviceNotes.map((note, i) => (
                <li key={i}>• {note}</li>
              ))}
            </ul>
          </Collapsible>
        )}

        {/* Back-Office Standby */}
        {hostBrief.backOfficeStandbyInstructions.length > 0 && (
          <Collapsible title="Back-Office Items">
            <ul className="space-y-1 text-sm">
              {hostBrief.backOfficeStandbyInstructions.map((instr, i) => (
                <li key={i}>→ {instr}</li>
              ))}
            </ul>
          </Collapsible>
        )}

        {/* Internal Signals - Staff Only */}
        {hostBrief.doNotMention.length > 0 && (
          <Collapsible title="Internal Signals (Staff Only)">
            <div className="space-y-1 text-sm">
              {hostBrief.doNotMention.map((item, i) => (
                <p key={i} style={{ color: 'var(--accent)' }}>
                  ⚠ {item}
                </p>
              ))}
            </div>
          </Collapsible>
        )}

        {/* Audio Brief Button */}
        <button
          onClick={handleVoiceBrief}
          className="btn-primary w-full text-sm py-2"
          style={{
            backgroundColor: voicePlaying ? 'var(--accent)' : 'var(--accent)',
          }}
        >
          {voicePlaying ? 'Stop Audio' : 'Play Audio Brief'}
        </button>
      </div>
    </div>
  );
}
