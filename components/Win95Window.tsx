'use client';
import React, { useState, useRef, useCallback } from 'react';
import type { DSTheme } from '../lib/design-system';

interface Win95WindowProps {
  title: string;
  icon?: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  height?: string;
  defaultX?: number;
  defaultY?: number;
  className?: string;
  dsTheme: DSTheme;
}

export default function Win95Window({
  title,
  icon = '🖥',
  onClose,
  children,
  width = '680px',
  height = '520px',
  defaultX = 60,
  defaultY = 40,
  className = '',
  dsTheme,
}: Win95WindowProps) {
  const [pos, setPos] = useState({ x: defaultX, y: defaultY });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, wx: 0, wy: 0 });
  const winRef = useRef<HTMLDivElement>(null);

  const onTitleMouseDown = useCallback((e: React.MouseEvent) => {
    if (window.innerWidth < 640) return;
    e.preventDefault();
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, wx: pos.x, wy: pos.y };

    const onMove = (me: MouseEvent) => {
      setPos({
        x: dragStart.current.wx + me.clientX - dragStart.current.mx,
        y: dragStart.current.wy + me.clientY - dragStart.current.my,
      });
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [pos]);

  const bevel = `${dsTheme.bevelLight} ${dsTheme.bevelDark} ${dsTheme.bevelDark} ${dsTheme.bevelLight}`;
  const bevelIn = `${dsTheme.bevelDark} ${dsTheme.bevelLight} ${dsTheme.bevelLight} ${dsTheme.bevelDark}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Window */}
      <div
        ref={winRef}
        className={`fixed z-50 flex flex-col ${className}`}
        style={{
          width: `min(${width}, 96vw)`,
          height: `min(${height}, 90vh)`,
          left: window.innerWidth < 640 ? 0 : Math.max(0, Math.min(pos.x, window.innerWidth - 400)),
          top: window.innerWidth < 640 ? 0 : Math.max(0, Math.min(pos.y, window.innerHeight - 300)),
          cursor: dragging ? 'grabbing' : 'default',
          border: '2px solid',
          borderColor: bevel,
          boxShadow: `3px 3px 0 ${dsTheme.chromeDark}`,
          background: dsTheme.glass,
          backdropFilter: dsTheme.blur,
          WebkitBackdropFilter: dsTheme.blur,
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between select-none flex-shrink-0"
          style={{
            background: dsTheme.titleBar,
            padding: '3px 6px',
            cursor: window.innerWidth >= 640 ? 'grab' : 'default',
            minHeight: '26px',
          }}
          onMouseDown={onTitleMouseDown}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            color: dsTheme.titleText,
            fontSize: '11px',
            fontFamily: '"Space Mono", "Press Start 2P", monospace',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
          }}>
            <span style={{ fontSize: '13px' }}>{icon}</span>
            <span className="truncate max-w-xs">{title}</span>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            {['□', '✕'].map((s, i) => (
              <button
                key={i}
                onClick={i === 1 ? onClose : undefined}
                style={{
                  width: '18px', height: '16px',
                  background: dsTheme.chromeLight,
                  border: '2px solid',
                  borderColor: bevel,
                  fontSize: '9px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  color: dsTheme.chromeDark,
                  fontWeight: 'bold',
                }}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Menu bar */}
        <div style={{
          height: '22px',
          background: dsTheme.surfaceSolid,
          borderBottom: `1px solid ${dsTheme.bevelDark}`,
          display: 'flex', alignItems: 'center',
          paddingLeft: '4px',
          fontSize: '11px',
          fontFamily: '"Space Mono", monospace',
          flexShrink: 0,
        }}>
          {['File', 'View', 'Help'].map(m => (
            <button key={m} style={{
              padding: '0 8px', height: '20px',
              background: 'transparent', border: 'none',
              cursor: 'pointer', fontSize: '11px',
              fontFamily: '"Space Mono", monospace',
              color: dsTheme.text,
            }}>{m}</button>
          ))}
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-auto"
          style={{
            border: '2px solid',
            borderColor: bevelIn,
            margin: '4px',
            background: dsTheme.surface,
            backdropFilter: dsTheme.blur,
          }}
        >
          {children}
        </div>

        {/* Status bar */}
        <div style={{
          height: '20px',
          background: dsTheme.surfaceSolid,
          borderTop: `1px solid ${dsTheme.bevelDark}`,
          display: 'flex', alignItems: 'center',
          paddingLeft: '8px',
          fontFamily: '"Space Mono", monospace',
          fontSize: '10px',
          color: dsTheme.textMuted,
          flexShrink: 0,
        }}>
          Ready
        </div>
      </div>
    </>
  );
}
