import React, { useState, useEffect, useRef } from 'react';
import type { OrchestrationResult, TraceStep } from '../shared/types';
import GuestSelector from './components/GuestSelector';
import ReasoningTrace from './components/ReasoningTrace';
import RoomSpecPanel from './components/panels/RoomSpecPanel';
import ItineraryPanel from './components/panels/ItineraryPanel';
import HostAssignmentPanel from './components/panels/HostAssignmentPanel';
import HostBriefPanel from './components/panels/HostBriefPanel';
import RosewoodLogo from './components/RosewoodLogo';
import PropertySelector from './components/PropertySelector';

type Phase = 'idle' | 'tracing' | 'done' | 'error';

const TRACE_STEP_INTERVAL_MS = 750;

export default function App() {
  const [selectedPropertyId, setSelectedPropertyId] = useState('rsw-sandhill');
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

  function handlePropertyChange(propertyId: string) {
    setSelectedPropertyId(propertyId);
    setSelectedGuestId(null);
    setPhase('idle');
    setResult(null);
    setLiveTrace([]);
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
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <header style={{ borderBottom: '2px solid var(--accent)', backgroundColor: '#FFFFFF' }} className="sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <RosewoodLogo size="small" />
            <div className="w-72">
              <PropertySelector
                selectedPropertyId={selectedPropertyId}
                onSelect={handlePropertyChange}
                disabled={phase === 'tracing'}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full px-8 py-8">
        {/* Top Section: Guest Selection + Controls */}
        <div className="mb-8">
          <GuestSelector
            selectedGuestId={selectedGuestId}
            onSelect={handleSelectGuest}
            propertyId={selectedPropertyId}
            disabled={phase === 'tracing'}
          />
        </div>

        {/* Controls */}
        {selectedGuestId && (
          <div className="mb-6 p-6" style={{ backgroundColor: '#F5F5F5', borderTop: '2px solid var(--accent)' }}>
            <div className="flex items-center gap-4">
              <button
                onClick={handleOrchestrate}
                disabled={!canOrchestrate}
                className="btn-primary text-sm py-2 px-6"
              >
                {phase === 'tracing' ? 'Generating…' : 'Generate Arrival Plan'}
              </button>
              {phase === 'done' && (
                <button
                  onClick={() => { setPhase('idle'); setResult(null); setLiveTrace([]); }}
                  className="btn-secondary text-sm"
                >
                  Reset
                </button>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={delayMinutes > 0}
                  onChange={(e) => setDelayMinutes(e.target.checked ? 240 : 0)}
                  disabled={phase === 'tracing'}
                />
                <span style={{ color: 'var(--text-muted)' }}>Delayed arrival</span>
              </label>
            </div>
          </div>
        )}

        {/* Error State */}
        {phase === 'error' && error && (
          <div className="mb-6 p-4" style={{ border: '2px solid var(--accent)', backgroundColor: '#FFF5F0' }}>
            <p className="font-bold text-sm" style={{ color: 'var(--accent)' }}>Error: {error}</p>
          </div>
        )}

        {/* Reasoning Trace - Compact */}
        {(phase === 'tracing' || phase === 'done') && liveTrace.length > 0 && (
          <div className="mb-6 p-6" style={{ backgroundColor: '#F5F5F5', borderTop: '2px solid var(--accent)' }}>
            <ReasoningTrace steps={liveTrace} />
          </div>
        )}

        {/* Result Artifacts - 2-Column Layout */}
        {showArtifacts && (
          <div className="grid grid-cols-2 gap-8">
            <div className="panel-enter" style={{ animationDelay: '0ms' }}>
              <RoomSpecPanel roomSpec={result.roomSpec} />
            </div>
            <div className="panel-enter" style={{ animationDelay: '100ms' }}>
              <ItineraryPanel itinerary={result.itinerary} />
            </div>
            <div className="panel-enter" style={{ animationDelay: '200ms' }}>
              <HostAssignmentPanel assignment={result.hostAssignment} guestId={result.guestId} />
            </div>
            <div className="panel-enter" style={{ animationDelay: '300ms' }}>
              <HostBriefPanel hostBrief={result.hostBrief} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', marginTop: '60px' }} className="py-8 text-center">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Rosewood Hotel Group Judge Presentation Dashboard
        </p>
      </footer>
    </div>
  );
}
