import React, { useState } from 'react';
import type { HostBrief } from '../../../shared/types';
import staffData from '../../../data/staff.json';

interface StaffRecord { id: string; name: string; role: string; }

interface Props {
  hostBrief: HostBrief;
  className?: string;
  style?: React.CSSProperties;
}

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
      className={`rounded-xl border overflow-hidden ${className ?? ''}`}
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', ...style }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-serif text-xl font-light">Host Brief</h3>
            <p className="text-xs tracking-widest uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>Artifact 4</p>
          </div>
          {staff && (
            <div className="text-right">
              <p className="text-sm font-medium">{staff.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{staff.role}</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: '520px' }}>

        {/* Flight status banner */}
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: isDelayed ? 'var(--pivot-bg)' : 'var(--success-bg)',
            border: `1px solid ${isDelayed ? 'var(--pivot-border)' : '#BBF7D0'}`,
          }}
        >
          <div className="flex items-center gap-2">
            <span>{isDelayed ? '⚠' : '✈'}</span>
            <span
              className="font-medium"
              style={{ color: isDelayed ? 'var(--pivot)' : 'var(--success)' }}
            >
              {flight.flightNumber} — {flight.status === 'on-time' ? 'On time' : `Delayed ${flight.delayMinutes} min`}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: isDelayed ? 'var(--pivot)' : 'var(--success)' }}>
            {flight.impact}
          </p>
        </div>

        {/* Greeting */}
        <div>
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Greeting</p>
          <blockquote
            className="font-serif text-base font-light leading-relaxed pl-4 italic"
            style={{ borderLeft: '2px solid var(--accent)', color: 'var(--text-primary)' }}
          >
            {hostBrief.greeting}
          </blockquote>
        </div>

        {/* Key Facts */}
        <div>
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Key Facts</p>
          <ol className="space-y-2">
            {hostBrief.keyFacts.map((fact, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: 'var(--surface-alt)', color: 'var(--accent)' }}
                >
                  {i + 1}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>{fact}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Service Notes */}
        <div>
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Service Notes</p>
          <ul className="space-y-1.5">
            {hostBrief.serviceNotes.map((note, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span style={{ color: 'var(--accent)' }}>·</span>
                <span style={{ color: 'var(--text-secondary)' }}>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Back-Office Standby Instructions */}
        {hostBrief.backOfficeStandbyInstructions.length > 0 && (
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: '#FEF9C3', border: '1px solid #FDE047' }}
          >
            <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: '#713F12' }}>
              📦 Standby Instructions
            </p>
            <ul className="space-y-2">
              {hostBrief.backOfficeStandbyInstructions.map((instr, i) => (
                <li key={i} className="text-sm" style={{ color: '#78350F' }}>{instr}</li>
              ))}
            </ul>
          </div>
        )}

        {/* DO NOT MENTION — THE DIFFERENTIATOR */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--danger-border)' }}
        >
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{ backgroundColor: 'var(--danger)', color: 'white' }}
          >
            <span className="text-base">⚠</span>
            <span className="text-xs font-semibold tracking-[0.15em] uppercase">
              Do Not Mention
            </span>
            <span className="text-xs opacity-75 ml-auto">Inferred · Never speak aloud</span>
          </div>
          <div
            className="p-4 space-y-3"
            style={{ backgroundColor: 'var(--danger-bg)' }}
          >
            {hostBrief.doNotMention.map((item, i) => (
              <div key={i} className="flex gap-2.5 text-sm">
                <span style={{ color: 'var(--danger)' }} className="flex-shrink-0 mt-0.5">✕</span>
                <span style={{ color: '#7F1D1D' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Voice brief button */}
        <button
          onClick={handleVoiceBrief}
          className="w-full rounded-lg py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{
            border: '1px solid var(--border)',
            backgroundColor: voicePlaying ? 'var(--text-primary)' : 'var(--surface)',
            color: voicePlaying ? 'white' : 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          {voicePlaying ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Playing voice brief… (click to stop)
            </>
          ) : (
            <>
              <span>🎙</span>
              Hear Maria's Brief
            </>
          )}
        </button>
      </div>
    </div>
  );
}
