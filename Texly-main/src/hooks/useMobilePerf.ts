/**
 * useMobilePerf.ts
 * Mobile performance utilities:
 * - Detects low-end devices and slow networks
 * - Returns flags to conditionally disable heavy animations/features
 */

import { useState, useEffect } from 'react';

interface MobilePerfFlags {
  isMobile: boolean;
  isSlowNetwork: boolean;
  isLowEndDevice: boolean;
  shouldReduceMotion: boolean;
  isTouchDevice: boolean;
}

// Singleton so multiple components don't each add event listeners
let cachedFlags: MobilePerfFlags | null = null;

function detectFlags(): MobilePerfFlags {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isSlowNetwork: false,
      isLowEndDevice: false,
      shouldReduceMotion: false,
      isTouchDevice: false,
    };
  }

  const nav = navigator as any;

  const isMobile = window.innerWidth < 768 ||
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Slow network: 2G / slow-2g / saveData
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  const isSlowNetwork = conn
    ? conn.saveData || ['slow-2g', '2g'].includes(conn.effectiveType)
    : false;

  // Low-end device: less than 4 logical CPU cores or less than 4GB RAM
  const isLowEndDevice =
    (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency < 4) ||
    (nav.deviceMemory !== undefined && nav.deviceMemory < 4);

  const shouldReduceMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    isLowEndDevice ||
    isSlowNetwork;

  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return { isMobile, isSlowNetwork, isLowEndDevice, shouldReduceMotion, isTouchDevice };
}

export function useMobilePerf(): MobilePerfFlags {
  const [flags, setFlags] = useState<MobilePerfFlags>(() => {
    if (cachedFlags) return cachedFlags;
    cachedFlags = detectFlags();
    return cachedFlags;
  });

  useEffect(() => {
    const update = () => {
      cachedFlags = detectFlags();
      setFlags({ ...cachedFlags });
    };

    // Re-check on resize (orientation change, desktop resize to mobile)
    window.addEventListener('resize', update, { passive: true });

    // Re-check on network change
    const conn = (navigator as any).connection;
    if (conn) conn.addEventListener('change', update);

    return () => {
      window.removeEventListener('resize', update);
      if (conn) conn.removeEventListener('change', update);
    };
  }, []);

  return flags;
}

/**
 * Lightweight check (no React) for use outside components
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
