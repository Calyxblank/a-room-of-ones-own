import React from 'react';
import type { DSTheme } from '../lib/design-system';

interface SectionLabelProps {
  dsTheme: DSTheme;
  label: string;
}

export default function SectionLabel({ dsTheme, label }: SectionLabelProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 8 }}>
      <div style={{ height: 1, flex: 1, background: dsTheme.glassBorder }} />
      <span style={{
        fontSize: '9px',
        fontFamily: '"Space Mono", monospace',
        color: dsTheme.textMuted,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <div style={{ height: 1, flex: 1, background: dsTheme.glassBorder }} />
    </div>
  );
}
