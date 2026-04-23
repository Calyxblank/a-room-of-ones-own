'use client';
import React, { useState } from 'react';
import type { DSTheme } from '../lib/design-system';

interface PostItCardProps {
  dsTheme: DSTheme;
  text: string;
  from?: string;
  rotate?: number;
}

export default function PostItCard({ dsTheme, text, from, rotate = 0 }: PostItCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(f => !f)}
      style={{
        width: 160,
        minHeight: 160,
        background: dsTheme.postit,
        boxShadow: `3px 3px 0 ${dsTheme.postitShadow}, 6px 6px 12px rgba(0,0,0,0.15)`,
        padding: '12px 14px',
        transform: `rotate(${rotate}deg) ${flipped ? 'scale(1.04)' : 'scale(1)'}`,
        transition: 'transform 0.2s',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* tape strip */}
      <div style={{
        position: 'absolute',
        top: -8,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 50,
        height: 16,
        background: 'rgba(255,255,200,0.7)',
        border: '1px solid rgba(200,190,100,0.4)',
        pointerEvents: 'none',
      }} />
      <p style={{
        fontSize: '11px',
        lineHeight: 1.6,
        color: '#3a3010',
        fontStyle: 'italic',
        fontFamily: '"Space Mono", monospace',
        margin: '6px 0 0',
      }}>
        {text}
      </p>
      {from && (
        <div style={{
          fontSize: '9px',
          color: '#6a5020',
          textAlign: 'right',
          marginTop: 8,
          fontFamily: '"Space Mono", monospace',
        }}>
          — {from}
        </div>
      )}
    </div>
  );
}
