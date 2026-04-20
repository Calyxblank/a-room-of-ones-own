'use client';
import { useState, useEffect } from 'react';
import type { TimeOfDay, TimeTheme } from '../types';

const themes: Record<TimeOfDay, TimeTheme> = {
  // 5–7 AM and 5–7 PM — Dawn Light: warm peach-gold, transitional
  dawn: {
    wallColor: '#f5d4a8',
    floorColor: '#b8895a',
    skyTop: '#e8956d',
    skyBottom: '#ffd4a0',
    overlayColor: 'rgba(220, 120, 40, 0.13)',
    ambientLight: 'rgba(240, 160, 80, 0.22)',
    label: 'Dawn',
    icon: '🌄',
  },
  // 7 AM–noon — Sage Green: calm, fresh, verdant
  morning: {
    wallColor: '#c8d5b9',
    floorColor: '#8a9e7a',
    skyTop: '#9dc8b0',
    skyBottom: '#d4ecd4',
    overlayColor: 'rgba(100, 150, 90, 0.08)',
    ambientLight: 'rgba(140, 190, 130, 0.18)',
    label: 'Morning',
    icon: '🌿',
  },
  // Noon–5 PM — Blush Pink: soft, warm, focused
  afternoon: {
    wallColor: '#e8c4c8',
    floorColor: '#c48a8a',
    skyTop: '#c9a8c8',
    skyBottom: '#f5d4dc',
    overlayColor: 'rgba(210, 130, 140, 0.10)',
    ambientLight: 'rgba(240, 170, 180, 0.15)',
    label: 'Afternoon',
    icon: '🌸',
  },
  // 7 PM–5 AM — Midnight Amber: deep dark warmth, amber glow
  night: {
    wallColor: '#1a0e00',
    floorColor: '#0e0800',
    skyTop: '#100900',
    skyBottom: '#1e1200',
    overlayColor: 'rgba(70, 40, 0, 0.55)',
    ambientLight: 'rgba(110, 68, 0, 0.28)',
    label: 'Night',
    icon: '🌑',
  },
};

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour === 5 || hour === 6)  return 'dawn';
  if (hour >= 7 && hour < 12)   return 'morning';
  if (hour >= 12 && hour < 17)  return 'afternoon';
  if (hour === 17 || hour === 18) return 'dawn';
  return 'night'; // 19–4
}

export function useTimeOfDay() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('afternoon');
  const [theme, setTheme] = useState<TimeTheme>(themes.afternoon);
  const [currentHour, setCurrentHour] = useState(12);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hour = now.getHours();
      const tod = getTimeOfDay(hour);
      setCurrentHour(hour);
      setTimeOfDay(tod);
      setTheme(themes[tod]);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return { timeOfDay, theme, currentHour };
}
