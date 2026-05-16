import React from 'react';

export interface RosewoodProperty {
  id: string;
  name: string;
  location: string;
  region: string;
  timezone: string;
  country: string;
  comingSoon?: boolean;
  openYear?: number;
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
    id: 'rsw-miyakojima',
    name: 'Rosewood Miyakojima',
    location: 'Miyako Island, Okinawa, Japan',
    region: 'Asia Pacific',
    timezone: 'Asia/Tokyo',
    country: 'Japan',
  },
  {
    id: 'rsw-paris',
    name: 'Hôtel de Crillon, A Rosewood Hotel',
    location: 'Paris, France',
    region: 'Europe',
    timezone: 'Europe/Paris',
    country: 'France',
  },
  {
    id: 'rsw-mexicocity',
    name: 'Rosewood Mexico City',
    location: 'Mexico City, Mexico',
    region: 'Latin America',
    timezone: 'America/Mexico_City',
    country: 'Mexico',
    comingSoon: true,
    openYear: 2027,
  },
  {
    id: 'rsw-dubai',
    name: 'Rosewood Dubai',
    location: 'Dubai, UAE',
    region: 'Middle East',
    timezone: 'Asia/Dubai',
    country: 'United Arab Emirates',
    comingSoon: true,
    openYear: 2029,
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
    <div className="flex flex-col gap-2">
      <label className="label" style={{ color: 'var(--text-muted)' }}>
        Select Property
      </label>
      <select
        value={selectedPropertyId}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled}
        className="w-full text-sm"
        style={{
          backgroundColor: 'transparent',
          color: 'var(--text)',
          borderBottom: '1px solid var(--border)',
          borderRadius: 0,
          padding: '12px 0',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {ROSEWOOD_PROPERTIES.map(property => (
          <option key={property.id} value={property.id}>
            {property.name}{property.comingSoon ? ` (Coming ${property.openYear})` : ''} — {property.location}
          </option>
        ))}
      </select>

      {selectedProperty && (
        <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--accent)' }}>
            {selectedProperty.region}
          </span>
          {' • '}
          <span>{selectedProperty.timezone}</span>
        </div>
      )}
    </div>
  );
}
