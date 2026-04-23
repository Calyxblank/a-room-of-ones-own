'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { Note } from '../types';
import type { DSTheme } from '../lib/design-system';

interface StickyNoteProps {
  note: Note;
  dsTheme: DSTheme;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onStartConnect: (id: string) => void;
  onFinishConnect: (id: string) => void;
  isConnecting: boolean;
  isConnectingFrom: boolean;
  reduceAnimations: boolean;
}

export default function StickyNote({
  note,
  dsTheme,
  onUpdate,
  onDelete,
  onStartConnect,
  onFinishConnect,
  isConnecting,
  isConnectingFrom,
  reduceAnimations,
}: StickyNoteProps) {
  const [editing, setEditing] = useState(note.content === '');
  const textRef = useRef<HTMLTextAreaElement>(null);
  const dragStart = useRef<{ mx: number; my: number; nx: number; ny: number } | null>(null);

  useEffect(() => {
    if (editing && textRef.current) {
      textRef.current.focus();
    }
  }, [editing]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (editing) return;
    if (isConnecting) {
      onFinishConnect(note.id);
      return;
    }
    e.stopPropagation();
    dragStart.current = { mx: e.clientX, my: e.clientY, nx: note.x, ny: note.y };

    const onMove = (me: MouseEvent) => {
      if (!dragStart.current) return;
      onUpdate(note.id, {
        x: dragStart.current.nx + me.clientX - dragStart.current.mx,
        y: dragStart.current.ny + me.clientY - dragStart.current.my,
      });
    };
    const onUp = () => {
      dragStart.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [editing, isConnecting, note, onUpdate, onFinishConnect]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (editing || isConnecting) return;
    e.stopPropagation();
    const touch = e.touches[0];
    dragStart.current = { mx: touch.clientX, my: touch.clientY, nx: note.x, ny: note.y };

    const onMove = (te: TouchEvent) => {
      if (!dragStart.current) return;
      const t = te.touches[0];
      onUpdate(note.id, {
        x: dragStart.current.nx + t.clientX - dragStart.current.mx,
        y: dragStart.current.ny + t.clientY - dragStart.current.my,
      });
    };
    const onEnd = () => {
      dragStart.current = null;
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  }, [editing, isConnecting, note, onUpdate]);

  const noteStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${note.x}px`,
    top: `${note.y}px`,
    width: '160px',
    minHeight: '160px',
    background: note.color,
    border: isConnectingFrom
      ? `3px dashed ${dsTheme.accent1}`
      : isConnecting
        ? `2px dashed ${dsTheme.bevelDark}`
        : '1px solid rgba(0,0,0,0.15)',
    boxShadow: isConnecting
      ? `0 0 0 2px ${dsTheme.accent1}`
      : `3px 3px 0 ${dsTheme.postitShadow}, 6px 6px 12px rgba(0,0,0,0.15)`,
    cursor: editing ? 'text' : isConnecting ? 'crosshair' : 'grab',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    userSelect: editing ? 'text' : 'none',
    transition: reduceAnimations ? 'none' : 'box-shadow 0.2s, transform 0.2s',
    zIndex: editing ? 20 : 10,
    transform: reduceAnimations ? 'none' : (editing ? 'rotate(0deg) scale(1.04)' : 'rotate(0.5deg)'),
  };

  return (
    <div style={noteStyle} onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
      {/* Tape strip */}
      <div style={{
        position: 'absolute',
        top: '-8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '50px',
        height: '16px',
        background: 'rgba(255,255,200,0.7)',
        border: '1px solid rgba(200,190,100,0.4)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Note top bar */}
      <div style={{
        height: '24px',
        background: 'rgba(0,0,0,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingLeft: '6px', paddingRight: '4px',
        flexShrink: 0,
        cursor: editing ? 'default' : 'grab',
      }}>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f57', border: '1px solid rgba(0,0,0,0.2)' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#febc2e', border: '1px solid rgba(0,0,0,0.2)' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28c840', border: '1px solid rgba(0,0,0,0.2)' }} />
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onStartConnect(note.id); }}
            title="Connect to another note"
            style={{
              width: '16px', height: '16px', fontSize: '10px', cursor: 'pointer',
              background: isConnectingFrom ? dsTheme.accent1 : 'rgba(0,0,0,0.1)',
              color: isConnectingFrom ? '#fff' : dsTheme.text,
              border: '1px solid rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '2px',
            }}
          >⇌</button>
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onDelete(note.id); }}
            title="Delete note"
            style={{
              width: '16px', height: '16px', fontSize: '9px', cursor: 'pointer',
              background: 'rgba(200,0,0,0.18)',
              color: dsTheme.accent2,
              border: '1px solid rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '2px',
            }}
          >✕</button>
        </div>
      </div>

      {/* Content */}
      <div
        style={{ flex: 1, padding: '6px 8px', position: 'relative' }}
        onDoubleClick={() => setEditing(true)}
      >
        {editing ? (
          <textarea
            ref={textRef}
            value={note.content}
            onChange={e => onUpdate(note.id, { content: e.target.value })}
            onBlur={() => setEditing(false)}
            onMouseDown={e => e.stopPropagation()}
            placeholder="Type your note..."
            style={{
              width: '100%',
              height: '100%',
              minHeight: '100px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: '"Space Mono", monospace',
              fontSize: '11px',
              lineHeight: '1.7',
              color: '#3a3010',
              fontStyle: 'italic',
            }}
          />
        ) : (
          <div
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: '11px',
              lineHeight: '1.7',
              color: '#3a3010',
              fontStyle: 'italic',
              wordBreak: 'break-word',
              minHeight: '100px',
              cursor: 'grab',
              whiteSpace: 'pre-wrap',
            }}
          >
            {note.content || <span style={{ color: 'rgba(0,0,0,0.28)', fontSize: '10px', fontStyle: 'italic' }}>Double-click to edit</span>}
          </div>
        )}
      </div>
    </div>
  );
}
