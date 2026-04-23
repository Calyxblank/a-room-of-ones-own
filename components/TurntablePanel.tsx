'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Track, SharedPlaylist } from '../types';
import type { TimeOfDay } from '../types';
import type { DSTheme } from '../lib/design-system';

const MOCK_TRACKS: Track[] = [
  { id: '1', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', coverColor: '#6d28d9', duration: '4:03', genre: 'Electronic' },
  { id: '2', title: 'Lost in Japan', artist: 'Shawn Mendes', album: 'Lost in Japan', coverColor: '#0891b2', duration: '3:23', genre: 'Pop' },
  { id: '3', title: 'Electric Feel', artist: 'MGMT', album: 'Oracular Spectacular', coverColor: '#d97706', duration: '3:49', genre: 'Indie' },
  { id: '4', title: 'Tame Impala', artist: 'The Less I Know', album: 'Currents', coverColor: '#dc2626', duration: '3:36', genre: 'Psychedelic' },
  { id: '5', title: 'Bloom', artist: 'The Paper Kites', album: 'Twelvefour', coverColor: '#16a34a', duration: '2:54', genre: 'Folk' },
  { id: '6', title: 'Chasing Cars', artist: 'Snow Patrol', album: 'Eyes Open', coverColor: '#2563eb', duration: '4:27', genre: 'Alternative' },
  { id: '7', title: 'Coffee', artist: 'beabadoobee', album: 'Space Cadet', coverColor: '#7c3aed', duration: '2:42', genre: 'Indie' },
  { id: '8', title: 'Golden Hour', artist: 'JVKE', album: 'this is what golden hour feels like', coverColor: '#ca8a04', duration: '3:28', genre: 'Pop' },
];

const PLAYLISTS: Record<TimeOfDay, { name: string; emoji: string; description: string; tracks: Track[] }> = {
  dawn:      { name: 'Golden Drift',      emoji: '🌄', description: 'Soft transitions for the threshold hour', tracks: MOCK_TRACKS.filter(t => ['2', '5', '6'].includes(t.id)) },
  morning:   { name: 'Sage & Slow',       emoji: '🌿', description: 'Calm, fresh start to the day',           tracks: MOCK_TRACKS.filter(t => ['1', '3', '8'].includes(t.id)) },
  afternoon: { name: 'Blush Hours',       emoji: '🌸', description: 'Warm focus in rosy light',              tracks: MOCK_TRACKS.filter(t => ['4', '6', '7'].includes(t.id)) },
  night:     { name: 'Midnight Amber',    emoji: '🌑', description: 'Chill amber glow late-night mood',      tracks: MOCK_TRACKS.filter(t => ['1', '5', '7'].includes(t.id)) },
};

function getUsername(): string {
  if (typeof window === 'undefined') return 'Guest';
  return localStorage.getItem('room-username') ?? 'Guest';
}

export default function TurntablePanel({ timeOfDay, dsTheme }: { timeOfDay: TimeOfDay; dsTheme: DSTheme }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'playlist' | 'all' | 'shared'>('playlist');
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [sharedPlaylists, setSharedPlaylists] = useState<SharedPlaylist[]>([]);
  const [activeShared, setActiveShared] = useState<SharedPlaylist | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  const playlist = PLAYLISTS[timeOfDay];
  const displayTracks = activeTab === 'playlist' ? playlist.tracks : MOCK_TRACKS;

  useEffect(() => {
    if (playing) {
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { setPlaying(null); return 0; }
          return p + 0.5;
        });
      }, 200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  useEffect(() => {
    const es = new EventSource('/api/playlist');
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'init') {
        setSharedPlaylists(data.playlists);
        if (data.playlists.length > 0 && !activeShared) setActiveShared(data.playlists[0]);
      } else if (data.type === 'add') {
        setSharedPlaylists(prev => [data.playlist, ...prev]);
        setActiveShared(data.playlist);
      } else if (data.type === 'remove') {
        setSharedPlaylists(prev => {
          const next = prev.filter(p => p.id !== data.id);
          setActiveShared(a => (a?.id === data.id ? (next[0] ?? null) : a));
          return next;
        });
      }
    };
    return () => es.close();
  }, []);

  const submitPlaylist = useCallback(async () => {
    setAddError('');
    setAdding(true);
    try {
      const res = await fetch('/api/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput, title: titleInput || 'Shared Playlist', addedBy: getUsername() }),
      });
      const json = await res.json();
      if (!res.ok) { setAddError(json.error ?? 'Error'); return; }
      setShowAddForm(false);
      setUrlInput('');
      setTitleInput('');
      setActiveTab('shared');
    } catch {
      setAddError('Network error');
    } finally {
      setAdding(false);
    }
  }, [urlInput, titleInput]);

  const removePlaylist = useCallback(async (id: string) => {
    await fetch('/api/playlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  }, []);

  const currentTrack = MOCK_TRACKS.find(t => t.id === playing);

  const bevel = `${dsTheme.bevelLight} ${dsTheme.bevelDark} ${dsTheme.bevelDark} ${dsTheme.bevelLight}`;

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: '"Space Mono", monospace', color: dsTheme.text }}>
      {/* Now Playing */}
      <div className="flex items-center gap-3 p-3 flex-shrink-0" style={{ background: dsTheme.glass, borderBottom: `1px solid ${dsTheme.bevelDark}` }}>
        <div className="relative flex-shrink-0" style={{ width: '64px', height: '64px' }}>
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            background: currentTrack
              ? `radial-gradient(circle at center, #111 28%, ${currentTrack.coverColor} 28%, ${currentTrack.coverColor} 40%, #111 40%)`
              : 'radial-gradient(circle at center, #111 28%, #333 28%, #333 40%, #111 40%)',
            border: '3px solid #111',
            animation: playing ? 'spin 2s linear infinite' : 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }} />
          <div style={{
            position: 'absolute', top: '4px', right: '-4px',
            width: '2px', height: '28px', background: '#888',
            transformOrigin: 'top center',
            transform: playing ? 'rotate(25deg)' : 'rotate(10deg)',
            transition: 'transform 0.5s',
          }} />
        </div>

        <div className="flex-1 min-w-0">
          {currentTrack ? (
            <>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: dsTheme.accent1, fontFamily: '"Space Mono", monospace', lineHeight: '1.4' }} className="truncate">
                {currentTrack.title}
              </div>
              <div style={{ fontSize: '10px', color: dsTheme.text }}>{currentTrack.artist}</div>
              <div style={{ fontSize: '9px', color: dsTheme.textMuted }}>{currentTrack.album}</div>
              <div style={{ height: '4px', background: dsTheme.glass, marginTop: '6px', border: `1px solid ${dsTheme.bevelDark}` }}>
                <div style={{ height: '100%', width: `${progress}%`, background: dsTheme.accent1, transition: 'width 0.2s' }} />
              </div>
            </>
          ) : (
            <div style={{ color: dsTheme.textMuted, fontFamily: '"Space Mono", monospace', fontSize: '11px' }}>
              {activeTab === 'shared' && activeShared ? `🎵 ${activeShared.title}` : 'Select a track to play'}
            </div>
          )}
        </div>

        <button
          onClick={() => setPlaying(null)}
          style={{ fontSize: '20px', cursor: 'pointer', background: 'none', border: 'none', padding: '4px' }}
          disabled={!playing}
        >⏹</button>
      </div>

      {/* Tabs */}
      <div className="flex flex-shrink-0" style={{ borderBottom: `1px solid ${dsTheme.bevelDark}` }}>
        {([
          { key: 'playlist', label: `${playlist.emoji} ${playlist.name}` },
          { key: 'all', label: '🎵 All Tracks' },
          { key: 'shared', label: `🌐 Shared${sharedPlaylists.length > 0 ? ` (${sharedPlaylists.length})` : ''}` },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '4px 10px',
              fontSize: '10px',
              border: 'none',
              borderRight: `1px solid ${dsTheme.bevelDark}`,
              background: activeTab === tab.key ? dsTheme.glass : 'transparent',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              cursor: 'pointer',
              color: activeTab === tab.key ? dsTheme.accent1 : dsTheme.textMuted,
              fontFamily: '"Space Mono", monospace',
              borderBottom: activeTab === tab.key ? `2px solid ${dsTheme.accent1}` : 'none',
              whiteSpace: 'nowrap',
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* Shared Playlists Tab */}
      {activeTab === 'shared' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div style={{ padding: '6px 8px', borderBottom: `1px solid ${dsTheme.bevelDark}`, flexShrink: 0, background: dsTheme.glass }}>
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="ds-btn ds-btn-sm"
                style={{ background: dsTheme.surfaceSolid, borderColor: bevel, color: dsTheme.text }}
              >
                ➕ Add Spotify Playlist
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input
                  placeholder="Spotify playlist URL"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  className="ds-input"
                  style={{ borderColor: `${dsTheme.bevelDark} ${dsTheme.bevelLight} ${dsTheme.bevelLight} ${dsTheme.bevelDark}`, background: dsTheme.glass, backdropFilter: dsTheme.blur, color: dsTheme.text }}
                  onKeyDown={e => { if (e.key === 'Enter') submitPlaylist(); }}
                />
                <input
                  placeholder="Name (optional)"
                  value={titleInput}
                  onChange={e => setTitleInput(e.target.value)}
                  className="ds-input"
                  style={{ borderColor: `${dsTheme.bevelDark} ${dsTheme.bevelLight} ${dsTheme.bevelLight} ${dsTheme.bevelDark}`, background: dsTheme.glass, backdropFilter: dsTheme.blur, color: dsTheme.text }}
                  onKeyDown={e => { if (e.key === 'Enter') submitPlaylist(); }}
                />
                {addError && <div style={{ fontSize: '10px', color: dsTheme.accent2, fontFamily: '"Space Mono", monospace' }}>{addError}</div>}
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={submitPlaylist} disabled={adding || !urlInput.trim()} className="ds-btn ds-btn-sm" style={{ flex: 1, background: dsTheme.accent1, borderColor: bevel, color: '#fff' }}>
                    {adding ? 'Adding…' : 'Add'}
                  </button>
                  <button onClick={() => { setShowAddForm(false); setAddError(''); }} className="ds-btn ds-btn-sm" style={{ background: dsTheme.surfaceSolid, borderColor: bevel, color: dsTheme.text }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {sharedPlaylists.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: dsTheme.textMuted, gap: '8px' }}>
              <div style={{ fontSize: '28px' }}>🎵</div>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: '11px' }}>No shared playlists yet.</div>
              <div style={{ fontSize: '9px', color: dsTheme.textMuted }}>Add a Spotify playlist for everyone!</div>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {sharedPlaylists.map(pl => (
                <div
                  key={pl.id}
                  onClick={() => setActiveShared(pl)}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '2px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    background: activeShared?.id === pl.id ? dsTheme.glass : 'transparent',
                    borderBottom: `1px solid ${dsTheme.bevelDark}`,
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: activeShared?.id === pl.id ? dsTheme.accent1 : dsTheme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      🎵 {pl.title}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); removePlaylist(pl.id); }}
                      style={{ fontSize: '10px', background: 'none', border: 'none', cursor: 'pointer', color: dsTheme.textMuted, flexShrink: 0 }}
                      title="Remove"
                    >✕</button>
                  </div>
                  <div style={{ fontSize: '9px', color: dsTheme.textMuted }}>Added by {pl.addedBy}</div>
                </div>
              ))}

              {activeShared && (
                <div style={{ padding: '8px', borderTop: `1px solid ${dsTheme.bevelDark}` }}>
                  <div style={{ fontSize: '9px', color: dsTheme.textMuted, marginBottom: '6px', fontFamily: '"Space Mono", monospace' }}>
                    NOW PLAYING
                  </div>
                  <iframe
                    src={`https://open.spotify.com/embed/playlist/${activeShared.spotifyId}?utm_source=generator&theme=0`}
                    width="100%"
                    height="152"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    style={{ border: 'none', borderRadius: '0' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Built-in track tabs */}
      {activeTab !== 'shared' && (
        <>
          {activeTab === 'playlist' && (
            <div style={{ padding: '6px 10px', fontSize: '10px', color: dsTheme.textMuted, background: dsTheme.glass, flexShrink: 0, borderBottom: `1px solid ${dsTheme.bevelDark}`, fontFamily: '"Space Mono", monospace' }}>
              {playlist.description}
            </div>
          )}
          <div className="flex-1 overflow-auto">
            {displayTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => setPlaying(playing === track.id ? null : track.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  background: playing === track.id ? dsTheme.glass : 'transparent',
                  borderBottom: `1px solid ${dsTheme.bevelDark}`,
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '4px',
                  background: track.coverColor, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', border: '1px solid rgba(0,0,0,0.2)',
                  boxShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                }}>
                  {playing === track.id ? '▶' : '🎵'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: playing === track.id ? 'bold' : 'normal', color: playing === track.id ? dsTheme.accent1 : dsTheme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: '"Space Mono", monospace' }}>
                    {track.title}
                  </div>
                  <div style={{ fontSize: '9px', color: dsTheme.textMuted }}>{track.artist} · {track.album}</div>
                </div>
                <div style={{ fontSize: '9px', color: dsTheme.textMuted, flexShrink: 0 }}>
                  <div>{track.duration}</div>
                  <div style={{ fontSize: '8px' }}>{track.genre}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
