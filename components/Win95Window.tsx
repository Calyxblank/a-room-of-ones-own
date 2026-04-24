'use client';
import React, { useState, useRef, useCallback } from 'react';
import type { DSTheme } from '../lib/design-system';
import { useIsMobile } from '../hooks/useIsMobile';

interface Win95WindowProps {
  title: string;
  icon?: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  height?: string;
  defaultX?: number;
  defaultY?: number;
  dsTheme: DSTheme;
}

export default function Win95Window({
  title, icon = '🖥', onClose, children,
  width = '680px', height = '520px',
  defaultX = 60, defaultY = 40,
  dsTheme,
}: Win95WindowProps) {
  const isMobile = useIsMobile();
  const [pos, setPos] = useState({ x: defaultX, y: defaultY });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, wx: 0, wy: 0 });
  const winRef = useRef<HTMLDivElement>(null);

  const onTitleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMobile) return;
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
  }, [isMobile, pos]);

  const bevel = `${dsTheme.bevelLight} ${dsTheme.bevelDark} ${dsTheme.bevelDark} ${dsTheme.bevelLight}`;
  const bevelIn = `${dsTheme.bevelDark} ${dsTheme.bevelLight} ${dsTheme.bevelLight} ${dsTheme.bevelDark}`;

  const safeX = typeof window !== 'undefined'
    ? Math.max(0, Math.min(pos.x, window.innerWidth - 400))
    : pos.x;
  const safeY = typeof window !== 'undefined'
    ? Math.max(0, Math.min(pos.y, window.innerHeight - 300))
    : pos.y;

  const mobileW = `min(${width}, 92vw)`;
  const mobileH = `min(${height}, 75dvh)`;

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
        className="fixed z-50 flex flex-col"
        style={isMobile ? {
          width: mobileW,
          height: mobileH,
          left: '50%',
          top: '6dvh',
          transform: 'translateX(-50%)',
          cursor: 'default',
          border: '2px solid', borderColor: bevel,
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: `3px 3px 0 ${dsTheme.chromeDark}, 0 8px 32px rgba(0,0,0,0.22)`,
          background: dsTheme.glass,
          backdropFilter: dsTheme.blur,
          WebkitBackdropFilter: dsTheme.blur,
        } : {
          width: `min(${width}, 96vw)`,
          height: `min(${height}, 90vh)`,
          left: safeX,
          top: safeY,
          cursor: dragging ? 'grabbing' : 'default',
          border: '2px solid', borderColor: bevel,
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: `3px 3px 0 ${dsTheme.chromeDark}, 0 8px 32px rgba(0,0,0,0.22)`,
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
            padding: isMobile ? '8px 10px' : '3px 6px',
            cursor: isMobile ? 'default' : 'grab',
            minHeight: isMobile ? '44px' : '26px',
          }}
          onMouseDown={onTitleMouseDown}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            color: dsTheme.titleText,
            fontSize: isMobile ? '14px' : '11px',
            fontFamily: '"Space Mono", monospace',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
          }}>
            <span style={{ fontSize: isMobile ? '18px' : '13px' }}>{icon}</span>
            <span>{title}</span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['□', '✕'] as const).map((s, i) => (
              <button
                key={i}
                onClick={i === 1 ? onClose : undefined}
                style={{
                  width: isMobile ? '36px' : '18px',
                  height: isMobile ? '36px' : '16px',
                  background: dsTheme.chromeLight,
                  border: '2px solid', borderColor: bevel,
                  fontSize: isMobile ? '14px' : '9px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  color: dsTheme.chromeDark,
                  fontWeight: 'bold',
                  borderRadius: isMobile ? '4px' : undefined,
                }}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-auto"
          style={{
            border: `2px solid ${bevelIn}`,
            margin: '4px',
            background: dsTheme.surface,
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
