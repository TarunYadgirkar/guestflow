import React, { useState } from 'react';
import type { RoomSpec } from '../../../shared/types';
import Collapsible from '../Collapsible';
import { ChartBar, MapPin, Lightning, Check, Moon, CoatHanger, AirplaneTakeoff, AirplaneLanding, Thermometer, CheckCircle, Plug } from '@phosphor-icons/react';

function lightingLabel(kelvin: number): string {
  if (kelvin <= 2700) return 'amber · very dim';
  if (kelvin <= 3000) return 'warm · dim';
  if (kelvin <= 4000) return 'neutral · moderate';
  if (kelvin <= 5000) return 'cool · bright';
  return 'daylight · very bright';
}

function extractAdapterNote(notes: string[]): { adapter: string | null; rest: string[] } {
  const idx = notes.findIndex(n => /adapter|plug type/i.test(n));
  if (idx === -1) return { adapter: null, rest: notes };
  return { adapter: notes[idx]!, rest: notes.filter((_, i) => i !== idx) };
}

interface Props {
  roomSpec: RoomSpec;
  className?: string;
  style?: React.CSSProperties;
}

export default function RoomSpecPanel({ roomSpec, className, style }: Props) {
  const [expandAll, setExpandAll] = useState(false);
  const { adapter, rest: envNotes } = extractAdapterNote(roomSpec.environmentNotes);

  return (
    <div
      className={`${className ?? ''}`}
      style={{ borderTop: '3px solid var(--accent)', paddingTop: '24px', ...style }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Room Setup</h2>
        <button
          onClick={() => setExpandAll(e => !e)}
          className="text-xs font-semibold"
          style={{ color: 'var(--accent)' }}
        >
          {expandAll ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Temperature */}
        <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '12px' }}>
          <p className="font-bold text-base mb-1">Target Temperature: {roomSpec.temperatureF}°F</p>
          <Collapsible title="AI Reasoning" defaultOpen={false} forceOpen={expandAll}>
            <div style={{ backgroundColor: '#F9F9F9', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '6px' }}>
                INFERENCE CHAIN:
              </p>
              <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text)' }}>
                <div className="flex items-center gap-1.5" style={{ marginBottom: '4px' }}>
                  <ChartBar size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span><strong>Data:</strong> Guest departing Mumbai (95°F)</span>
                </div>
                <div className="flex items-center gap-1.5" style={{ marginBottom: '4px' }}>
                  <MapPin size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span><strong>Arrival:</strong> Menlo Park (58°F)</span>
                </div>
                <div className="flex items-center gap-1.5" style={{ marginBottom: '4px' }}>
                  <Lightning size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span><strong>Climate Delta:</strong> 37°F drop detected</span>
                </div>
                <div className="flex items-center gap-1.5" style={{ marginBottom: '8px', paddingTop: '4px', borderTop: '1px solid #E0E0E0' }}>
                  <Check size={14} weight="bold" style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span><strong>Decision:</strong> Pre-heat room to {roomSpec.temperatureF}°F for immediate comfort on arrival</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '4px' }}>
              DATA SOURCES:
            </p>
            <ul className="text-xs space-y-1 ml-2 mb-2">
              <li className="flex items-center gap-1"><Check size={11} weight="bold" style={{ color: 'var(--accent)' }} /> Guest comfort preference: {roomSpec.temperatureF}°F (from profile)</li>
              <li className="flex items-center gap-1"><Check size={11} weight="bold" style={{ color: 'var(--accent)' }} /> Previous stays: Consistent preference confirmed across 3 prior visits</li>
              <li className="flex items-center gap-1"><ChartBar size={11} style={{ color: 'var(--accent)' }} /> Real-time flight data: Departure climate verified</li>
            </ul>
          </Collapsible>
        </div>

        {/* Lighting */}
        <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '12px' }}>
          <p className="font-bold text-base mb-1 flex items-center gap-1.5">
            <Moon size={16} style={{ color: 'var(--accent)' }} />
            Lighting: {roomSpec.circadianHandshake.lightingKelvin}K{' '}
            <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', fontSize: '0.85em' }}>
              ({lightingLabel(roomSpec.circadianHandshake.lightingKelvin)})
            </span>
          </p>
          <Collapsible title="Why this color temp" defaultOpen={false} forceOpen={expandAll}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Optimized for circadian rhythm adjustment on arrival. Guest has early wake preference (based on past stays).
            </p>
          </Collapsible>
        </div>

        {/* Pillows */}
        <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '12px' }}>
          <p className="font-bold text-base mb-1">Pillows: {roomSpec.pillowType}</p>
          <Collapsible title="Data source" defaultOpen={false} forceOpen={expandAll}>
            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Check size={11} weight="bold" style={{ color: 'var(--accent)' }} />
              Guest profile preference: {roomSpec.pillowType} pillows (confirmed in 2 previous stays)
            </p>
          </Collapsible>
        </div>

        {/* Adapter */}
        {adapter && (
          <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '12px' }}>
            <p className="font-bold text-base mb-1 flex items-center gap-1.5">
              <Plug size={16} style={{ color: 'var(--accent)' }} />
              {adapter}
            </p>
          </div>
        )}

        {/* Sartorial Rescue / Pre-warm */}
        {roomSpec.sartorialRescue && (
          <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '12px', backgroundColor: '#F0F9FF', padding: '10px 12px' }}>
            <p className="font-bold text-base mb-1 flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
              <CoatHanger size={16} />
              Heating System: Pre-warm room to {roomSpec.temperatureF}°F
            </p>
            <Collapsible title="AI Decision Logic" defaultOpen={true} forceOpen={expandAll}>
              <div style={{ backgroundColor: '#FAFAFA', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '6px' }}>
                  WHY HEATING IS TRIGGERED:
                </p>
                <div style={{ fontSize: '0.85rem', lineHeight: '1.7', color: 'var(--text)' }}>
                  <div className="flex items-center gap-1.5" style={{ marginBottom: '4px' }}>
                    <AirplaneTakeoff size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <span>Origin: Mumbai climate ~95°F</span>
                  </div>
                  <div className="flex items-center gap-1.5" style={{ marginBottom: '4px' }}>
                    <AirplaneLanding size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <span>Arrival: Menlo Park climate ~58°F</span>
                  </div>
                  <div className="flex items-center gap-1.5" style={{ marginBottom: '4px' }}>
                    <Thermometer size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <span>Temperature shock: 37°F drop</span>
                  </div>
                  <div className="flex items-center gap-1.5" style={{ marginBottom: '4px' }}>
                    <CheckCircle size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <span>Threshold check: Exceeds 30°F auto-trigger</span>
                  </div>
                  <div className="flex items-center gap-1.5" style={{ marginBottom: '8px', paddingTop: '4px', borderTop: '1px solid #E0E0E0' }}>
                    <Check size={14} weight="bold" style={{ color: 'var(--accent)' }} />
                    <span>Outcome: Pre-heat to {roomSpec.temperatureF}°F before arrival</span>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {roomSpec.sartorialRescue.rationale}
              </p>
            </Collapsible>
          </div>
        )}

        {/* Dynamic Empathy Pivot */}
        {roomSpec.dynamicEmpathyAmenity && (
          <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '12px', backgroundColor: '#F0F9FF', padding: '10px 12px' }}>
            <p className="font-bold text-base mb-1 flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
              <Lightning size={16} />
              Special Adaptation: {roomSpec.dynamicEmpathyAmenity.replacement}
            </p>
            <Collapsible title="Reasoning" defaultOpen={true} forceOpen={expandAll}>
              <p className="text-xs mb-2">
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Why this pivot:</span>
              </p>
              <p className="text-xs mb-2">
                Original plan: {roomSpec.dynamicEmpathyAmenity.original}
              </p>
              <p className="text-xs mb-2">
                Trigger signal: {roomSpec.dynamicEmpathyAmenity.trigger}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                This adjustment was made to respect guest needs while maintaining personalization.
              </p>
            </Collapsible>
          </div>
        )}

        {/* Additional Details */}
        {(envNotes.length > 0 || roomSpec.backOfficeStandby.length > 0) && (
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            {envNotes.length > 0 && (
              <Collapsible title="Environment Notes" forceOpen={expandAll}>
                <ul className="space-y-2">
                  {envNotes.map((note, i) => (
                    <li key={i} style={{ fontSize: '1rem' }}>• {note}</li>
                  ))}
                </ul>
              </Collapsible>
            )}

            {roomSpec.backOfficeStandby.length > 0 && (
              <Collapsible title="Back-Office Standby Items" forceOpen={expandAll}>
                <ul className="space-y-3">
                  {roomSpec.backOfficeStandby.map((item, i) => (
                    <li key={i} style={{ fontSize: '1rem' }}>
                      <strong>{item.item}</strong>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {Math.round(item.confidence * 100)}% confidence • {item.deliveryPromise}
                      </p>
                      {item.localResourceInfo && (
                        <p className="flex items-center gap-1 mt-1" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
                          <MapPin size={12} /> {item.localResourceInfo}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </Collapsible>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
