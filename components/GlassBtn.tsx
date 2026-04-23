'use client';
import React, { useState } from 'react';
import type { DSTheme } from '../lib/design-system';

export type GlassBtnSize = 'sm' | 'md' | 'lg';

const SIZES: Record<GlassBtnSize, { px: number; py: number; fs: string }> = {
  sm: { px: 12, py: 5,  fs: '10px' },
  md: { px: 18, py: 9,  fs: '11px' },
  lg: { px: 28, py: 13, fs: '13px' },
};

interface GlassBtnProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  size?: GlassBtnSize;
  dsTheme: DSTheme;
  style?: React.CSSProperties;
}

export default function GlassBtn({
  size = 'md',
  dsTheme,
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: GlassBtnProps) {
  const [hovered, setHovered] = useState(false);
  const s = SIZES[size];

  return (
    <button
      onMouseEnter={(e) => { setHovered(true); onMouseEnter?.(e); }}
      onMouseLeave={(e) => { setHovered(false); onMouseLeave?.(e); }}
      style={{
        fontFamily: '"Space Mono", monospace',
        fontSize: s.fs,
        fontWeight: 700,
        padding: `${s.py}px ${s.px}px`,
        background: hovered ? dsTheme.glass : 'rgba(255,255,255,0.08)',
        color: dsTheme.text,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: `1px solid ${dsTheme.glassBorder}`,
        borderRadius: 20,
        cursor: 'pointer',
        letterSpacing: '0.06em',
        transition: 'all 0.15s',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
