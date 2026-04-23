'use client';
import React, { useState } from 'react';
import type { DSTheme } from '../lib/design-system';

interface ToggleRowProps {
  dsTheme: DSTheme;
  label: string;
  defaultOn?: boolean;
  onChange?: (on: boolean) => void;
}

export default function ToggleRow({ dsTheme, label, defaultOn = false, onChange }: ToggleRowProps) {
  const [on, setOn] = useState(defaultOn);

  const bevelOut = `${dsTheme.bevelLight} ${dsTheme.bevelDark} ${dsTheme.bevelDark} ${dsTheme.bevelLight}`;
  const bevelIn  = `${dsTheme.bevelDark} ${dsTheme.bevelLight} ${dsTheme.bevelLight} ${dsTheme.bevelDark}`;

  const toggle = () => {
    const next = !on;
    setOn(next);
    onChange?.(next);
  };

  return (
    <div
      onClick={toggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: '10px', fontFamily: '"Space Mono", monospace', color: dsTheme.text }}>
        {label}
      </span>
      <div
        style={{
          width: 32,
          height: 16,
          borderRadius: 8,
          background: on ? dsTheme.accent1 : dsTheme.chrome,
          border: '2px solid',
          borderColor: on ? bevelIn : bevelOut,
          position: 'relative',
          transition: 'background 0.15s',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: on ? 14 : 0,
            width: 12,
            height: 12,
            background: on ? '#fff' : dsTheme.bevelLight,
            border: '1px solid rgba(0,0,0,0.2)',
            borderRadius: '50%',
            transition: 'left 0.15s',
          }}
        />
      </div>
    </div>
  );
}
