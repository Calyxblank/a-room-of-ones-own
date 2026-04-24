'use client';
import React, { useEffect, useRef, useState } from 'react';
import type { TimeTheme, TimeOfDay, ActivePanel, RoomPhoto } from '../types';
import type { DSTheme } from '../lib/design-system';
import { useIsMobile } from '../hooks/useIsMobile';

interface RoomProps {
  theme: TimeTheme;
  timeOfDay: TimeOfDay;
  dsTheme: DSTheme;
  onOpen: (panel: ActivePanel) => void;
  reduceAnimations: boolean;
}

const ROOM_IMAGES: Record<TimeOfDay, string> = {
  dawn:      '/rooms/dawn.jpg',
  morning:   '/rooms/morning.jpg',
  afternoon: '/rooms/afternoon.jpg',
  night:     '/rooms/night.jpg',
};

const OVERLAY: Record<TimeOfDay, string> = {
  dawn:      'rgba(0,0,0,0)',
  morning:   'rgba(0,0,0,0)',
  afternoon: 'rgba(200,100,120,0.10)',
  night:     'rgba(0,0,0,0)',
};

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

export default function Room({ timeOfDay, dsTheme, onOpen, reduceAnimations }: RoomProps) {
  const isMobile = useIsMobile();
  const [photos, setPhotos] = useState<Record<number, RoomPhoto>>({});
  const fileRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    const load = () =>
      fetch('/api/photos').then(r => r.json()).then(d => setPhotos(d.photos ?? {})).catch(() => {});
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  const handlePhotoUpload = async (frame: number, file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const compressed = await compressImage(e.target?.result as string);
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frame, dataUrl: compressed }),
      });
      if (res.ok) setPhotos(prev => ({ ...prev, [frame]: { id: String(Date.now()), dataUrl: compressed, frame, uploadedAt: Date.now() } }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = async (frame: number) => {
    await fetch('/api/photos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ frame }) });
    setPhotos(prev => { const next = { ...prev }; delete next[frame]; return next; });
  };

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      backgroundImage: `url(${ROOM_IMAGES[timeOfDay]})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      imageRendering: 'pixelated',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: OVERLAY[timeOfDay],
        pointerEvents: 'none',
        transition: reduceAnimations ? 'none' : 'background 1.5s ease',
      }} />

      {fileRefs.map((ref, i) => (
        <input
          key={i} ref={ref} type="file" accept="image/*"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(i, f); e.target.value = ''; }}
        />
      ))}

      <PhotoFrame photo={photos[0]} dsTheme={dsTheme}
        style={{ position: 'absolute', left: '1.5%', top: '4%', width: '10%', height: '17%' }}
        onUpload={() => fileRefs[0].current?.click()} onRemove={() => removePhoto(0)} reduceAnimations={reduceAnimations} />

      <PhotoFrame photo={photos[1]} dsTheme={dsTheme}
        style={{ position: 'absolute', left: '27%', top: '1%', width: '16%', height: '23%' }}
        onUpload={() => fileRefs[1].current?.click()} onRemove={() => removePhoto(1)} reduceAnimations={reduceAnimations} />

      <PhotoFrame photo={photos[2]} dsTheme={dsTheme}
        style={{ position: 'absolute', left: '44%', top: '5%', width: '9%', height: '17%' }}
        onUpload={() => fileRefs[2].current?.click()} onRemove={() => removePhoto(2)} reduceAnimations={reduceAnimations} />

      <Hotspot onClick={() => onOpen('window')} label="Window" emoji="🪟" dsTheme={dsTheme}
        style={{ position: 'absolute', left: '2%', top: '7%', width: '17%', height: '79%' }}
        reduceAnimations={reduceAnimations} />

      <Hotspot onClick={() => onOpen('turntable')} label="Turntable" emoji="🎵" dsTheme={dsTheme}
        style={{ position: 'absolute', left: '34%', top: '20%', width: '20%', height: '22%' }}
        reduceAnimations={reduceAnimations} />

      <Hotspot onClick={() => onOpen('desk')} label="Desk" emoji="📝" dsTheme={dsTheme}
        style={{ position: 'absolute', left: '47%', top: '37%', width: '31%', height: '34%' }}
        reduceAnimations={reduceAnimations} />

      <div style={{
        position: 'absolute', bottom: '8px', left: '8px',
        background: 'rgba(0,0,0,0.55)',
        color: 'rgba(255,255,255,0.85)',
        fontSize: isMobile ? '11px' : '9px',
        fontFamily: '"Space Mono", monospace',
        padding: isMobile ? '6px 10px' : '4px 8px',
        pointerEvents: 'none',
        border: '1px solid rgba(255,255,255,0.12)',
      }}>
        {isMobile ? 'Tap objects to interact' : 'Click objects to interact'}
      </div>
    </div>
  );
}

function PhotoFrame({ photo, style, dsTheme, onUpload, onRemove, reduceAnimations }: {
  photo?: RoomPhoto;
  style: React.CSSProperties;
  dsTheme: DSTheme;
  onUpload: () => void;
  onRemove: () => void;
  reduceAnimations: boolean;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      style={{
        ...style, cursor: 'pointer', zIndex: 5, overflow: 'hidden',
        outline: hovered ? `2px solid ${dsTheme.accent4}` : '2px solid transparent',
        outlineOffset: '2px',
        transition: reduceAnimations ? 'none' : 'outline 0.12s',
        background: photo ? undefined : 'transparent',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onUpload}
    >
      {photo && (
        <img src={photo.dataUrl} alt="Photo frame"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0,
          background: photo ? 'rgba(0,0,0,0.40)' : 'rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '4px',
        }}>
          <span style={{ fontSize: '16px' }}>{photo ? '📷' : '🖼'}</span>
          <span style={{ fontSize: '8px', color: 'white', fontFamily: '"Space Mono", monospace', textShadow: '1px 1px 2px #000' }}>
            {photo ? 'Change' : 'Upload photo'}
          </span>
          {photo && (
            <button
              onClick={e => { e.stopPropagation(); onRemove(); }}
              style={{ fontSize: '8px', background: 'rgba(180,0,0,0.85)', border: '1px solid #ff5555', color: 'white', cursor: 'pointer', padding: '2px 5px', marginTop: '2px', fontFamily: '"Space Mono", monospace' }}
            >✕ Remove</button>
          )}
        </div>
      )}
    </div>
  );
}

function Hotspot({ onClick, label, emoji, style, dsTheme, reduceAnimations }: {
  onClick: () => void;
  label: string;
  emoji: string;
  style: React.CSSProperties;
  dsTheme: DSTheme;
  reduceAnimations: boolean;
}) {
  const [active, setActive] = React.useState(false);
  const bevel = `${dsTheme.bevelLight} ${dsTheme.bevelDark} ${dsTheme.bevelDark} ${dsTheme.bevelLight}`;

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setActive(true);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setActive(false);
    onClick();
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => setActive(false)}
      style={{
        ...style, cursor: 'pointer', zIndex: 5, background: 'transparent',
        outline: active ? `3px solid ${dsTheme.accent4}` : '3px solid transparent',
        outlineOffset: '3px',
        transition: reduceAnimations ? 'none' : 'outline 0.12s',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {active && (
        <div style={{
          position: 'absolute',
          bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: '6px',
          background: dsTheme.surfaceSolid,
          color: dsTheme.text,
          fontSize: '10px',
          fontFamily: '"Space Mono", monospace',
          padding: '5px 12px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 100,
          border: '2px solid',
          borderColor: bevel,
          boxShadow: `2px 2px 0 ${dsTheme.chromeDark}`,
        }}>
          {emoji} {label}
        </div>
      )}
    </div>
  );
}
