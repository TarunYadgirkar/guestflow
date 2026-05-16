import React from 'react';
import type { TraceStep } from '../../shared/types';

interface ReasoningTraceProps {
  steps: TraceStep[];
}

const STATUS_CONFIG = {
  pending: {
    dotColor: 'var(--border)',
    labelColor: 'var(--text-muted)',
  },
  running: {
    dotColor: 'var(--accent)',
    labelColor: 'var(--accent)',
  },
  complete: {
    dotColor: 'var(--accent)',
    labelColor: 'var(--text)',
  },
  pivoted: {
    dotColor: 'var(--accent)',
    labelColor: 'var(--accent)',
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
    <div>
      <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text)' }}>
        Processing Steps
      </h2>

      <div className="space-y-6">
        {steps.map((step, i) => {
          const cfg = STATUS_CONFIG[step.status];
          const isRunning = step.status === 'running';
          const isComplete = step.status === 'complete';
          const isLast = i === steps.length - 1;

          // Use realistic labels if available
          const displayLabel = i < REALISTIC_LABELS.length ? REALISTIC_LABELS[i] : step.label;

          return (
            <div key={i} className="flex gap-6">
              {/* Timeline dot + spine */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-3 h-3 rounded-full ${isRunning ? 'trace-running' : ''}`}
                  style={{ backgroundColor: cfg.dotColor }}
                >
                  {isRunning && (
                    <div className="trace-dot w-3 h-3 rounded-full" style={{ backgroundColor: cfg.dotColor }} />
                  )}
                </div>
                {!isLast && (
                  <div
                    className="w-px flex-1 mt-2"
                    style={{
                      backgroundColor: 'var(--border)',
                      minHeight: '32px',
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`pt-0.5 flex-1 ${isLast ? 'pb-0' : ''}`}>
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="text-sm font-light"
                    style={{ color: cfg.labelColor, fontFamily: 'var(--font-body)' }}
                  >
                    {displayLabel}
                  </span>
                  {isRunning && (
                    <span className="text-xs animate-pulse" style={{ color: 'var(--accent)' }}>
                      Processing…
                    </span>
                  )}
                  {isComplete && (
                    <span className="text-xs" style={{ color: 'var(--accent)' }}>
                      Complete
                    </span>
                  )}
                </div>
                {step.detail && step.status !== 'pending' && (
                  <p
                    className="text-xs"
                    style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}
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
  );
}
