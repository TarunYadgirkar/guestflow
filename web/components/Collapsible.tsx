import React, { useState } from 'react';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function Collapsible({ title, children, defaultOpen = false }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 w-full text-left font-semibold py-1 text-sm"
        style={{ color: 'var(--text)' }}
      >
        <span style={{ fontSize: '0.9rem', width: '18px' }}>
          {isOpen ? '▼' : '▶'}
        </span>
        <span>{title}</span>
      </button>
      {isOpen && (
        <div className="ml-5 pt-1 pb-2" style={{ color: 'var(--text-muted)' }}>
          {children}
        </div>
      )}
    </div>
  );
}
