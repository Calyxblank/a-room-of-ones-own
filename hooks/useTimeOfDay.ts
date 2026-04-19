'use client';
import { useState, useEffect } from 'react';
import type { TimeOfDay, TimeTheme } from '../types';

const themes: Record<TimeOfDay, TimeTheme> = {
  morning: {
    wallColor: '#f5e6c8',
    floorColor: '#c4956a',
    skyTop: '#87ceeb',
    skyBottom: '#ffd89b',
    overlayColor: 'rgba(255, 200, 100, 0.12)',
    ambientLight: 'rgba(255, 220, 150, 0.2)',
    label: 'Morning',
    icon: '🌅',
  },
  afternoon: {
    wallColor: '#e8d5b7',
    floorColor: '#a0785a',
    skyTop: '#4fc3f7',
    skyBottom: '#b3e5fc',
    overlayColor: 'rgba(255, 255, 255, 0.05)',
    ambientLight: 'rgba(255, 255, 200, 0.1)',
    label: 'Afternoon',
    icon: '☀️',
  },
  evening: {
    wallColor: '#b07d5e',
    floorColor: '#7a4a2a',
    skyTop: '#c0392b',
    skyBottom: '#e67e22',
    overlayColor: 'rgba(255, 100, 50, 0.18)',
    ambientLight: 'rgba(200, 80, 20, 0.15)',
    label: 'Evening',
    icon: '🌇',
  },
  night: {
    wallColor: '#1e1e2e',
    floorColor: '#12121f',
    skyTop: '#0d0d1a',
    skyBottom: '#1a1a3e',
    overlayColor: 'rgba(10, 10, 60, 0.5)',
    ambientLight: 'rgba(30, 50, 120, 0.3)',
    label: 'Night',
    icon: '🌙',
  },
};

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
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
