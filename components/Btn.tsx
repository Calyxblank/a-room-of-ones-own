'use client';
import React, { useState } from 'react';
import type { DSTheme } from '../lib/design-system';

export type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type BtnSize = 'sm' | 'md' | 'lg';

const SIZES: Record<BtnSize, { px: number; py: number; fs: string }> = {
  sm: { px: 10, py: 4,  fs: '10px' },
  md: { px: 16, py: 7,  fs: '11px' },
  lg: { px: 24, py: 11, fs: '13px' },
};

interface BtnProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: BtnVariant;
  size?: BtnSize;
  dsTheme: DSTheme;
  style?: React.CSSProperties;
}

export default function Btn({
  variant = 'secondary',
  size = 'md',
  dsTheme,
  disabled,
  children,
  style,
  onMouseDown,
  onMouseUp,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: BtnProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const s = SIZES[size];

  const VARIANTS: Record<BtnVariant, { bg: string; color: string }> = {
    primary:   { bg: dsTheme.accent1,      color: '#fff' },
    secondary: { bg: dsTheme.surfaceSolid, color: dsTheme.text },
    ghost:     { bg: 'transparent',        color: dsTheme.text },
    danger:    { bg: '#c03030',            color: '#fff' },
  };

  const v = VARIANTS[variant];
  const bevelOut = `${dsTheme.bevelLight} ${dsTheme.bevelDark} ${dsTheme.bevelDark} ${dsTheme.bevelLight}`;
  const bevelIn  = `${dsTheme.bevelDark} ${dsTheme.bevelLight} ${dsTheme.bevelLight} ${dsTheme.bevelDark}`;

  return (
    <button
      disabled={disabled}
      onMouseEnter={(e) => { setHovered(true); onMouseEnter?.(e); }}
      onMouseLeave={(e) => { setHovered(false); setPressed(false); onMouseLeave?.(e); }}
      onMouseDown={(e) => { setPressed(true); onMouseDown?.(e); }}
      onMouseUp={(e) => { setPressed(false); onMouseUp?.(e); }}
      style={{
        fontFamily: '"Space Mono", monospace',
        fontSize: s.fs,
        fontWeight: 700,
        padding: `${pressed ? s.py + 1 : s.py}px ${s.px}px ${pressed ? s.py - 1 : s.py}px`,
        background: hovered && !pressed && !disabled ? v.bg + 'dd' : v.bg,
        color: disabled ? dsTheme.textMuted : v.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '0.06em',
        border: '2px solid',
        borderColor: pressed ? bevelIn : bevelOut,
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.1s',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        minWidth: '60px',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
