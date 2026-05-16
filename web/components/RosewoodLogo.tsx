import React from 'react';

interface RosewoodLogoProps {
  size?: 'small' | 'medium';
  className?: string;
}

export default function RosewoodLogo({ size = 'medium', className }: RosewoodLogoProps) {
  const fontSize = size === 'small' ? '18px' : '24px';

  return (
    <div className={className}>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: fontSize,
          fontWeight: 300,
          letterSpacing: '0.12em',
          color: 'var(--text)',
          margin: 0,
          lineHeight: 1,
          textTransform: 'uppercase',
        }}
      >
        Rosewood
      </h2>
    </div>
  );
}
