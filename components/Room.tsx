'use client';
import React, { useEffect, useRef, useState } from 'react';
import type { TimeTheme, TimeOfDay, ActivePanel, RoomPhoto } from '../types';

interface RoomProps {
  theme: TimeTheme;
  timeOfDay: TimeOfDay;
  onOpen: (panel: ActivePanel) => void;
  reduceAnimations: boolean;
}

// morning image covers both morning and afternoon (same daylight)
const ROOM_IMAGES: Record<TimeOfDay, string> = {
  dawn:      '/room-dawn.jpg',
  morning:   '/room-morning.jpg',
  afternoon: '/room-morning.jpg',
  night:     '/room-night.jpg',
};

// Subtle overlay only for afternoon (same image as morning, slight blush tint to differentiate)
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

export default function Room({ theme, timeOfDay, onOpen, reduceAnimations }: RoomProps) {
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
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        fontFamily: '"Press Start 2P", monospace',
        backgroundImage: `url(${ROOM_IMAGES[timeOfDay]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: reduceAnimations ? 'none' : 'background-image 0s',
        imageRendering: 'pixelated',
      }}
    >
      {/* Afternoon tint (differentiates from morning, same image) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: OVERLAY[timeOfDay],
        pointerEvents: 'none',
        transition: reduceAnimations ? 'none' : 'background 1.5s ease',
      }} />

      {/* ── Hidden file inputs for photo frames ── */}
      {fileRefs.map((ref, i) => (
        <input
          key={i}
          ref={ref}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(i, f); e.target.value = ''; }}
        />
      ))}

      {/* ── Photo Frame 0 — small landscape painting, top-left wall ── */}
      <PhotoFrame
        photo={photos[0]}
        style={{ position: 'absolute', left: '1.5%', top: '4%', width: '10%', height: '17%' }}
        onUpload={() => fileRefs[0].current?.click()}
        onRemove={() => removePhoto(0)}
        reduceAnimations={reduceAnimations}
      />

      {/* ── Photo Frame 1 — large landscape painting, centre-top wall ── */}
      <PhotoFrame
        photo={photos[1]}
        style={{ position: 'absolute', left: '27%', top: '1%', width: '16%', height: '23%' }}
        onUpload={() => fileRefs[1].current?.click()}
        onRemove={() => removePhoto(1)}
        reduceAnimations={reduceAnimations}
      />

      {/* ── Photo Frame 2 — vinyl posters area, wall above turntable ── */}
      <PhotoFrame
        photo={photos[2]}
        style={{ position: 'absolute', left: '44%', top: '5%', width: '9%', height: '17%' }}
        onUpload={() => fileRefs[2].current?.click()}
        onRemove={() => removePhoto(2)}
        reduceAnimations={reduceAnimations}
      />

      {/* ── Window / French doors — left side ── */}
      <Hotspot
        onClick={() => onOpen('window')}
        label="Window"
        emoji="🪟"
        style={{ position: 'absolute', left: '2%', top: '7%', width: '17%', height: '79%' }}
        reduceAnimations={reduceAnimations}
      />

      {/* ── Turntable — on the sideboard, centre-left ── */}
      <Hotspot
        onClick={() => onOpen('turntable')}
        label="Turntable"
        emoji="🎵"
        style={{ position: 'absolute', left: '34%', top: '20%', width: '20%', height: '22%' }}
        reduceAnimations={reduceAnimations}
      />

      {/* ── Desk / Notes — bed area with open book ── */}
      <Hotspot
        onClick={() => onOpen('desk')}
        label="Desk"
        emoji="📝"
        style={{ position: 'absolute', left: '47%', top: '37%', width: '31%', height: '34%' }}
        reduceAnimations={reduceAnimations}
      />

      {/* Help hint */}
      <div style={{
        position: 'absolute', bottom: '8px', left: '8px',
        background: 'rgba(0,0,0,0.60)',
        color: 'rgba(255,255,255,0.85)',
        fontSize: '8px',
        fontFamily: '"Press Start 2P", monospace',
        padding: '5px 8px',
        pointerEvents: 'none',
        border: '1px solid rgba(255,255,255,0.15)',
        lineHeight: '1.8',
      }}>
        Click objects to interact
      </div>
    </div>
  );
}

/* ── Photo Frame ── */
function PhotoFrame({
  photo, style, onUpload, onRemove, reduceAnimations,
}: {
  photo?: RoomPhoto;
  style: React.CSSProperties;
  onUpload: () => void;
  onRemove: () => void;
  reduceAnimations: boolean;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      style={{
        ...style,
        cursor: 'pointer',
        outline: hovered ? '2px solid rgba(255,255,100,0.75)' : '2px solid transparent',
        outlineOffset: '2px',
        transition: reduceAnimations ? 'none' : 'outline 0.12s',
        zIndex: 5,
        overflow: 'hidden',
        // Transparent by default — just an invisible click zone over the painting
        background: photo ? undefined : 'transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onUpload}
    >
      {photo && (
        <img
          src={photo.dataUrl}
          alt="Photo frame"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}

      {/* Hover overlay */}
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0,
          background: photo ? 'rgba(0,0,0,0.40)' : 'rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '4px',
        }}>
          <span style={{ fontSize: '16px' }}>{photo ? '📷' : '🖼'}</span>
          <span style={{ fontSize: '7px', color: 'white', fontFamily: '"Press Start 2P", monospace', textShadow: '1px 1px 2px #000' }}>
            {photo ? 'Change' : 'Upload photo'}
          </span>
          {photo && (
            <button
              onClick={e => { e.stopPropagation(); onRemove(); }}
              style={{ fontSize: '8px', background: 'rgba(180,0,0,0.85)', border: '1px solid #ff5555', color: 'white', cursor: 'pointer', padding: '2px 5px', marginTop: '2px' }}
            >✕ Remove</button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Hotspot (transparent click zone) ── */
function Hotspot({ onClick, label, emoji, style, reduceAnimations }: {
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
        outline: hovered ? '3px solid rgba(255,255,0,0.75)' : '3px solid transparent',
        outlineOffset: '3px',
        transition: reduceAnimations ? 'none' : 'outline 0.12s',
        zIndex: 5,
        background: 'transparent',
      }}
    >
      {hovered && (
        <div style={{
          position: 'absolute',
          bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: '6px',
          background: 'rgba(0,0,0,0.88)',
          color: 'white',
          fontSize: '9px',
          fontFamily: '"Press Start 2P", monospace',
          padding: '4px 10px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 100,
          border: '1px solid rgba(255,255,255,0.25)',
        }}>
          {emoji} {label}
        </div>
      )}
    </div>
  );
}
