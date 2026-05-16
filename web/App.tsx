import React, { useState, useEffect, useRef } from 'react';
import type { OrchestrationResult, TraceStep } from '../shared/types';
import GuestSelector from './components/GuestSelector';
import ReasoningTrace from './components/ReasoningTrace';
import RoomSpecPanel from './components/panels/RoomSpecPanel';
import ItineraryPanel from './components/panels/ItineraryPanel';
import HostAssignmentPanel from './components/panels/HostAssignmentPanel';
import HostBriefPanel from './components/panels/HostBriefPanel';

type Phase = 'idle' | 'tracing' | 'done' | 'error';

const TRACE_STEP_INTERVAL_MS = 750;

export default function App() {
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [liveTrace, setLiveTrace] = useState<TraceStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  const apiResultRef = useRef<OrchestrationResult | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepIndexRef = useRef(0);

  const BLANK_TRACE: TraceStep[] = [
    { label: 'Pulling stay history', status: 'pending', detail: '' },
    { label: 'Analyzing signals & drawing the creepy line', status: 'pending', detail: '' },
    { label: 'Checking flight status', status: 'pending', detail: '' },
    { label: 'Matching host', status: 'pending', detail: '' },
    { label: 'Building room spec & protocols', status: 'pending', detail: '' },
    { label: 'Composing host brief & itinerary', status: 'pending', detail: '' },
  ];

  function handleSelectGuest(guestId: string) {
    if (phase === 'tracing') return;
    setSelectedGuestId(guestId);
    setPhase('idle');
    setResult(null);
    setLiveTrace([]);
    setError(null);
  }

  function handleOrchestrate() {
    if (!selectedGuestId || phase === 'tracing') return;

    setPhase('tracing');
    setResult(null);
    setError(null);
    setLiveTrace([{ ...BLANK_TRACE[0]!, status: 'running' }]);
    stepIndexRef.current = 0;
    apiResultRef.current = null;

    // Fetch from API in parallel
    fetch(`/api/orchestrate?guestId=${selectedGuestId}&delay=${delayMinutes}`)
      .then(r => r.json())
      .then((data: OrchestrationResult) => {
        apiResultRef.current = data;
      })
      .catch(err => {
        setError(String(err));
        setPhase('error');
        if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      });

    // Animate trace steps
    stepTimerRef.current = setInterval(() => {
      stepIndexRef.current += 1;
      const idx = stepIndexRef.current;

      if (idx >= BLANK_TRACE.length) {
        // All steps done — check if API is back
        if (stepTimerRef.current) clearInterval(stepTimerRef.current);

        const flush = () => {
          if (apiResultRef.current) {
            setLiveTrace(apiResultRef.current.reasoningTrace);
            setResult(apiResultRef.current);
            setPhase('done');
          } else {
            // Wait for API response
            setTimeout(flush, 200);
          }
        };
        flush();
        return;
      }

      const realResult = apiResultRef.current;
      setLiveTrace(prev => {
        const updated = [...prev];
        // Mark previous step complete (using real data if available)
        if (updated[idx - 1]) {
          updated[idx - 1] = realResult?.reasoningTrace[idx - 1] ?? {
            ...BLANK_TRACE[idx - 1]!,
            status: 'complete',
            detail: '…',
          };
        }
        // Add next step as running
        if (BLANK_TRACE[idx]) {
          updated[idx] = { ...BLANK_TRACE[idx]!, status: 'running' };
        }
        return updated;
      });
    }, TRACE_STEP_INTERVAL_MS);
  }

  useEffect(() => {
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, []);

  const canOrchestrate = selectedGuestId && phase !== 'tracing';
  const showArtifacts = phase === 'done' && result;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-end justify-between">
          <div>
            <h1 className="font-serif text-4xl font-light tracking-wide" style={{ color: 'var(--text-primary)' }}>
              GuestFlow
            </h1>
            <p className="text-xs tracking-[0.2em] uppercase mt-1" style={{ color: 'var(--text-muted)' }}>
              Agentic Arrival Orchestration
            </p>
          </div>
          <div className="text-right">
            <p className="font-serif text-lg font-light" style={{ color: 'var(--text-secondary)' }}>Rosewood Sand Hill</p>
            <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Menlo Park, California</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10">

        {/* Guest Selector */}
        <GuestSelector
          selectedGuestId={selectedGuestId}
          onSelect={handleSelectGuest}
          disabled={phase === 'tracing'}
        />

        {/* Orchestrate controls */}
        {selectedGuestId && (
          <div className="mt-8 flex items-center gap-6">
            {/* Delay toggle */}
            <button
              onClick={() => setDelayMinutes(d => d === 0 ? 240 : 0)}
              disabled={phase === 'tracing'}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm transition-all"
              style={{
                borderColor: delayMinutes > 0 ? 'var(--pivot-border)' : 'var(--border)',
                backgroundColor: delayMinutes > 0 ? 'var(--pivot-bg)' : 'var(--surface)',
                color: delayMinutes > 0 ? 'var(--pivot)' : 'var(--text-secondary)',
                cursor: phase === 'tracing' ? 'not-allowed' : 'pointer',
              }}
            >
              <span
                className="w-8 h-4 rounded-full inline-flex items-center transition-all relative"
                style={{ backgroundColor: delayMinutes > 0 ? '#FB923C' : 'var(--border)' }}
              >
                <span
                  className="w-3 h-3 rounded-full bg-white shadow transition-all absolute"
                  style={{ left: delayMinutes > 0 ? '18px' : '2px' }}
                />
              </span>
              <span className="font-medium">Inject 4-hour flight delay</span>
              {delayMinutes > 0 && <span className="text-xs opacity-75">(demo pivot)</span>}
            </button>

            {/* Orchestrate button */}
            <button
              onClick={handleOrchestrate}
              disabled={!canOrchestrate}
              className="px-8 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all"
              style={{
                backgroundColor: canOrchestrate ? 'var(--text-primary)' : 'var(--border)',
                color: canOrchestrate ? 'var(--bg)' : 'var(--text-muted)',
                cursor: canOrchestrate ? 'pointer' : 'not-allowed',
                letterSpacing: '0.08em',
              }}
            >
              {phase === 'tracing' ? 'Orchestrating…' : 'Orchestrate Arrival →'}
            </button>

            {phase === 'done' && (
              <button
                onClick={() => { setPhase('idle'); setResult(null); setLiveTrace([]); }}
                className="text-sm"
                style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                Reset
              </button>
            )}
          </div>
        )}

        {/* Error state */}
        {phase === 'error' && error && (
          <div className="mt-6 p-4 rounded-lg border text-sm" style={{ borderColor: 'var(--danger-border)', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
            Orchestration error: {error}
          </div>
        )}

        {/* Reasoning Trace */}
        {(phase === 'tracing' || phase === 'done') && liveTrace.length > 0 && (
          <ReasoningTrace steps={liveTrace} />
        )}

        {/* Four Artifact Panels */}
        {showArtifacts && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RoomSpecPanel roomSpec={result.roomSpec} className="panel-enter" style={{ animationDelay: '0ms' }} />
            <ItineraryPanel itinerary={result.itinerary} className="panel-enter" style={{ animationDelay: '80ms' }} />
            <HostAssignmentPanel assignment={result.hostAssignment} guestId={result.guestId} className="panel-enter" style={{ animationDelay: '160ms' }} />
            <HostBriefPanel hostBrief={result.hostBrief} className="panel-enter" style={{ animationDelay: '240ms' }} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t text-center" style={{ borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}>
        <p className="text-xs tracking-widest uppercase">GuestFlow · Hospitality 2030 Hackathon · Rosewood Sand Hill</p>
      </footer>
    </div>
  );
}
