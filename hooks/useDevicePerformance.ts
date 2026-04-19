'use client';
import { useState, useEffect } from 'react';

export type PerformanceTier = 'low' | 'medium' | 'high';

export function useDevicePerformance(): PerformanceTier {
  const [tier, setTier] = useState<PerformanceTier>('high');

  useEffect(() => {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { effectiveType?: string };
    };
    let score = 3;

    if (nav.deviceMemory !== undefined && nav.deviceMemory < 2) score--;
    if (nav.connection?.effectiveType === 'slow-2g' || nav.connection?.effectiveType === '2g') score -= 2;
    if (nav.connection?.effectiveType === '3g') score--;

    const cores = navigator.hardwareConcurrency;
    if (cores && cores <= 2) score--;

    const width = window.innerWidth;
    if (width < 480) score--;

    if (score <= 1) setTier('low');
    else if (score <= 2) setTier('medium');
    else setTier('high');
  }, []);

  return tier;
}
