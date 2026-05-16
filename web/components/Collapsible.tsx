import React, { useState } from 'react';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean;
}

export default function Collapsible({ title, children, defaultOpen = false, forceOpen }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const effectiveOpen = forceOpen !== undefined ? forceOpen : isOpen;

  return (
    <div>
      <button
        onClick={() => setIsOpen(!effectiveOpen)}
        className="flex items-center gap-1 w-full text-left font-semibold py-1 text-sm"
        style={{ color: 'var(--text)' }}
      >
        <span style={{ fontSize: '0.9rem', width: '18px' }}>
          {effectiveOpen ? '▼' : '▶'}
        </span>
        <span>{title}</span>
      </button>
      {effectiveOpen && (
        <div className="ml-5 pt-1 pb-2" style={{ color: 'var(--text-muted)' }}>
          {children}
        </div>
      )}
    </div>
  );
}
