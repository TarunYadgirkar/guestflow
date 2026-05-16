import React from 'react';

interface RosewoodLogoProps {
  size?: 'small' | 'medium';
  className?: string;
}

export default function RosewoodLogo({ size = 'medium', className }: RosewoodLogoProps) {
  const height = size === 'small' ? '32px' : '48px';

  return (
    <div className={className}>
      <img
        src="https://upload.wikimedia.org/wikipedia/en/thumb/9/91/Rosewood_Hotel_Group.svg/1280px-Rosewood_Hotel_Group.svg.png"
        alt="Rosewood Hotels & Resorts"
        style={{
          height: height,
          width: 'auto',
          objectFit: 'contain',
          opacity: 0.95,
        }}
      />
    </div>
  );
}
