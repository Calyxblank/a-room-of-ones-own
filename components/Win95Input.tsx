'use client';
import React from 'react';
import type { DSTheme } from '../lib/design-system';

interface Win95InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> {
  dsTheme: DSTheme;
  style?: React.CSSProperties;
}

const Win95Input = React.forwardRef<HTMLInputElement, Win95InputProps>(
  ({ dsTheme, style, ...rest }, ref) => (
    <input
      ref={ref}
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
  )
);

Win95Input.displayName = 'Win95Input';

export default Win95Input;
