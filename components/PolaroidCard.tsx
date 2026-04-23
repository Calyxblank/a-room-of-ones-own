import React from 'react';
import type { DSTheme } from '../lib/design-system';

interface PolaroidCardProps {
  dsTheme: DSTheme;
  caption?: string;
  imageUrl?: string;
  rotate?: number;
}

export default function PolaroidCard({ dsTheme, caption, imageUrl, rotate = 0 }: PolaroidCardProps) {
  return (
    <div style={{
      background: '#fffef8',
      padding: '10px 10px 36px',
      boxShadow: `2px 2px 0 ${dsTheme.chrome}, 4px 4px 16px rgba(0,0,0,0.2)`,
      transform: `rotate(${rotate}deg)`,
      width: 150,
      border: `1px solid ${dsTheme.chrome}`,
    }}>
      <div style={{
        width: '100%',
        height: 120,
        background: imageUrl
          ? undefined
          : `repeating-linear-gradient(45deg, ${dsTheme.glass}, ${dsTheme.glass} 4px, ${dsTheme.glassBorder} 4px, ${dsTheme.glassBorder} 8px)`,
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundSize: imageUrl ? 'cover' : undefined,
        backgroundPosition: imageUrl ? 'center' : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '9px',
        color: dsTheme.textMuted,
        fontFamily: '"Space Mono", monospace',
        textAlign: 'center',
        padding: 6,
      }}>
        {!imageUrl && 'photo / memory'}
      </div>
      {caption && (
        <div style={{
          fontSize: '10px',
          color: '#3a3020',
          textAlign: 'center',
          marginTop: 10,
          fontStyle: 'italic',
          lineHeight: 1.4,
          fontFamily: '"Space Mono", monospace',
        }}>
          {caption}
        </div>
      )}
    </div>
  );
}
