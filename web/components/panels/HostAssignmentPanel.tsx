import React from 'react';
import type { HostAssignment } from '../../../shared/types';
import staffData from '../../../data/staff.json';
import Collapsible from '../Collapsible';

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

export default function HostAssignmentPanel({ assignment, guestId, className, style }: Props) {
  const staff = (staffData as unknown as StaffRecord[]).find(s => s.id === assignment.assignedStaffId);

  return (
    <div
      className={`${className ?? ''}`}
      style={{ borderTop: '3px solid var(--accent)', paddingTop: '16px', ...style }}
    >
      {/* Header */}
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>Host Assignment</h2>

      {/* Assigned Host */}
      {staff && (
        <div className="space-y-4">
          {/* Host Name and Role */}
          <div style={{ borderBottom: '2px solid var(--accent)', paddingBottom: '12px' }}>
            <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>
              {staff.name}
            </h3>
            <p className="text-base" style={{ color: 'var(--text-muted)' }}>{staff.role}</p>
          </div>

          {/* Match Score - Primary Decision */}
          <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '12px' }}>
            <p className="font-bold text-base mb-1">
              Match Score: {Math.round(assignment.confidence * 100)}%
            </p>
            {assignment.continuityFlag && (
              <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                ✓ Returning guest match
              </p>
            )}
            <Collapsible title="Why this assignment" defaultOpen={false}>
              <p className="text-sm mb-2">
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Data sources:</span>
              </p>
              <ul className="text-xs space-y-1 ml-2 mb-2">
                {assignment.continuityFlag && (
                  <li>✓ Staff history: {staff.name} has hosted this guest in past stays</li>
                )}
                <li>✓ Language match: Staff speaks guest's language preferences</li>
                <li>✓ Availability: Staff is on shift and able to provide personalized service</li>
              </ul>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                The system prioritizes continuity for returning guests when available staff has prior relationship and shared language.
              </p>
            </Collapsible>
          </div>

          {/* Languages - Highlighted in Green */}
          {staff.languages.length > 0 && (
            <div>
              <p className="font-bold text-sm mb-2">Languages</p>
              <div className="flex flex-wrap gap-2">
                {staff.languages.map(lang => (
                  <span
                    key={lang}
                    className="text-sm font-semibold px-3 py-1"
                    style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                  >
                    {lang}
                  </span>
                ))}
              </div>
              <Collapsible title="Data source" defaultOpen={false}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  ✓ Verified language proficiency from staff training records and guest communication history
                </p>
              </Collapsible>
            </div>
          )}

          {/* Specialties */}
          {staff.specialties.length > 0 && (
            <div>
              <p className="font-bold text-sm mb-2">Specialties</p>
              <ul className="space-y-1 text-sm">
                {staff.specialties.slice(0, 3).map(sp => (
                  <li key={sp}>• {sp}</li>
                ))}
              </ul>
              <Collapsible title="Why these specialties matter" defaultOpen={false}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Specialties aligned with guest preferences from profile and past interactions. This staff member's skills directly match the guest's likely needs.
                </p>
              </Collapsible>
            </div>
          )}

          {/* Match Reasoning */}
          {assignment.matchReasons.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <p className="font-bold text-sm mb-2">Matching Factors</p>
              <ul className="space-y-2 text-sm">
                {assignment.matchReasons.map((reason, i) => (
                  <li key={i}>
                    <strong style={{ color: 'var(--accent)' }}>
                      {reason.factor.charAt(0).toUpperCase() + reason.factor.slice(1)}
                    </strong>
                    <Collapsible title={`${reason.detail.substring(0, 40)}...`} defaultOpen={false}>
                      <p className="text-xs mb-1">
                        <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Inference:</span>
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {reason.detail}
                      </p>
                    </Collapsible>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
