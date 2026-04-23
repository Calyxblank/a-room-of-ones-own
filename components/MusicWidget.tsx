'use client';
import React, { useState, useEffect, useRef } from 'react';
import type { DSTheme } from '../lib/design-system';

function parseSpotifyUrl(url: string): { type: string; id: string } | null {
  const uriMatch = url.match(/^spotify:(track|album|playlist):([a-zA-Z0-9]+)$/);
  if (uriMatch) return { type: uriMatch[1], id: uriMatch[2] };
  const urlMatch = url.match(/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
  if (urlMatch) return { type: urlMatch[1], id: urlMatch[2] };
  return null;
}

const BAR_COUNT = 20;

interface MusicWidgetProps {
  dsTheme: DSTheme;
}

export default function MusicWidget({ dsTheme }: MusicWidgetProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [embedded, setEmbedded] = useState<{ type: string; id: string } | null>(null);
  const [urlError, setUrlError] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 0.4));
      }, 150);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  const handleEmbed = () => {
    setUrlError('');
    const parsed = parseSpotifyUrl(spotifyUrl.trim());
    if (!parsed) { setUrlError('Invalid Spotify URL or URI'); return; }
    setEmbedded(parsed);
    setSpotifyUrl('');
  };

  const bevelOut = `${dsTheme.bevelLight} ${dsTheme.bevelDark} ${dsTheme.bevelDark} ${dsTheme.bevelLight}`;
  const mins = Math.floor(progress * 2.4 / 60).toString().padStart(2, '0');
  const secs = Math.floor(progress * 2.4 % 60).toString().padStart(2, '0');

  return (
    <div style={{
      background: dsTheme.glass,
      backdropFilter: dsTheme.blur,
      WebkitBackdropFilter: dsTheme.blur,
      border: `1px solid ${dsTheme.glassBorder}`,
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      fontFamily: '"Space Mono", monospace',
    }}>
      {/* Waveform */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '32px' }}>
        {Array.from({ length: BAR_COUNT }).map((_, i) => {
          const height = playing
            ? 40 + 60 * Math.abs(Math.sin(i * 0.8 + progress * 0.15))
            : 30 + 70 * Math.abs(Math.sin(i * 0.8));
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${Math.round(height)}%`,
                background: dsTheme.accent1,
                opacity: 0.6 + (i % 3) * 0.13,
                transition: playing ? 'height 0.15s' : 'none',
                borderRadius: '1px 1px 0 0',
              }}
            />
          );
        })}
      </div>

      {/* Progress bar */}
      <div
        style={{ height: '4px', background: dsTheme.surfaceSolid, cursor: 'pointer', border: `1px solid ${dsTheme.bevelDark}` }}
        onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          setProgress(((e.clientX - rect.left) / rect.width) * 100);
        }}
      >
        <div style={{ height: '100%', width: `${progress}%`, background: dsTheme.accent1, transition: 'width 0.15s' }} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => setProgress(0)}
          style={{ fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: dsTheme.text }}
        >⏮</button>
        <button
          onClick={() => setPlaying(p => !p)}
          style={{
            fontSize: '13px', cursor: 'pointer',
            background: dsTheme.accent1, color: '#fff',
            border: '2px solid', borderColor: bevelOut,
            padding: '4px 10px',
            fontFamily: '"Space Mono", monospace',
            fontWeight: 700,
          }}
        >{playing ? '⏸' : '▶'}</button>
        <button
          onClick={() => { setPlaying(false); setProgress(0); }}
          style={{ fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: dsTheme.text }}
        >⏹</button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '9px', color: dsTheme.textMuted }}>
          {mins}:{secs} / 4:00
        </span>
      </div>

      {/* Spotify embed or URL input */}
      {embedded ? (
        <div>
          <iframe
            src={`https://open.spotify.com/embed/${embedded.type}/${embedded.id}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ border: 'none' }}
          />
          <button
            onClick={() => setEmbedded(null)}
            style={{ fontSize: '9px', color: dsTheme.textMuted, background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' }}
          >✕ Remove</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            value={spotifyUrl}
            onChange={e => setSpotifyUrl(e.target.value)}
            placeholder="Spotify URL or URI…"
            onKeyDown={e => { if (e.key === 'Enter') handleEmbed(); }}
            style={{
              flex: 1,
              fontFamily: '"Space Mono", monospace',
              fontSize: '10px',
              background: dsTheme.glass,
              color: dsTheme.text,
              border: '2px solid',
              borderColor: `${dsTheme.bevelDark} ${dsTheme.bevelLight} ${dsTheme.bevelLight} ${dsTheme.bevelDark}`,
              padding: '4px 8px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleEmbed}
            disabled={!spotifyUrl.trim()}
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: '10px',
              fontWeight: 700,
              background: dsTheme.accent1,
              color: '#fff',
              border: '2px solid',
              borderColor: bevelOut,
              padding: '4px 10px',
              cursor: spotifyUrl.trim() ? 'pointer' : 'not-allowed',
              opacity: spotifyUrl.trim() ? 1 : 0.5,
            }}
          >▶ Embed</button>
        </div>
      )}
      {urlError && (
        <div style={{ fontSize: '9px', color: dsTheme.accent2 }}>{urlError}</div>
      )}
    </div>
  );
}
