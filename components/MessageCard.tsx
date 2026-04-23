import React from 'react';
import type { DSTheme } from '../lib/design-system';

interface MessageCardProps {
  dsTheme: DSTheme;
  text: string;
  from?: string;
  time?: string;
  sent?: boolean;
}

export default function MessageCard({ dsTheme, text, from, time, sent = false }: MessageCardProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: sent ? 'flex-end' : 'flex-start',
      marginBottom: 10,
    }}>
      <div style={{
        maxWidth: 200,
        background: sent ? `${dsTheme.accent1}cc` : dsTheme.glass,
        backdropFilter: dsTheme.blur,
        WebkitBackdropFilter: dsTheme.blur,
        border: `1px solid ${sent ? dsTheme.accent1 : dsTheme.glassBorder}`,
        borderRadius: sent ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
        padding: '8px 12px',
        fontSize: '11px',
        lineHeight: 1.6,
        color: sent ? '#fff' : dsTheme.text,
        fontFamily: '"Space Mono", monospace',
        wordBreak: 'break-word',
      }}>
        {text}
      </div>
      {(from || time) && (
        <div style={{
          fontSize: '8px',
          color: dsTheme.textMuted,
          marginTop: 3,
          paddingLeft: sent ? 0 : 4,
          paddingRight: sent ? 4 : 0,
          fontFamily: '"Space Mono", monospace',
        }}>
          {from && <span style={{ fontWeight: 700 }}>{from}</span>}
          {from && time && ' · '}
          {time}
        </div>
      )}
    </div>
  );
}
