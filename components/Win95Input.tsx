'use client';
import React from 'react';
import type { DSTheme } from '../lib/design-system';

interface Win95InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> {
  dsTheme: DSTheme;
  style?: React.CSSProperties;
}

export default function Win95Input({ dsTheme, style, ...rest }: Win95InputProps) {
  return (
    <input
      style={{
        fontFamily: '"Space Mono", monospace',
        fontSize: '11px',
        background: dsTheme.glass,
        color: dsTheme.text,
        backdropFilter: dsTheme.blur,
        WebkitBackdropFilter: dsTheme.blur,
        border: '2px solid',
        borderColor: `${dsTheme.bevelDark} ${dsTheme.bevelLight} ${dsTheme.bevelLight} ${dsTheme.bevelDark}`,
        padding: '6px 10px',
        width: '100%',
        outline: 'none',
        ...style,
      }}
      {...rest}
    />
  );
}
