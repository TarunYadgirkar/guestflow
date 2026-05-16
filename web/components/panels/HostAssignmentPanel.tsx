import React from 'react';
import type { HostAssignment } from '../../../shared/types';
import staffData from '../../../data/staff.json';

interface StaffRecord {
  id: string;
  name: string;
  role: string;
  languages: string[];
  specialties: string[];
  pastGuestIds: string[];
  onShift: boolean;
}

interface Props {
  assignment: HostAssignment;
  guestId: string;
  className?: string;
  style?: React.CSSProperties;
}

const FACTOR_ICONS: Record<string, string> = {
  continuity: '🔁',
  language: '🗣',
  affinity: '✦',
  availability: '✓',
};

export default function HostAssignmentPanel({ assignment, guestId, className, style }: Props) {
  const staff = (staffData as unknown as StaffRecord[]).find(s => s.id === assignment.assignedStaffId);

  return (
    <div
      className={`rounded-xl border overflow-hidden ${className ?? ''}`}
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', ...style }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
        <h3 className="font-serif text-xl font-light">Host Assignment</h3>
        <p className="text-xs tracking-widest uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>Artifact 3</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Assigned host */}
        {staff && (
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-light)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-serif text-2xl font-light">{staff.name}</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{staff.role}</p>
              </div>
              {assignment.continuityFlag && (
                <div
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid #BBF7D0' }}
                >
                  Continuity Match
                </div>
              )}
            </div>

            {/* Languages */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {staff.languages.map(lang => (
                <span
                  key={lang}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  {lang}
                </span>
              ))}
            </div>

            {/* Specialties */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {staff.specialties.slice(0, 3).map(sp => (
                <span
                  key={sp}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(156,125,90,0.1)', color: 'var(--accent)', border: '1px solid rgba(156,125,90,0.2)' }}
                >
                  {sp}
                </span>
              ))}
            </div>

            {/* Confidence bar */}
            <div className="mt-4 flex items-center gap-3">
              <div className="confidence-bar flex-1">
                <div className="confidence-fill" style={{ width: `${assignment.confidence * 100}%` }} />
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                {Math.round(assignment.confidence * 100)}% match
              </span>
            </div>
          </div>
        )}

        {/* Match reasons */}
        <div>
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>Match Reasoning</p>
          <div className="space-y-3">
            {assignment.matchReasons.map((reason, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-base flex-shrink-0 mt-0.5">{FACTOR_ICONS[reason.factor] ?? '·'}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-medium tracking-wide uppercase"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {reason.factor}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      weight {reason.weight}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{reason.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
