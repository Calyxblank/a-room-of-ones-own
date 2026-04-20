'use client';
import React, { useEffect, useRef, useState } from 'react';
import type { TimeTheme, TimeOfDay, ActivePanel, RoomPhoto } from '../types';

interface RoomProps {
  theme: TimeTheme;
  timeOfDay: TimeOfDay;
  onOpen: (panel: ActivePanel) => void;
  reduceAnimations: boolean;
}

function compressImage(dataUrl: string, maxPx = 400): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.src = dataUrl;
  });
}

export default function Room({ theme, timeOfDay, onOpen, reduceAnimations }: RoomProps) {
  const isNight = timeOfDay === 'night';
  const isMorning = timeOfDay === 'morning';
  const isDawn = timeOfDay === 'dawn';

  // Photo frames state
  const [photos, setPhotos] = useState<Record<number, RoomPhoto>>({});
  const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    fetch('/api/photos')
      .then(r => r.json())
      .then(data => setPhotos(data.photos ?? {}))
      .catch(() => {});
    // Poll every 30s so others' uploads appear
    const id = setInterval(() => {
      fetch('/api/photos')
        .then(r => r.json())
        .then(data => setPhotos(data.photos ?? {}))
        .catch(() => {});
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  const handlePhotoUpload = async (frame: number, file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const raw = e.target?.result as string;
      const compressed = await compressImage(raw);
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frame, dataUrl: compressed }),
      });
      if (res.ok) {
        setPhotos(prev => ({ ...prev, [frame]: { id: String(Date.now()), dataUrl: compressed, frame, uploadedAt: Date.now() } }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = async (frame: number) => {
    await fetch('/api/photos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frame }),
    });
    setPhotos(prev => { const next = { ...prev }; delete next[frame]; return next; });
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        imageRendering: 'pixelated',
        fontFamily: '"Press Start 2P", monospace',
      }}
    >
      {/* === WALL === */}
      <div style={{
        position: 'absolute',
        inset: 0,
        bottom: '38%',
        background: theme.wallColor,
        transition: reduceAnimations ? 'none' : 'background 2s ease',
      }} />

      {/* === FLOOR === */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        height: '38%',
        background: theme.floorColor,
        transition: reduceAnimations ? 'none' : 'background 2s ease',
      }} />

      {/* === RUG === */}
      <div style={{
        position: 'absolute',
        left: '18%', right: '18%',
        bottom: '2%',
        height: '28%',
        background: isNight
          ? 'radial-gradient(ellipse at center, #2a1200 0%, #1a0a00 60%, #100600 100%)'
          : 'radial-gradient(ellipse at center, #c0392b 0%, #922b21 40%, #7b241c 60%, #6e2c0e 100%)',
        borderRadius: '8px',
        border: `2px solid ${isNight ? '#3a1800' : '#922b21'}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        transition: reduceAnimations ? 'none' : 'background 2s',
      }}>
        {/* Rug inner pattern */}
        <div style={{
          position: 'absolute',
          inset: '10%',
          border: `2px solid ${isNight ? '#5a2800' : '#e74c3c'}`,
          borderRadius: '4px',
          opacity: 0.5,
        }} />
        <div style={{
          position: 'absolute',
          inset: '22%',
          border: `2px solid ${isNight ? '#5a2800' : '#e74c3c'}`,
          borderRadius: '4px',
          opacity: 0.3,
        }} />
      </div>

      {/* === WINDOW (interactive) === */}
      <Hotspot
        onClick={() => onOpen('window')}
        label="Window"
        emoji="🪟"
        style={{
          position: 'absolute',
          left: '6%', top: '8%',
          width: '16%', height: '34%',
        }}
        reduceAnimations={reduceAnimations}
      >
        {/* Sky inside window */}
        <div style={{
          position: 'absolute',
          inset: '8px',
          background: `linear-gradient(180deg, ${theme.skyTop} 0%, ${theme.skyBottom} 100%)`,
          transition: reduceAnimations ? 'none' : 'background 2s',
          overflow: 'hidden',
        }}>
          {isNight && (
            <>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  left: `${10 + i * 12}%`, top: `${8 + (i % 3) * 20}%`,
                  width: `${1 + (i % 2)}px`, height: `${1 + (i % 2)}px`,
                  borderRadius: '50%', background: 'rgba(255,200,120,0.8)',
                  opacity: 0.8,
                }} />
              ))}
              {/* Amber moon */}
              <div style={{
                position: 'absolute', top: '15%', right: '20%',
                width: '14px', height: '14px',
                borderRadius: '50%', background: '#c87a00',
                boxShadow: '0 0 10px rgba(200,120,0,0.7)',
              }} />
            </>
          )}
          {!isNight && (
            <>
              <div style={{
                position: 'absolute',
                top: isMorning ? '55%' : isDawn ? '65%' : '20%',
                left: isMorning ? '20%' : isDawn ? '25%' : '55%',
                width: '20px', height: '20px',
                borderRadius: '50%',
                background: isDawn ? '#ff8c50' : timeOfDay === 'afternoon' ? '#f4a0b4' : '#ffd700',
                boxShadow: isDawn
                  ? '0 0 14px rgba(255,140,80,0.65)'
                  : `0 0 12px rgba(255,215,0,0.5)`,
              }} />
              <div style={{ position: 'absolute', bottom: '20%', left: '10%', right: '5%', height: '30%', background: 'rgba(34,139,34,0.4)', borderRadius: '40% 40% 0 0' }} />
            </>
          )}
        </div>
        {/* Window cross frame */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '4px', background: '#6b4226', transform: 'translateY(-50%)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '4px', background: '#6b4226', transform: 'translateX(-50%)' }} />
        {/* Frame border */}
        <div style={{ position: 'absolute', inset: 0, border: '8px solid #6b4226', boxSizing: 'border-box', pointerEvents: 'none' }} />
        {/* Curtains */}
        <div style={{
          position: 'absolute', top: '-4px', left: '-6px', bottom: '-4px', width: '22%',
          background: isNight ? '#2a1500' : isDawn ? '#c06030' : timeOfDay === 'morning' ? '#6b8f5a' : '#c06070',
          borderRadius: '0 0 50% 0',
          opacity: 0.85,
        }} />
        <div style={{
          position: 'absolute', top: '-4px', right: '-6px', bottom: '-4px', width: '22%',
          background: isNight ? '#2a1500' : isDawn ? '#c06030' : timeOfDay === 'morning' ? '#6b8f5a' : '#c06070',
          borderRadius: '0 0 0 50%',
          opacity: 0.85,
        }} />
      </Hotspot>

      {/* === PHOTO FRAME 0 (wall, left-center) === */}
      {fileRefs[0] && (
        <input
          ref={fileRefs[0]}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(0, f); e.target.value = ''; }}
        />
      )}
      <PhotoFrame
        photo={photos[0]}
        style={{ position: 'absolute', left: '28%', top: '6%', width: '10%', height: '16%' }}
        onUpload={() => fileRefs[0].current?.click()}
        onRemove={() => removePhoto(0)}
        reduceAnimations={reduceAnimations}
        label="Photo Frame"
      />

      {/* === PHOTO FRAME 1 (wall, center) === */}
      {fileRefs[1] && (
        <input
          ref={fileRefs[1]}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(1, f); e.target.value = ''; }}
        />
      )}
      <PhotoFrame
        photo={photos[1]}
        style={{ position: 'absolute', left: '41%', top: '5%', width: '7%', height: '12%' }}
        onUpload={() => fileRefs[1].current?.click()}
        onRemove={() => removePhoto(1)}
        reduceAnimations={reduceAnimations}
        label="Photo Frame"
      />

      {/* === PHOTO FRAME 2 (wall, right of bed) === */}
      {fileRefs[2] && (
        <input
          ref={fileRefs[2]}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(2, f); e.target.value = ''; }}
        />
      )}
      <PhotoFrame
        photo={photos[2]}
        style={{ position: 'absolute', left: '51%', top: '7%', width: '8%', height: '14%' }}
        onUpload={() => fileRefs[2].current?.click()}
        onRemove={() => removePhoto(2)}
        reduceAnimations={reduceAnimations}
        label="Photo Frame"
      />

      {/* === BOOKSHELF (decorative) === */}
      <div style={{
        position: 'absolute',
        right: '5%', top: '4%',
        width: '14%', height: '50%',
        background: '#7b5e3a',
        border: '3px solid #5c3317',
        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.4)',
      }}>
        {/* Shelves */}
        {[0, 1, 2, 3].map(row => (
          <div key={row} style={{
            position: 'absolute',
            left: 0, right: 0,
            top: `${5 + row * 24}%`,
            height: '3px',
            background: '#5c3317',
          }} />
        ))}
        {/* Books */}
        {[
          ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6'],
          ['#1abc9c','#e67e22','#e91e63','#00bcd4'],
          ['#ff5722','#795548','#607d8b','#8bc34a','#ff9800'],
          ['#673ab7','#f44336','#009688'],
        ].map((colors, row) => (
          <div key={row} style={{
            position: 'absolute',
            left: '4px', right: '4px',
            top: `${8 + row * 24}%`,
            height: '20%',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '2px',
          }}>
            {colors.map((c, i) => (
              <div key={i} style={{
                width: `${8 + Math.random() * 6}px`,
                height: `${60 + Math.random() * 35}%`,
                background: isNight ? `${c}88` : c,
                borderRadius: '1px 1px 0 0',
                flexShrink: 0,
                border: '1px solid rgba(0,0,0,0.2)',
              }} />
            ))}
          </div>
        ))}
      </div>

      {/* === BED (decorative) === */}
      <div style={{
        position: 'absolute',
        left: '38%', top: '32%',
        width: '28%', height: '24%',
      }}>
        {/* Headboard */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 0, height: '30%',
          background: '#5c3317', border: '2px solid #3d2008',
          borderRadius: '4px 4px 0 0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }} />
        {/* Mattress */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '20%', bottom: 0,
          background: '#f5e6d3', border: '2px solid #d4b896',
        }}>
          {/* Blanket */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '30%', bottom: 0,
            background: isNight
              ? 'linear-gradient(135deg, #2c3e50, #34495e)'
              : 'linear-gradient(135deg, #c0392b, #922b21)',
            borderRadius: '0 0 2px 2px',
          }}>
            <div style={{ position: 'absolute', top: '20%', left: '10%', right: '10%', height: '20%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
          </div>
          {/* Pillows */}
          <div style={{ position: 'absolute', top: '5%', left: '8%', width: '35%', height: '28%', background: '#fff9f0', border: '1px solid #e0d0b0', borderRadius: '3px', boxShadow: '1px 1px 3px rgba(0,0,0,0.2)' }} />
          <div style={{ position: 'absolute', top: '5%', right: '8%', width: '35%', height: '28%', background: '#fff9f0', border: '1px solid #e0d0b0', borderRadius: '3px', boxShadow: '1px 1px 3px rgba(0,0,0,0.2)' }} />
        </div>
      </div>

      {/* === PLANT (decorative, left corner) === */}
      <div style={{ position: 'absolute', left: '2%', bottom: '35%', width: '5%' }}>
        <div style={{
          width: '80%', height: '60px',
          background: 'linear-gradient(180deg, #2ecc71, #27ae60)',
          borderRadius: '50% 50% 20% 20%',
          margin: '0 auto',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '10%', left: '15%', width: '30%', height: '40%', background: '#27ae60', borderRadius: '50%', opacity: 0.6 }} />
        </div>
        <div style={{
          width: '40%', height: '24px',
          background: '#7b5e3a',
          margin: '0 auto',
          border: '2px solid #5c3317',
          borderRadius: '0 0 2px 2px',
        }} />
      </div>

      {/* === DESK (interactive) === */}
      <Hotspot
        onClick={() => onOpen('desk')}
        label="Desk"
        emoji="📝"
        style={{
          position: 'absolute',
          left: '6%', bottom: '32%',
          width: '26%', height: '20%',
        }}
        reduceAnimations={reduceAnimations}
      >
        {/* Desk surface */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: '30%',
          background: '#a07850',
          border: '3px solid #7b5e3a',
          boxShadow: '0 3px 0 #5c3317',
        }}>
          {/* Items on desk */}
          <div style={{ position: 'absolute', top: '10%', left: '8%', width: '18%', height: '70%', background: '#fef08a', border: '1px solid #ca8a04', transform: 'rotate(-5deg)' }} />
          <div style={{ position: 'absolute', top: '5%', left: '30%', width: '12%', height: '80%', background: '#93c5fd', border: '1px solid #3b82f6', transform: 'rotate(2deg)' }} />
          {/* Lamp */}
          <div style={{ position: 'absolute', top: '-80%', right: '15%', width: '8%', paddingBottom: '0' }}>
            <div style={{ width: '100%', height: '40px', background: '#f4d03f', borderRadius: '50% 50% 0 0', border: '2px solid #d4ac0d', boxShadow: isNight ? '0 0 20px rgba(255,220,0,0.6)' : 'none' }} />
            <div style={{ width: '4px', height: '50px', background: '#888', margin: '0 auto', border: '1px solid #666' }} />
          </div>
        </div>
        {/* Desk legs */}
        <div style={{ position: 'absolute', bottom: 0, left: '5%', width: '6%', top: '28%', background: '#7b5e3a', border: '1px solid #5c3317' }} />
        <div style={{ position: 'absolute', bottom: 0, right: '5%', width: '6%', top: '28%', background: '#7b5e3a', border: '1px solid #5c3317' }} />
      </Hotspot>

      {/* === TURNTABLE (interactive) === */}
      <Hotspot
        onClick={() => onOpen('turntable')}
        label="Turntable"
        emoji="🎵"
        style={{
          position: 'absolute',
          right: '22%', bottom: '36%',
          width: '14%', height: '18%',
        }}
        reduceAnimations={reduceAnimations}
      >
        {/* Stand/table */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: '10%', right: '10%', height: '30%',
          background: '#7b5e3a', border: '2px solid #5c3317',
        }} />
        {/* Record player body */}
        <div style={{
          position: 'absolute',
          top: '10%', left: '5%', right: '5%', height: '55%',
          background: '#222', border: '2px solid #111',
          borderRadius: '3px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}>
          {/* Record */}
          <div style={{
            position: 'absolute',
            top: '8%', left: '15%',
            width: '50%', paddingBottom: '50%',
            borderRadius: '50%',
            background: 'conic-gradient(#111, #333, #111, #333, #111)',
            border: '2px solid #000',
            boxShadow: '0 0 6px rgba(0,0,0,0.8)',
            animation: reduceAnimations ? 'none' : 'spin 4s linear infinite',
          }}>
            <div style={{
              position: 'absolute',
              top: '35%', left: '35%', right: '35%', bottom: '35%',
              borderRadius: '50%',
              background: '#c0392b',
            }} />
          </div>
          {/* Tonearm */}
          <div style={{
            position: 'absolute',
            top: '5%', right: '10%',
            width: '3px', height: '45%',
            background: '#aaa',
            transformOrigin: 'top center',
            transform: 'rotate(25deg)',
            borderRadius: '0 0 2px 2px',
          }} />
        </div>
      </Hotspot>

      {/* === PLANT (right corner, decorative) === */}
      <div style={{ position: 'absolute', right: '3%', bottom: '36%', width: '6%' }}>
        <div style={{ width: '85%', height: '50px', background: 'linear-gradient(180deg, #27ae60, #1e8449)', borderRadius: '50%', margin: '0 auto', boxShadow: '0 3px 6px rgba(0,0,0,0.3)' }}>
          <div style={{ position: 'absolute', top: '15%', right: '10%', width: '35%', height: '35%', background: '#1e8449', borderRadius: '50%', opacity: 0.5 }} />
        </div>
        <div style={{ width: '50%', height: '20px', background: '#7b5e3a', margin: '0 auto', border: '2px solid #5c3317', borderRadius: '0 0 2px 2px' }} />
      </div>

      {/* === TIME OVERLAY (ambient light) === */}
      <div style={{
        position: 'absolute', inset: 0,
        background: theme.overlayColor,
        pointerEvents: 'none',
        transition: reduceAnimations ? 'none' : 'background 2s ease',
      }} />

      {/* === AMBIENT LIGHT (window glow) === */}
      {!reduceAnimations && (
        <div style={{
          position: 'absolute',
          left: '6%', top: '8%',
          width: '16%', height: '34%',
          background: theme.ambientLight,
          filter: 'blur(30px)',
          pointerEvents: 'none',
          transition: 'background 2s ease',
        }} />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* Interactive photo frame */
function PhotoFrame({
  photo,
  style,
  onUpload,
  onRemove,
  reduceAnimations,
  label,
}: {
  photo?: RoomPhoto;
  style: React.CSSProperties;
  onUpload: () => void;
  onRemove: () => void;
  reduceAnimations: boolean;
  label: string;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      style={{
        ...style,
        border: '4px solid #5c3317',
        boxShadow: '2px 2px 6px rgba(0,0,0,0.5)',
        background: '#8b7355',
        cursor: 'pointer',
        outline: hovered ? '3px solid rgba(255,255,0,0.8)' : '3px solid transparent',
        outlineOffset: '2px',
        transition: reduceAnimations ? 'none' : 'outline 0.15s',
        zIndex: 5,
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onUpload}
    >
      {photo ? (
        <>
          <img
            src={photo.dataUrl}
            alt="Room photo"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {hovered && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.45)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '4px',
            }}>
              <div style={{ fontSize: '10px', color: 'white', fontFamily: '"Press Start 2P", monospace', textAlign: 'center', lineHeight: '1.5' }}>
                📷 Change
              </div>
              <button
                onClick={e => { e.stopPropagation(); onRemove(); }}
                style={{ fontSize: '9px', background: 'rgba(200,0,0,0.8)', border: '1px solid #ff4444', color: 'white', cursor: 'pointer', padding: '2px 5px' }}
              >✕ Remove</button>
            </div>
          )}
        </>
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
          transition: reduceAnimations ? 'none' : 'background 0.15s',
          gap: '3px',
        }}>
          <div style={{ fontSize: '14px' }}>📷</div>
          {hovered && (
            <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.9)', fontFamily: '"Press Start 2P", monospace', textAlign: 'center', lineHeight: '1.6' }}>
              Upload
            </div>
          )}
        </div>
      )}

      {/* Hover label */}
      {hovered && !photo && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: '4px', background: 'rgba(0,0,0,0.85)', color: 'white',
          fontSize: '9px', fontFamily: '"Press Start 2P", monospace',
          padding: '4px 8px', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 100,
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          🖼 {label}
        </div>
      )}
    </div>
  );
}

/* Clickable hotspot wrapper */
function Hotspot({
  onClick,
  label,
  emoji,
  style,
  children,
  reduceAnimations,
}: {
  onClick: () => void;
  label: string;
  emoji: string;
  style: React.CSSProperties;
  children?: React.ReactNode;
  reduceAnimations: boolean;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...style,
        cursor: 'pointer',
        outline: hovered ? '3px solid rgba(255,255,0,0.8)' : '3px solid transparent',
        outlineOffset: '2px',
        transition: reduceAnimations ? 'none' : 'outline 0.15s',
        zIndex: 5,
      }}
    >
      {children}
      {/* Hover label */}
      {hovered && (
        <div style={{
          position: 'absolute',
          bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: '4px',
          background: 'rgba(0,0,0,0.85)',
          color: 'white',
          fontSize: '9px',
          fontFamily: '"Press Start 2P", monospace',
          padding: '4px 8px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 100,
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          {emoji} {label}
        </div>
      )}
    </div>
  );
}
