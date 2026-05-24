/**
 * useDesktopPerf.ts
 * Desktop / large-screen performance utilities:
 * - Detects large screens, high-DPI displays, powerful hardware
 * - Returns flags to enable richer desktop experiences without wasted work on mobile
 * - Mirrors the API of useMobilePerf so components can use both symmetrically
 */

import { useState, useEffect } from 'react';

export interface DesktopPerfFlags {
  /** True when viewport ≥ 1024px (lg breakpoint) */
  isDesktop: boolean;
  /** True when viewport ≥ 1280px (xl breakpoint) */
  isLargeScreen: boolean;
  /** True when viewport ≥ 1920px (2xl / TV breakpoint) */
  isXLScreen: boolean;
  /** True when devicePixelRatio ≥ 2 (Retina / HiDPI) */
  isHiDPI: boolean;
  /** True when the device likely has high performance (≥ 8 cores or ≥ 8 GB RAM) */
  isHighEndDevice: boolean;
  /** True when network is fast enough for prefetching (4G / wifi) */
  isFastNetwork: boolean;
  /**
   * How many tool cards to show initially on the home grid.
   * desktop: 18 | large: 24 | mobile: 6 (mirror of Home.tsx logic)
   */
  initialToolCount: number;
  /**
   * Recommended column count string for Tailwind-style decisions.
   * 'lg' | 'xl' | '2xl'
   */
  gridCols: 'lg' | 'xl' | '2xl';
}

// ─── Singleton cache (same pattern as useMobilePerf) ─────────────────────────
let cachedDesktopFlags: DesktopPerfFlags | null = null;

function detectDesktopFlags(): DesktopPerfFlags {
  if (typeof window === 'undefined') {
    return {
      isDesktop: false,
      isLargeScreen: false,
      isXLScreen: false,
      isHiDPI: false,
      isHighEndDevice: false,
      isFastNetwork: false,
      initialToolCount: 12,
      gridCols: 'lg',
    };
  }

  const nav = navigator as any;
  const w = window.innerWidth;

  const isDesktop = w >= 1024;
  const isLargeScreen = w >= 1280;
  const isXLScreen = w >= 1920;

  const isHiDPI = window.devicePixelRatio >= 2;

  // High-end: ≥ 8 cores OR ≥ 8 GB RAM
  const cores: number | undefined = nav.hardwareConcurrency;
  const memory: number | undefined = nav.deviceMemory;
  const isHighEndDevice =
    (cores !== undefined && cores >= 8) ||
    (memory !== undefined && memory >= 8);

  // Fast network: 4g / wifi (saveData=false)
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  const isFastNetwork = conn
    ? !conn.saveData && ['4g', '3g'].includes(conn.effectiveType ?? '4g')
    : true; // assume fast when API not available (desktop usually is)

  // Initial tool count scales with screen size
  const initialToolCount = isXLScreen ? 24 : isLargeScreen ? 18 : isDesktop ? 12 : 6;

  // Grid column recommendation
  const gridCols: DesktopPerfFlags['gridCols'] = isXLScreen
    ? '2xl'
    : isLargeScreen
    ? 'xl'
    : 'lg';

  return {
    isDesktop,
    isLargeScreen,
    isXLScreen,
    isHiDPI,
    isHighEndDevice,
    isFastNetwork,
    initialToolCount,
    gridCols,
  };
}

export function useDesktopPerf(): DesktopPerfFlags {
  const [flags, setFlags] = useState<DesktopPerfFlags>(() => {
    if (cachedDesktopFlags) return cachedDesktopFlags;
    cachedDesktopFlags = detectDesktopFlags();
    return cachedDesktopFlags;
  });

  useEffect(() => {
    const update = () => {
      cachedDesktopFlags = detectDesktopFlags();
      setFlags({ ...cachedDesktopFlags });
    };

    // Re-detect on resize (window resize, split-screen, orientation on tablet)
    window.addEventListener('resize', update, { passive: true });

    // Re-detect on network change
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
 * Lightweight synchronous check (no React) for use outside components.
 * E.g. in route-level prefetch logic.
 */
export function isDesktopDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
}

/**
 * Returns true when it's safe to prefetch the next likely route chunk.
 * Prefetch only on desktop + fast network to avoid wasting mobile data.
 */
export function shouldPrefetch(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as any;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  const isSlowOrSaveData = conn
    ? conn.saveData || ['slow-2g', '2g'].includes(conn.effectiveType ?? '')
    : false;
  return window.innerWidth >= 1024 && !isSlowOrSaveData;
}
