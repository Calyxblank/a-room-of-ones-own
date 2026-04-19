'use client';
import React, { useCallback, useRef, useState } from 'react';
import StickyNote from './StickyNote';
import { useNotes } from '../hooks/useNotes';
import type { PerformanceTier } from '../hooks/useDevicePerformance';

export default function NotesCanvas({ perfTier }: { perfTier: PerformanceTier }) {
  const {
    notes,
    connectingFrom,
    addNote,
    updateNote,
    deleteNote,
    startConnect,
    finishConnect,
    cancelConnect,
    getShareUrl,
    clearAll,
  } = useNotes();

  const [shareMsg, setShareMsg] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);
  const reduceAnimations = perfTier === 'low';

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (connectingFrom) {
      cancelConnect();
      return;
    }
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x < 0 || y < 0) return;
    addNote(x - 80, y - 60);
  }, [connectingFrom, addNote, cancelConnect]);

  const handleShare = useCallback(() => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      setShareMsg('URL copied!');
      setTimeout(() => setShareMsg(''), 2500);
    }).catch(() => {
      setShareMsg('Copy failed');
      setTimeout(() => setShareMsg(''), 2500);
    });
  }, [getShareUrl]);

  const connections: { x1: number; y1: number; x2: number; y2: number }[] = [];
  notes.forEach(note => {
    note.connections.forEach(targetId => {
      const target = notes.find(n => n.id === targetId);
      if (target) {
        connections.push({
          x1: note.x + 80,
          y1: note.y + 60,
          x2: target.x + 80,
          y2: target.y + 60,
        });
      }
    });
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 10px', flexShrink: 0,
        background: 'rgba(192,192,192,0.6)',
        borderBottom: '1px solid #808080',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            addNote(Math.random() * (rect.width - 200) + 20, Math.random() * (rect.height - 160) + 20);
          }}
          style={toolBtnStyle}
          title="Add a new note"
        >
          ✚ Add Note
        </button>

        {connectingFrom ? (
          <button onClick={cancelConnect} style={{ ...toolBtnStyle, background: 'rgba(200,0,0,0.15)', color: '#700', border: '1px solid #c00' }}>
            ✕ Cancel Connect
          </button>
        ) : (
          <span style={{ fontSize: '11px', color: '#555', padding: '0 4px' }}>
            Click canvas to add • Double-click note to edit • ⇌ to connect
          </span>
        )}

        <div style={{ flex: 1 }} />

        <button onClick={handleShare} style={toolBtnStyle} title="Copy shareable URL">
          🔗 Share
        </button>
        {shareMsg && (
          <span style={{ color: '#006600', fontFamily: '"VT323", monospace', fontSize: '15px' }}>
            {shareMsg}
          </span>
        )}
        <button
          onClick={clearAll}
          style={{ ...toolBtnStyle, background: 'rgba(200,0,0,0.1)', color: '#700' }}
          title="Clear all notes"
        >
          🗑 Clear All
        </button>
      </div>

      {/* Canvas area */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: connectingFrom ? 'crosshair' : 'cell',
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          background: 'rgba(250,248,240,0.7)',
        }}
      >
        {/* Connection lines */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#000080" fillOpacity="0.6" />
            </marker>
          </defs>
          {connections.map((c, i) => (
            <line
              key={i}
              x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
              stroke="#000080"
              strokeWidth="1.5"
              strokeOpacity="0.5"
              strokeDasharray="6,3"
              markerEnd="url(#arrowhead)"
            />
          ))}
        </svg>

        {/* Notes */}
        {notes.map(note => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={updateNote}
            onDelete={deleteNote}
            onStartConnect={startConnect}
            onFinishConnect={finishConnect}
            isConnecting={!!connectingFrom && connectingFrom !== note.id}
            isConnectingFrom={connectingFrom === note.id}
            reduceAnimations={reduceAnimations}
          />
        ))}

        {notes.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '12px',
            pointerEvents: 'none',
          }}>
            <div style={{ fontSize: '48px' }}>📝</div>
            <div style={{ fontSize: '14px', fontFamily: '"Press Start 2P", monospace', color: '#888', textAlign: 'center', lineHeight: '1.8' }}>
              Click anywhere to<br />add your first note
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const toolBtnStyle: React.CSSProperties = {
  padding: '3px 10px',
  fontSize: '11px',
  cursor: 'pointer',
  background: 'rgba(192,192,192,0.8)',
  border: '2px solid',
  borderColor: '#ffffff #404040 #404040 #ffffff',
  boxShadow: '1px 1px 0 rgba(0,0,0,0.3)',
  fontFamily: 'system-ui',
  color: '#111',
  whiteSpace: 'nowrap',
};
