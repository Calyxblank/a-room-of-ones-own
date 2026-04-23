import React from 'react';
import type { DSTheme } from '../lib/design-system';

interface GlassPanelProps {
  dsTheme: DSTheme;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function GlassPanel({ dsTheme, children, style }: GlassPanelProps) {
  return (
    <div
      style={{
        background: dsTheme.glass,
        backdropFilter: dsTheme.blur,
        WebkitBackdropFilter: dsTheme.blur,
        border: `1px solid ${dsTheme.glassBorder}`,
        borderRadius: 12,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
