'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTimeOfDay } from '../hooks/useTimeOfDay';
import { useIsMobile } from '../hooks/useIsMobile';

function generateRoomId(): string {
  return Math.random().toString(36).slice(2, 8);
}

export default function LobbyPage() {
  const { dsTheme, theme } = useTimeOfDay();
  const isMobile = useIsMobile();
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const createRoom = () => {
    router.push(`/room/${generateRoomId()}`);
  };

  const joinRoom = () => {
    const raw = joinCode.trim().toLowerCase();
    if (!raw) { setError('Enter a room code or URL'); return; }
    const match = raw.match(/room\/([a-z0-9]+)/);
    const id = match ? match[1] : raw;
    if (!/^[a-z0-9]{4,10}$/.test(id)) { setError('Invalid room code'); return; }
    router.push(`/room/${id}`);
  };

  const bevel = `${dsTheme.bevelLight} ${dsTheme.bevelDark} ${dsTheme.bevelDark} ${dsTheme.bevelLight}`;
  const bevelIn = `${dsTheme.bevelDark} ${dsTheme.bevelLight} ${dsTheme.bevelLight} ${dsTheme.bevelDark}`;

  const inputStyle: React.CSSProperties = {
    fontFamily: '"Space Mono", monospace',
    fontSize: '11px',
    background: dsTheme.glass,
    color: dsTheme.text,
    backdropFilter: dsTheme.blur,
    border: '2px solid',
    borderColor: `${dsTheme.bevelDark} ${dsTheme.bevelLight} ${dsTheme.bevelLight} ${dsTheme.bevelDark}`,
    padding: '8px 10px',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      width: '100vw', height: '100dvh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Space Mono", monospace',
      background: dsTheme.surfaceSolid,
      transition: 'background 1.5s',
    }}>
      <div style={{
        width: isMobile ? '92vw' : '360px',
        border: '2px solid', borderColor: bevel,
        borderRadius: '4px',
        boxShadow: `4px 4px 0 ${dsTheme.chromeDark}, 0 12px 40px rgba(0,0,0,0.3)`,
        background: dsTheme.glass,
        backdropFilter: dsTheme.blur,
        WebkitBackdropFilter: dsTheme.blur,
        overflow: 'hidden',
      }}>
        {/* Title bar */}
        <div style={{
          background: dsTheme.titleBar,
          padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: '8px',
          minHeight: '36px',
        }}>
          <span style={{ fontSize: '16px' }}>🏠</span>
          <span style={{
            color: dsTheme.titleText, fontSize: '12px', fontWeight: 700,
            letterSpacing: '0.05em', textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
          }}>
            A Room of One&apos;s Own
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '14px' }}>{theme.icon}</span>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Create */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '9px', color: dsTheme.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              New room
            </div>
            <button onClick={createRoom} style={{
              padding: '11px 16px',
              border: '2px solid', borderColor: bevel,
              background: dsTheme.accent1,
              color: '#fff',
              fontFamily: '"Space Mono", monospace',
              fontSize: '12px', fontWeight: 700,
              cursor: 'pointer', width: '100%',
              letterSpacing: '0.03em',
            }}>
              ✨ Create a new room
            </button>
          </section>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: dsTheme.bevelDark }} />
            <span style={{ fontSize: '9px', color: dsTheme.textMuted }}>or join existing</span>
            <div style={{ flex: 1, height: '1px', background: dsTheme.bevelDark }} />
          </div>

          {/* Join */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '9px', color: dsTheme.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Join a room
            </div>
            <input
              value={joinCode}
              onChange={e => { setJoinCode(e.target.value); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') joinRoom(); }}
              placeholder="Paste room URL or code…"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              style={inputStyle}
            />
            {error && (
              <div style={{ fontSize: '10px', color: dsTheme.accent2 }}>{error}</div>
            )}
            <button onClick={joinRoom} style={{
              padding: '11px 16px',
              border: '2px solid', borderColor: bevel,
              background: dsTheme.chromeLight,
              color: dsTheme.text,
              fontFamily: '"Space Mono", monospace',
              fontSize: '11px',
              cursor: 'pointer', width: '100%',
            }}>
              → Join room
            </button>
          </section>

          {/* Footer hint */}
          <div style={{ fontSize: '9px', color: dsTheme.textMuted, textAlign: 'center', lineHeight: 1.7, borderTop: `1px solid ${dsTheme.bevelDark}`, paddingTop: '12px' }}>
            Rooms are ephemeral — share the link to invite others.<br />
            Everything resets when the server sleeps. 🌙
          </div>

        </div>
      </div>

      {/* Sunken clock */}
      <div style={{
        position: 'fixed', bottom: '12px', right: '14px',
        padding: '4px 10px',
        border: '1px solid', borderColor: bevelIn,
        fontSize: '10px', color: dsTheme.text,
        fontFamily: '"Space Mono", monospace',
        background: dsTheme.surfaceSolid,
      }}>
        {theme.icon} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
