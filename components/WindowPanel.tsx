'use client';
import React from 'react';
import type { TimeOfDay, TimeTheme } from '../types';

const CONTENT: Record<TimeOfDay, {
  heading: string;
  subheading: string;
  emoji: string;
  quote: string;
  quoteBy: string;
  suggestions: { icon: string; text: string }[];
  skyEmoji: string;
}> = {
  dawn: {
    heading: 'Golden Hour',
    subheading: 'The light is soft. Breathe it in.',
    emoji: '🌄',
    quote: 'Colors are the smiles of nature.',
    quoteBy: 'Leigh Hunt',
    suggestions: [
      { icon: '🎨', text: 'Watch the sky change color right now' },
      { icon: '📷', text: 'Take a photo before the light shifts' },
      { icon: '☕', text: 'A warm drink for the threshold hour' },
      { icon: '🌬️', text: 'Open a window, feel the air' },
      { icon: '📓', text: 'Jot one thought before the moment passes' },
    ],
    skyEmoji: '🌄',
  },
  morning: {
    heading: 'Good Morning',
    subheading: 'The world is fresh and full of possibility.',
    emoji: '🌿',
    quote: 'Every morning we are born again. What we do today matters most.',
    quoteBy: 'Buddha',
    suggestions: [
      { icon: '☕', text: 'Make your morning coffee or tea' },
      { icon: '📓', text: 'Write 3 things you\'re grateful for' },
      { icon: '🎵', text: 'Play an energetic playlist to start the day' },
      { icon: '🌿', text: 'Water your plants' },
      { icon: '📚', text: 'Read for 20 minutes before screens' },
    ],
    skyEmoji: '🌤',
  },
  afternoon: {
    heading: 'Good Afternoon',
    subheading: 'Deep work mode activated. Stay focused.',
    emoji: '🌸',
    quote: 'The secret of getting ahead is getting started.',
    quoteBy: 'Mark Twain',
    suggestions: [
      { icon: '🎯', text: 'Tackle your most important task first' },
      { icon: '💧', text: 'Stay hydrated — drink some water' },
      { icon: '🚶', text: 'Take a 10-minute walk to refresh' },
      { icon: '🎵', text: 'Lo-fi music for focus sessions' },
      { icon: '🍎', text: 'Healthy snack for sustained energy' },
    ],
    skyEmoji: '🌸',
  },
  night: {
    heading: 'Good Night',
    subheading: 'The world slows down. So should you.',
    emoji: '🌑',
    quote: 'The night is the hardest time to be alive and 4am knows all my secrets.',
    quoteBy: 'Poppy Z. Brite',
    suggestions: [
      { icon: '🌑', text: 'Dim your screens and blue light' },
      { icon: '☕', text: 'Herbal tea for sleep' },
      { icon: '📝', text: 'Write tomorrow\'s to-do list tonight' },
      { icon: '🎵', text: 'Chill ambient or ASMR sounds' },
      { icon: '🛌', text: 'Sleep at a consistent time tonight' },
    ],
    skyEmoji: '🌌',
  },
};

const SKY_STYLES: Record<TimeOfDay, React.CSSProperties> = {
  dawn:      { background: 'linear-gradient(180deg, #e8956d 0%, #f4b57a 50%, #ffd4a0 100%)' },
  morning:   { background: 'linear-gradient(180deg, #9dc8b0 0%, #c8e6d4 60%, #d4ecd4 100%)' },
  afternoon: { background: 'linear-gradient(180deg, #c9a8c8 0%, #e8c4d0 60%, #f5d4dc 100%)' },
  night:     { background: 'linear-gradient(180deg, #100900 0%, #1e1200 50%, #2a1a00 100%)' },
};

const STARS = Array.from({ length: 20 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 60,
  size: Math.random() * 2 + 1,
  delay: Math.random() * 3,
}));

export default function WindowPanel({ timeOfDay, theme }: { timeOfDay: TimeOfDay; theme: TimeTheme }) {
  const content = CONTENT[timeOfDay];
  const isNight = timeOfDay === 'night';
  const isDawn = timeOfDay === 'dawn';

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Sky view */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{ ...SKY_STYLES[timeOfDay], height: '160px' }}
      >
        {isNight && STARS.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              borderRadius: '50%',
              background: 'rgba(255,220,160,0.9)',
              animation: `twinkle ${2 + s.delay}s ease-in-out infinite`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}

        {!isNight && (
          <div style={{
            position: 'absolute',
            top: timeOfDay === 'morning' ? '40px' : isDawn ? '55px' : '20px',
            left: timeOfDay === 'morning' ? '20%' : timeOfDay === 'afternoon' ? '60%' : '25%',
            width: timeOfDay === 'afternoon' ? '48px' : '40px',
            height: timeOfDay === 'afternoon' ? '48px' : '40px',
            borderRadius: '50%',
            background: isDawn ? '#ff8c50' : timeOfDay === 'morning' ? '#ffd700' : '#f4a0b4',
            boxShadow: isDawn
              ? '0 0 30px rgba(255,140,80,0.6)'
              : timeOfDay === 'afternoon'
                ? '0 0 40px rgba(240,160,190,0.5)'
                : '0 0 20px rgba(255,215,0,0.5)',
          }} />
        )}

        {/* Clouds — softer tints per theme */}
        {!isNight && (
          <>
            <div style={{ position: 'absolute', top: '80px', left: '15%', width: '60px', height: '20px', borderRadius: '10px', background: isDawn ? 'rgba(255,200,160,0.7)' : 'rgba(255,255,255,0.75)' }} />
            <div style={{ position: 'absolute', top: '70px', left: '25%', width: '80px', height: '25px', borderRadius: '12px', background: isDawn ? 'rgba(255,210,170,0.6)' : 'rgba(255,255,255,0.65)' }} />
            <div style={{ position: 'absolute', top: '60px', right: '20%', width: '70px', height: '22px', borderRadius: '11px', background: 'rgba(255,255,255,0.55)' }} />
          </>
        )}

        {/* Midnight amber moon */}
        {isNight && (
          <div style={{
            position: 'absolute', top: '20px', right: '20%',
            width: '36px', height: '36px',
            borderRadius: '50%',
            background: '#c87a00',
            boxShadow: '0 0 24px rgba(200,120,0,0.6)',
          }} />
        )}

        {/* Window frame overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          border: '8px solid rgba(0,0,0,0.3)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
          fontSize: '14px', fontFamily: '"Press Start 2P", monospace',
          color: 'rgba(255,255,255,0.9)',
          textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
        }}>
          {content.skyEmoji} {content.heading}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Quote */}
        <div style={{
          background: 'rgba(0,0,128,0.06)',
          border: '1px solid rgba(0,0,128,0.15)',
          borderLeft: '3px solid #000080',
          padding: '12px 14px',
          marginBottom: '16px',
          fontStyle: 'italic',
        }}>
          <p style={{ fontSize: '13px', color: '#111', marginBottom: '6px' }}>"{content.quote}"</p>
          <p style={{ fontSize: '11px', color: '#555' }}>— {content.quoteBy}</p>
        </div>

        {/* Suggestions */}
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000080', fontFamily: '"Press Start 2P", monospace', marginBottom: '8px' }}>
          {content.emoji} {content.subheading}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {content.suggestions.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 10px',
                background: i % 2 === 0 ? 'rgba(255,255,255,0.5)' : 'transparent',
                border: '1px solid rgba(128,128,128,0.2)',
                fontSize: '12px', color: '#222',
                cursor: 'default',
              }}
            >
              <span style={{ fontSize: '18px' }}>{s.icon}</span>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
