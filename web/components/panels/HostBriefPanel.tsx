import React, { useState } from 'react';
import type { HostBrief } from '../../../shared/types';
import staffData from '../../../data/staff.json';
import Collapsible from '../Collapsible';
import {
  ChartBar,
  Star,
  ClipboardText,
  Buildings,
  WarningCircle,
  Airplane,
  Microphone,
  Check,
  X,
  Package,
  Lock,
} from '@phosphor-icons/react';

interface StaffRecord { id: string; name: string; role: string; }

interface Props {
  hostBrief: HostBrief;
  className?: string;
  style?: React.CSSProperties;
}

const DATA_SOURCES: Record<string, { icon: React.ReactElement; label: string; color: string }> = {
  past: { icon: <ChartBar size={12} />, label: 'Past stay notes', color: 'var(--accent)' },
  advisor: { icon: <Star size={12} weight="fill" />, label: 'Elite advisor', color: 'var(--accent)' },
  form: { icon: <ClipboardText size={12} />, label: 'Guest form', color: 'var(--accent)' },
  reservation: { icon: <Buildings size={12} />, label: 'Reservation', color: 'var(--accent)' },
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
        {/* Greeting */}
        <div>
          <p className="text-base font-bold italic">{hostBrief.greeting}</p>
        </div>

        {/* Flight Status */}
        <div className="flex items-center gap-2">
          {isDelayed
            ? <WarningCircle size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            : <Airplane size={16} style={{ color: 'var(--text)', flexShrink: 0 }} />}
          <div>
            <p className="font-bold text-sm">Flight: {flight.flightNumber}</p>
            <p className="text-sm" style={{ color: isDelayed ? 'var(--accent)' : 'var(--text)' }}>
              {flight.status === 'on-time' ? 'On-time' : `Delayed ${flight.delayMinutes}m`}
            </p>
          </div>
        </div>

        {/* Key Facts */}
        {hostBrief.keyFacts.length > 0 && (
          <div>
            <p className="font-bold text-sm mb-2">Key Facts to Share</p>
            <ul className="space-y-2">
              {hostBrief.keyFacts.map((fact, i) => {
                const source = fact.includes('past stay') || fact.includes('hosted') ? 'past' :
                               fact.includes('Elite') || fact.includes('advisor') ? 'advisor' :
                               fact.includes('Rosewood') ? 'reservation' : 'form';
                const src = DATA_SOURCES[source] || DATA_SOURCES.form!;
                return (
                  <li key={i} className="flex gap-2 items-start text-sm">
                    <span className="font-bold" style={{ color: 'var(--accent)' }}>•</span>
                    <div className="flex-1">
                      <p>{fact}</p>
                      <Collapsible title="Data source" defaultOpen={false}>
                        <p className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span style={{ color: 'var(--accent)' }}>{src.icon}</span>
                          {src.label} — verified from guest profile or reservation notes
                        </p>
                      </Collapsible>
                    </div>
                  </li>
                );
              })}
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

        {/* Back-Office Items */}
        {hostBrief.backOfficeStandbyInstructions.length > 0 && (
          <Collapsible title="Back-Office Items">
            <p className="flex items-center gap-1 text-xs font-medium mb-2" style={{ color: '#713F12' }}>
              <Package size={12} /> If guest requests — fetch from back-office
            </p>
            <ul className="space-y-1 text-sm">
              {hostBrief.backOfficeStandbyInstructions.map((instr, i) => (
                <li key={i}>→ {instr}</li>
              ))}
            </ul>
          </Collapsible>
        )}

        {/* Internal Flags — ALWAYS VISIBLE, never collapse the doNotMention logic */}
        {hostBrief.doNotMention.length > 0 && (
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--danger-border)' }}>
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ backgroundColor: 'var(--danger)', color: 'white' }}
            >
              <Lock size={16} />
              <span className="text-xs font-semibold tracking-[0.15em] uppercase">
                Internal Flags (Staff Only)
              </span>
              <span className="text-xs opacity-75 ml-auto">Never mention to guest</span>
            </div>
            <div className="p-4 space-y-2.5" style={{ backgroundColor: 'var(--danger-bg)' }}>
              {hostBrief.doNotMention.map((item, i) => (
                <div key={i} className="flex gap-2.5 text-sm">
                  <X size={16} weight="bold" style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: '#7F1D1D' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audio Brief Button */}
        <button
          onClick={handleVoiceBrief}
          className="btn-primary w-full text-sm py-2 inline-flex items-center justify-center gap-2"
        >
          {voicePlaying ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Stop Audio
            </>
          ) : (
            <>
              <Microphone size={16} />
              Play Audio Brief
            </>
          )}
        </button>
      </div>
    </div>
  );
}
