'use client';
import React, { useState, useRef, useCallback } from 'react';

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
  fullscreenMobile?: boolean;
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
  fullscreenMobile = true,
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Window */}
      <div
        ref={winRef}
        className={`fixed z-50 flex flex-col ${fullscreenMobile ? 'sm:w-auto sm:h-auto w-full h-full sm:rounded-none' : ''} ${className}`}
        style={{
          width: `min(${width}, 96vw)`,
          height: `min(${height}, 90vh)`,
          left: window.innerWidth < 640 ? 0 : Math.max(0, Math.min(pos.x, window.innerWidth - 400)),
          top: window.innerWidth < 640 ? 0 : Math.max(0, Math.min(pos.y, window.innerHeight - 300)),
          cursor: dragging ? 'grabbing' : 'default',
          /* Win95 glass border */
          border: '2px solid',
          borderColor: '#ffffff #404040 #404040 #ffffff',
          boxShadow: '2px 2px 0 #000000, inset 1px 1px 0 #dfdfdf',
          background: 'rgba(192, 192, 192, 0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-2 py-1 select-none flex-shrink-0"
          style={{
            background: 'linear-gradient(to right, #000080, #1084d0)',
            cursor: window.innerWidth >= 640 ? 'grab' : 'default',
            minHeight: '28px',
          }}
          onMouseDown={onTitleMouseDown}
        >
          <div className="flex items-center gap-1" style={{ color: 'white', fontSize: '12px', fontFamily: '"Press Start 2P", monospace', textShadow: '1px 1px 0 #000040' }}>
            <span style={{ fontSize: '14px' }}>{icon}</span>
            <span className="truncate max-w-xs">{title}</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onClose}
              style={{
                width: '18px', height: '18px',
                background: 'rgba(192,192,192,0.9)',
                border: '1px solid',
                borderColor: '#ffffff #404040 #404040 #ffffff',
                fontSize: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                fontWeight: 'bold',
                flexShrink: 0,
              }}
            >✕</button>
          </div>
        </div>

        {/* Menu bar */}
        <div
          className="flex items-center px-2 flex-shrink-0"
          style={{
            height: '22px',
            background: 'rgba(192,192,192,0.7)',
            borderBottom: '1px solid #808080',
            fontSize: '11px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <button className="px-2 hover:bg-blue-700 hover:text-white rounded-none" style={{ padding: '0 6px', height: '20px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11px' }}>File</button>
          <button className="px-2 hover:bg-blue-700 hover:text-white" style={{ padding: '0 6px', height: '20px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11px' }}>View</button>
          <button className="px-2 hover:bg-blue-700 hover:text-white" style={{ padding: '0 6px', height: '20px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11px' }}>Help</button>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-auto"
          style={{
            border: '2px solid',
            borderColor: '#808080 #ffffff #ffffff #808080',
            margin: '4px',
            background: 'rgba(255,255,255,0.6)',
          }}
        >
          {children}
        </div>

        {/* Status bar */}
        <div
          className="flex items-center px-2 flex-shrink-0"
          style={{
            height: '20px',
            background: 'rgba(192,192,192,0.7)',
            borderTop: '1px solid #808080',
            fontFamily: '"VT323", monospace',
            fontSize: '13px',
            color: '#404040',
          }}
        >
          Ready
        </div>
      </div>
    </>
  );
}
