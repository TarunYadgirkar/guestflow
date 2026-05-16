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
        <p className="text-xs tracking-widest uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>Guest Experience Host</p>
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

            {/* Match quality */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className="text-xs px-3 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: assignment.confidence > 0.85 ? 'var(--success-bg)' : 'var(--surface-alt)',
                  color: assignment.confidence > 0.85 ? 'var(--discovery-green)' : 'var(--discovery-green)',
                }}
              >
                {assignment.confidence > 0.85 ? '✓ Strong match' : '○ Good fit'}
              </span>
            </div>
          </div>
        )}

        {/* Match reasoning */}
        <div>
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>Why Maria</p>
          <div className="space-y-2.5">
            {assignment.matchReasons.map((reason, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-lg flex-shrink-0">{FACTOR_ICONS[reason.factor] ?? '·'}</span>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{reason.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
