import React from 'react';

export interface RosewoodProperty {
  id: string;
  name: string;
  location: string;
  region: string;
  timezone: string;
  country: string;
}

export const ROSEWOOD_PROPERTIES: RosewoodProperty[] = [
  {
    id: 'rsw-sandhill',
    name: 'Rosewood Sand Hill',
    location: 'Menlo Park, California',
    region: 'North America',
    timezone: 'America/Los_Angeles',
    country: 'USA',
  },
  {
    id: 'rsw-london',
    name: 'Rosewood London',
    location: 'London, England',
    region: 'Europe',
    timezone: 'Europe/London',
    country: 'United Kingdom',
  },
  {
    id: 'rsw-bangkok',
    name: 'Rosewood Bangkok',
    location: 'Bangkok, Thailand',
    region: 'Asia Pacific',
    timezone: 'Asia/Bangkok',
    country: 'Thailand',
  },
  {
    id: 'rsw-hongkong',
    name: 'Rosewood Hong Kong',
    location: 'Hong Kong',
    region: 'Asia Pacific',
    timezone: 'Asia/Hong_Kong',
    country: 'Hong Kong',
  },
  {
    id: 'rsw-beijing',
    name: 'Rosewood Beijing',
    location: 'Beijing, China',
    region: 'Asia Pacific',
    timezone: 'Asia/Shanghai',
    country: 'China',
  },
  {
    id: 'rsw-mexicocity',
    name: 'Rosewood Mexico City',
    location: 'Mexico City, Mexico',
    region: 'Latin America',
    timezone: 'America/Mexico_City',
    country: 'Mexico',
  },
  {
    id: 'rsw-kyoto',
    name: 'Rosewood Kyoto',
    location: 'Kyoto, Japan',
    region: 'Asia Pacific',
    timezone: 'Asia/Tokyo',
    country: 'Japan',
  },
  {
    id: 'rsw-dubai',
    name: 'Rosewood Dubai',
    location: 'Dubai, UAE',
    region: 'Middle East',
    timezone: 'Asia/Dubai',
    country: 'United Arab Emirates',
  },
  {
    id: 'rsw-sydney',
    name: 'Rosewood Sydney',
    location: 'Sydney, Australia',
    region: 'Asia Pacific',
    timezone: 'Australia/Sydney',
    country: 'Australia',
  },
  {
    id: 'rsw-paris',
    name: 'Rosewood Paris',
    location: 'Paris, France',
    region: 'Europe',
    timezone: 'Europe/Paris',
    country: 'France',
  },
];

interface PropertySelectorProps {
  selectedPropertyId: string;
  onSelect: (propertyId: string) => void;
  disabled?: boolean;
}

export default function PropertySelector({
  selectedPropertyId,
  onSelect,
  disabled,
}: PropertySelectorProps) {
  const selectedProperty = ROSEWOOD_PROPERTIES.find(p => p.id === selectedPropertyId);

  return (
    <div className="flex items-center gap-3">
      <label className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
        Property
      </label>
      <select
        value={selectedPropertyId}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled}
        className="px-4 py-2 rounded-lg border text-sm font-light"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface)',
          color: 'var(--text-primary)',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {ROSEWOOD_PROPERTIES.map(property => (
          <option key={property.id} value={property.id}>
            {property.name} — {property.location}
          </option>
        ))}
      </select>

      {selectedProperty && (
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--discovery-green)', fontWeight: '500' }}>
            {selectedProperty.region}
          </span>
          {' • '}
          <span>{selectedProperty.timezone}</span>
        </div>
      )}
    </div>
  );
}
