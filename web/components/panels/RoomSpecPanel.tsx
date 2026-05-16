import React from 'react';
import type { RoomSpec } from '../../../shared/types';

interface Props {
  roomSpec: RoomSpec;
  className?: string;
  style?: React.CSSProperties;
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="confidence-bar w-full mt-1">
      <div className="confidence-fill" style={{ width: `${value * 100}%` }} />
    </div>
  );
}

export default function RoomSpecPanel({ roomSpec, className, style }: Props) {
  return (
    <div
      className={`rounded-xl border overflow-hidden ${className ?? ''}`}
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', ...style }}
    >
      {/* Panel header */}
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-light)' }}>
        <div>
          <h3 className="font-serif text-xl font-light">Room & Amenity Spec</h3>
          <p className="text-xs tracking-widest uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>Artifact 1</p>
        </div>
        <div className="text-right">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Confidence</span>
          <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>{Math.round(roomSpec.confidence * 100)}%</p>
          <ConfidenceBar value={roomSpec.confidence} />
        </div>
      </div>

      <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: '520px' }}>

        {/* Circadian Handshake — always prominent */}
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🌙</span>
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
              Circadian Handshake
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
              Auto-applied
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Lighting</p>
              <p className="font-medium">{roomSpec.circadianHandshake.lightingKelvin}K</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Temperature</p>
              <p className="font-medium">{roomSpec.circadianHandshake.temperatureF}°F</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Blackout</p>
              <p className="font-medium">{roomSpec.circadianHandshake.blackoutBlinds ? 'Engaged' : 'Open'}</p>
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{roomSpec.circadianHandshake.rationale}</p>
        </div>

        {/* Dynamic Empathy Amenity (if pivot occurred) */}
        {roomSpec.dynamicEmpathyAmenity && (
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: 'var(--pivot-bg)', border: '1px solid var(--pivot-border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">⚡</span>
              <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--pivot)' }}>
                Dynamic Empathy Pivot
              </span>
            </div>
            <div className="text-sm space-y-1">
              <p><span style={{ color: 'var(--text-muted)' }}>Was: </span>
                <span className="line-through" style={{ color: 'var(--text-secondary)' }}>{roomSpec.dynamicEmpathyAmenity.original}</span>
              </p>
              <p><span style={{ color: 'var(--text-muted)' }}>Now: </span>
                <span className="font-medium">{roomSpec.dynamicEmpathyAmenity.replacement}</span>
              </p>
              <p className="text-xs pt-1" style={{ color: 'var(--text-secondary)' }}>
                Trigger: {roomSpec.dynamicEmpathyAmenity.trigger}
              </p>
            </div>
          </div>
        )}

        {/* Welcome Amenity (when no pivot) */}
        {!roomSpec.dynamicEmpathyAmenity && (
          <div>
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Welcome Amenity</p>
            <p className="text-sm font-medium">{roomSpec.welcomeAmenity.item}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{roomSpec.welcomeAmenity.rationale}</p>
          </div>
        )}

        {/* Room baseline */}
        <div>
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Room Baseline</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            <div><span style={{ color: 'var(--text-secondary)' }}>Temperature: </span>{roomSpec.temperatureF}°F</div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Pillows: </span>{roomSpec.pillowType}</div>
          </div>
        </div>

        {/* Environment notes */}
        {roomSpec.environmentNotes.length > 0 && (
          <div>
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Environment Notes</p>
            <ul className="text-sm space-y-1">
              {roomSpec.environmentNotes.map((note, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: 'var(--accent)' }}>–</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sartorial Rescue */}
        {roomSpec.sartorialRescue && (
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-light)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🧥</span>
              <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
                Sartorial Rescue
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: roomSpec.sartorialRescue.status === 'auto' ? 'var(--success-bg)' : 'var(--pivot-bg)',
                  color: roomSpec.sartorialRescue.status === 'auto' ? 'var(--success)' : 'var(--pivot)',
                }}
              >
                {roomSpec.sartorialRescue.status === 'auto' ? 'Auto-staged' : 'Staff review'}
              </span>
            </div>
            <p className="text-sm">{roomSpec.sartorialRescue.items.join(', ')}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {roomSpec.sartorialRescue.climateDeltaF}°F drop · {roomSpec.sartorialRescue.rationale}
            </p>
          </div>
        )}

        {/* Back-Office Standby */}
        {roomSpec.backOfficeStandby.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                Back-Office Standby
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#FEF9C3', color: '#713F12', border: '1px solid #FDE047' }}>
                Not placed in room
              </span>
            </div>
            {roomSpec.backOfficeStandby.map((item, i) => (
              <div
                key={i}
                className="rounded-lg p-4 mt-2"
                style={{ border: '1px dashed var(--border)', backgroundColor: 'var(--surface-alt)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{item.item}</p>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  >
                    {Math.round(item.confidence * 100)}% confidence
                  </span>
                </div>
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {item.inferenceSource}
                </p>
                <div className="mt-2 text-xs space-y-0.5">
                  <p style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Room clearance: </span>{item.roomClearanceNote}
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Delivery: </span>{item.deliveryPromise}
                  </p>
                  {item.localResourceInfo && (
                    <p style={{ color: 'var(--accent)' }}>📍 {item.localResourceInfo}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Minibar */}
        <div>
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Minibar</p>
          <div className="flex flex-wrap gap-1.5">
            {roomSpec.minibar.map((item, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'var(--surface-alt)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
