import React from 'react';
import type { TraceStep } from '../../shared/types';

interface ReasoningTraceProps {
  steps: TraceStep[];
}

const STATUS_CONFIG = {
  pending: {
    dotColor: 'var(--border)',
    labelColor: 'var(--text-muted)',
    badge: null,
  },
  running: {
    dotColor: 'var(--accent)',
    labelColor: 'var(--text-primary)',
    badge: null,
  },
  complete: {
    dotColor: 'var(--success)',
    labelColor: 'var(--text-primary)',
    badge: null,
  },
  pivoted: {
    dotColor: '#EA580C',
    labelColor: 'var(--pivot)',
    badge: 'CHANGED',
  },
};

// Realistic Rosewood operational steps
const REALISTIC_LABELS = [
  'Pulling stay history & preferences',
  'Checking reservation & Elite advisor notes',
  'Verifying flight arrival & ETA',
  'Assigning host & availability',
  'Generating room setup protocol',
  'Preparing host brief & service notes',
];

export default function ReasoningTrace({ steps }: ReasoningTraceProps) {
  return (
    <section className="mt-10">
      <h2
        className="text-xs tracking-[0.2em] uppercase mb-5 font-sans"
        style={{ color: 'var(--text-muted)' }}
      >
        Arrival Preparation Process
      </h2>

      <div
        className="rounded-xl border p-6"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <div className="space-y-0">
          {steps.map((step, i) => {
            const cfg = STATUS_CONFIG[step.status];
            const isRunning = step.status === 'running';
            const isLast = i === steps.length - 1;

            // Use realistic labels if available
            const displayLabel = i < REALISTIC_LABELS.length ? REALISTIC_LABELS[i] : step.label;

            return (
              <div key={i} className="flex gap-4">
                {/* Timeline spine */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${isRunning ? 'trace-running' : ''}`}
                    style={{ backgroundColor: cfg.dotColor }}
                  >
                    {isRunning && (
                      <div className="trace-dot w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.dotColor }} />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className="w-px flex-1 mt-1 mb-1"
                      style={{
                        backgroundColor: 'var(--border-light)',
                        minHeight: '20px',
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={`pb-4 flex-1 ${isLast ? 'pb-0' : ''}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-sm font-medium"
                      style={{ color: cfg.labelColor }}
                    >
                      {displayLabel}
                    </span>
                    {cfg.badge && (
                      <span
                        className="text-xs px-2 py-0.5 rounded font-medium tracking-wide"
                        style={{
                          backgroundColor: 'var(--pivot-bg)',
                          color: 'var(--pivot)',
                          border: '1px solid var(--pivot-border)',
                        }}
                      >
                        {cfg.badge}
                      </span>
                    )}
                    {isRunning && (
                      <span className="text-xs" style={{ color: 'var(--accent)' }}>
                        …
                      </span>
                    )}
                  </div>
                  {step.detail && step.status !== 'pending' && (
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {step.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
