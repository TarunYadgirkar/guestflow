import React from 'react';

interface RosewoodLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function RosewoodLogo({ size = 'medium', className }: RosewoodLogoProps) {
  const sizeConfig = {
    small: {
      topSize: 24,
      bottomSize: 8,
      dividerWidth: 80,
      spacing: 16,
    },
    medium: {
      topSize: 40,
      bottomSize: 11,
      dividerWidth: 140,
      spacing: 24,
    },
    large: {
      topSize: 56,
      bottomSize: 14,
      dividerWidth: 200,
      spacing: 32,
    },
  };

  const config = sizeConfig[size];
  const navyColor = '#0D1B2A';

  return (
    <div className={`flex flex-col items-center justify-center ${className || ''}`}>
      {/* Top line: ROSEWOOD */}
      <div style={{ marginBottom: config.spacing / 2 }}>
        <h1
          style={{
            fontFamily: 'Austin Light, system-ui, sans-serif',
            fontSize: `${config.topSize}px`,
            fontWeight: 300,
            letterSpacing: '0.15em',
            color: navyColor,
            margin: 0,
            lineHeight: 1,
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          ROSEWOOD
        </h1>
      </div>

      {/* Divider */}
      <div
        style={{
          width: `${config.dividerWidth}px`,
          height: '1px',
          backgroundColor: navyColor,
          marginBottom: config.spacing / 2,
        }}
      />

      {/* Bottom line: HOTEL GROUP with wide tracking */}
      <div>
        <p
          style={{
            fontFamily: 'Austin Light, system-ui, sans-serif',
            fontSize: `${config.bottomSize}px`,
            fontWeight: 300,
            letterSpacing: '0.3em',
            color: navyColor,
            margin: 0,
            lineHeight: 1,
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          H O T E L &nbsp; G R O U P
        </p>
      </div>
    </div>
  );
}
