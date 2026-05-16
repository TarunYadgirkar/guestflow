import React, { useState, useEffect, useRef } from 'react';
import type { OrchestrationResult, TraceStep } from '../shared/types';
import GuestSelector from './components/GuestSelector';
import ReasoningTrace from './components/ReasoningTrace';
import RoomSpecPanel from './components/panels/RoomSpecPanel';
import ItineraryPanel from './components/panels/ItineraryPanel';
import HostAssignmentPanel from './components/panels/HostAssignmentPanel';
import HostBriefPanel from './components/panels/HostBriefPanel';
import RosewoodLogo from './components/RosewoodLogo';

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
        <div className="max-w-7xl mx-auto px-8 py-8 flex items-center justify-between">
          {/* Logo on left */}
          <div>
            <RosewoodLogo size="small" />
          </div>

          {/* Property info on right */}
          <div className="text-right">
            <p className="font-light text-sm" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
              Rosewood Sand Hill
            </p>
            <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
              Operations Dashboard
            </p>
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

        {/* Arrival plan controls */}
        {selectedGuestId && (
          <div className="mt-8 space-y-5">
            {/* Settings row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Flight status */}
              <div>
                <label className="text-xs tracking-widest uppercase mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                  Flight status
                </label>
                <select
                  onChange={(e) => setDelayMinutes(e.target.value === 'delayed' ? 240 : 0)}
                  disabled={phase === 'tracing'}
                  className="w-full text-sm px-3 py-2 rounded-lg border"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="ontime">On-time</option>
                  <option value="delayed">Delayed 4+ hours</option>
                </select>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {delayMinutes > 0 ? 'Testing: late arrival' : 'Standard protocol'}
                </p>
              </div>

              {/* Room readiness */}
              <div>
                <label className="text-xs tracking-widest uppercase mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                  Room readiness
                </label>
                <select
                  disabled={phase === 'tracing'}
                  className="w-full text-sm px-3 py-2 rounded-lg border"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option>Clean & ready</option>
                  <option>Being cleaned</option>
                  <option>Not ready</option>
                </select>
              </div>

              {/* Trip purpose confirmation */}
              <div>
                <label className="text-xs tracking-widest uppercase mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                  Trip purpose
                </label>
                <select
                  disabled={phase === 'tracing'}
                  className="w-full text-sm px-3 py-2 rounded-lg border"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option>Anniversary – 9 yrs</option>
                  <option>Business – conference</option>
                  <option>Family vacation</option>
                  <option>Wellness retreat</option>
                </select>
              </div>

              {/* Testing checkbox */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={delayMinutes > 0}
                    onChange={(e) => setDelayMinutes(e.target.checked ? 240 : 0)}
                    disabled={phase === 'tracing'}
                    style={{ cursor: phase === 'tracing' ? 'not-allowed' : 'pointer' }}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>Internal testing mode</span>
                </label>
              </div>
            </div>

            {/* Generate plan button + reset */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleOrchestrate}
                disabled={!canOrchestrate}
                className="px-8 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all"
                style={{
                  backgroundColor: canOrchestrate ? 'var(--discovery-green)' : 'var(--border)',
                  color: canOrchestrate ? '#FFFFFF' : 'var(--text-muted)',
                  cursor: canOrchestrate ? 'pointer' : 'not-allowed',
                  letterSpacing: '0.08em',
                }}
              >
                {phase === 'tracing' ? 'Generating plan…' : 'Generate Arrival Plan →'}
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
