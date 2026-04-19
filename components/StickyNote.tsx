'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { Note } from '../types';

interface StickyNoteProps {
  note: Note;
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
    minHeight: '120px',
    background: note.color,
    border: isConnectingFrom ? '3px dashed #000080' : isConnecting ? '2px dashed #333' : '1px solid rgba(0,0,0,0.2)',
    boxShadow: isConnecting ? '0 0 0 2px #000080' : '2px 4px 8px rgba(0,0,0,0.25), 1px 1px 0 rgba(255,255,255,0.4) inset',
    cursor: editing ? 'text' : isConnecting ? 'crosshair' : 'grab',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    userSelect: editing ? 'text' : 'none',
    transition: reduceAnimations ? 'none' : 'box-shadow 0.15s, border 0.15s',
    zIndex: editing ? 20 : 10,
    transform: reduceAnimations ? 'none' : 'rotate(0.5deg)',
  };

  return (
    <div style={noteStyle} onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
      {/* Note top bar */}
      <div style={{
        height: '24px',
        background: 'rgba(0,0,0,0.12)',
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
              background: isConnectingFrom ? '#000080' : 'rgba(0,0,0,0.1)',
              color: isConnectingFrom ? 'white' : '#333',
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
              background: 'rgba(200,0,0,0.15)',
              color: '#700',
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
              minHeight: '80px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: '"VT323", monospace',
              fontSize: '16px',
              lineHeight: '1.4',
              color: '#222',
            }}
          />
        ) : (
          <div
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: '16px',
              lineHeight: '1.4',
              color: '#222',
              wordBreak: 'break-word',
              minHeight: '80px',
              cursor: 'grab',
              whiteSpace: 'pre-wrap',
            }}
          >
            {note.content || <span style={{ color: 'rgba(0,0,0,0.3)', fontSize: '13px' }}>Double-click to edit</span>}
          </div>
        )}
      </div>
    </div>
  );
}
