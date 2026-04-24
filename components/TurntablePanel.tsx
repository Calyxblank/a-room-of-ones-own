'use client';
import React, { useState, useEffect, useCallback } from 'react';
import type { SharedPlaylist } from '../types';
import type { DSTheme } from '../lib/design-system';
import Btn from './Btn';
import Win95Input from './Win95Input';
import SectionLabel from './SectionLabel';

function getUsername(): string {
  if (typeof window === 'undefined') return 'Guest';
  return localStorage.getItem('room-username') ?? 'Guest';
}

export default function TurntablePanel({ dsTheme, roomId }: { dsTheme: DSTheme; roomId: string }) {
  const [playlists, setPlaylists] = useState<SharedPlaylist[]>([]);
  const [active, setActive] = useState<SharedPlaylist | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const es = new EventSource(`/api/playlist?room=${roomId}`);
    es.onmessage = (e) => {
      const data = JSON.parse(e.data) as {
        type: string;
        playlists?: SharedPlaylist[];
        playlist?: SharedPlaylist;
        id?: string;
      };
      if (data.type === 'init') {
        setPlaylists(data.playlists ?? []);
        if ((data.playlists ?? []).length > 0)
          setActive(prev => prev ?? data.playlists![0]);
      } else if (data.type === 'add' && data.playlist) {
        setPlaylists(prev => [data.playlist!, ...prev]);
        setActive(data.playlist!);
      } else if (data.type === 'remove') {
        setPlaylists(prev => {
          const next = prev.filter(p => p.id !== data.id);
          setActive(a => (a?.id === data.id ? (next[0] ?? null) : a));
          return next;
        });
      }
    };
    return () => es.close();
  }, []);

  const submit = useCallback(async () => {
    setAddError('');
    setAdding(true);
    try {
      const res = await fetch(`/api/playlist?room=${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlInput,
          title: titleInput || 'Shared Playlist',
          addedBy: getUsername(),
        }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) { setAddError(json.error ?? 'Error'); return; }
      setShowForm(false);
      setUrlInput('');
      setTitleInput('');
    } catch {
      setAddError('Network error');
    } finally {
      setAdding(false);
    }
  }, [urlInput, titleInput]);

  const remove = useCallback(async (id: string) => {
    await fetch(`/api/playlist?room=${roomId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: '"Space Mono", monospace', color: dsTheme.text }}>

      {/* Header */}
      <div style={{ padding: '8px 10px', borderBottom: `1px solid ${dsTheme.bevelDark}`, background: dsTheme.glass, flexShrink: 0 }}>
        <SectionLabel dsTheme={dsTheme} label="Shared Playlists" />
      </div>

      {/* Add form / button */}
      <div style={{ padding: '6px 8px', borderBottom: `1px solid ${dsTheme.bevelDark}`, background: dsTheme.surfaceSolid, flexShrink: 0 }}>
        {showForm ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Win95Input
              dsTheme={dsTheme}
              placeholder="Spotify playlist URL"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit(); }}
            />
            <Win95Input
              dsTheme={dsTheme}
              placeholder="Name (optional)"
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit(); }}
            />
            {addError && (
              <div style={{ fontSize: '10px', color: dsTheme.accent2 }}>{addError}</div>
            )}
            <div style={{ display: 'flex', gap: '6px' }}>
              <Btn dsTheme={dsTheme} variant="primary" size="sm" onClick={submit}
                disabled={adding || !urlInput.trim()} style={{ flex: 1 }}>
                {adding ? 'Adding…' : 'Add'}
              </Btn>
              <Btn dsTheme={dsTheme} variant="secondary" size="sm"
                onClick={() => { setShowForm(false); setAddError(''); }}>
                Cancel
              </Btn>
            </div>
          </div>
        ) : (
          <Btn dsTheme={dsTheme} variant="secondary" size="sm" onClick={() => setShowForm(true)}>
            ➕ Add Spotify Playlist
          </Btn>
        )}
      </div>

      {/* Playlist list */}
      {playlists.length > 0 && (
        <div style={{ maxHeight: '180px', overflowY: 'auto', flexShrink: 0, borderBottom: `1px solid ${dsTheme.bevelDark}` }}>
          {playlists.map(pl => (
            <div
              key={pl.id}
              onClick={() => setActive(pl)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 10px', cursor: 'pointer',
                background: active?.id === pl.id ? dsTheme.glass : 'transparent',
                borderBottom: `1px solid ${dsTheme.bevelDark}`,
                transition: 'background 0.12s',
              }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>🎵</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: active?.id === pl.id ? 'bold' : 'normal',
                  color: active?.id === pl.id ? dsTheme.accent1 : dsTheme.text,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {pl.title}
                </div>
                <div style={{ fontSize: '9px', color: dsTheme.textMuted }}>by {pl.addedBy}</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); remove(pl.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: dsTheme.textMuted, fontSize: '10px', padding: '2px', flexShrink: 0 }}
                title="Remove"
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Spotify embed or empty state */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {active ? (
          <iframe
            key={active.spotifyId}
            src={`https://open.spotify.com/embed/playlist/${active.spotifyId}?utm_source=generator&theme=0`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', display: 'block' }}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: dsTheme.textMuted }}>
            <div style={{ fontSize: '36px' }}>🎵</div>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: '11px', textAlign: 'center', lineHeight: 1.8 }}>
              Add a Spotify playlist<br />to share with the room
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
