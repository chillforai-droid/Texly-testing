/**
 * src/utils/browserCompat.ts
 *
 * Browser detection and capability checking utilities.
 * Used to:
 *  1. Detect Samsung TV / Tizen browsers
 *  2. Detect low-end devices (RAM, CPU cores)
 *  3. Safely check for browser API support before using it
 *  4. Reduce animation / feature load on weak devices
 *
 * FIXES applied:
 *  - isLowEndDevice: no longer flags phones with < 4 cores as "low-end".
 *    Most mid-range Android phones report 4–8 cores but budget ones report 2–4,
 *    causing them to be treated like Samsung TVs (AI panel never loads, etc.).
 *    Now only flags devices with BOTH < 2 GB RAM AND < 2 cores, or Smart TVs.
 */

// ─── Safe globals ─────────────────────────────────────────────────────────────

const isBrowser = typeof window !== 'undefined';
const nav = isBrowser ? window.navigator : null;
const ua = nav?.userAgent ?? '';

// ─── Device / browser detection ───────────────────────────────────────────────

/** True when running inside a Samsung Smart TV Tizen browser */
export const isSamsungTV = (): boolean => {
  return /Tizen/i.test(ua) || /SmartTV/i.test(ua) || /SMART-TV/i.test(ua);
};

/** True for any Smart TV browser (Samsung, LG webOS, Android TV) */
export const isSmartTV = (): boolean => {
  return (
    isSamsungTV() ||
    /WebOS/i.test(ua) ||
    /CrKey/i.test(ua) ||       // Chromecast
    /TV Safari/i.test(ua) ||
    /HbbTV/i.test(ua)
  );
};

/** True on old Chromium (< 70) or old Samsung Internet (< 8) */
export const isOldBrowser = (): boolean => {
  const chromeMatch = ua.match(/Chrome\/(\d+)/);
  if (chromeMatch) {
    const version = parseInt(chromeMatch[1], 10);
    return version < 70;
  }
  const samsungMatch = ua.match(/SamsungBrowser\/(\d+)/);
  if (samsungMatch) {
    const version = parseInt(samsungMatch[1], 10);
    return version < 8;
  }
  return false;
};

/**
 * Approximate "low-end device" detection.
 *
 * FIX: Previously flagged any phone with < 4 CPU cores as low-end,
 * which wrongly included most budget/mid-range Android phones (2–4 cores).
 * This caused those devices to be treated like Samsung TVs — suppressing
 * animations AND skipping the DeferredTexlyAI mount entirely.
 *
 * New logic: only flag as low-end if BOTH RAM < 1 GB AND cores < 2,
 * or if it's actually a Smart TV UA.  A phone with 2 cores but normal RAM
 * is not low-end for our purposes.
 */
export const isLowEndDevice = (): boolean => {
  if (!isBrowser) return false;
  // TVs are always considered low-end for animation purposes
  if (isSmartTV()) return true;
  // Require BOTH very low RAM AND very few cores to flag as low-end.
  // This avoids false-positives on budget phones.
  const memory = (nav as any)?.deviceMemory as number | undefined;
  const cores = nav?.hardwareConcurrency as number | undefined;
  const hasVeryLowRAM = memory !== undefined && memory < 1;
  const hasVeryFewCores = cores !== undefined && cores < 2;
  return hasVeryLowRAM && hasVeryFewCores;
};

/** True if the browser / OS has requested reduced motion */
export const prefersReducedMotion = (): boolean => {
  if (!isBrowser) return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) {
    return false;
  }
};

/**
 * Returns true when animations should be suppressed.
 * Covers: reduced-motion OS setting, Samsung TVs, confirmed low-end devices.
 */
export const shouldReduceAnimations = (): boolean => {
  return prefersReducedMotion() || isSmartTV() || isLowEndDevice();
};

// ─── Feature support checks ───────────────────────────────────────────────────

export const supportsIntersectionObserver = (): boolean => {
  return isBrowser && 'IntersectionObserver' in window;
};

export const supportsResizeObserver = (): boolean => {
  return isBrowser && 'ResizeObserver' in window;
};

export const supportsWebP = (): boolean => {
  if (!isBrowser) return false;
  try {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch (_) {
    return false;
  }
};

export const supportsES2020 = (): boolean => {
  try {
    // Optional chaining and nullish coalescing are ES2020
    // eslint-disable-next-line no-new-func
    new Function('return null?.x ?? true')();
    return true;
  } catch (_) {
    return false;
  }
};

export const supportsCSSGrid = (): boolean => {
  if (!isBrowser) return true;
  return CSS?.supports?.('display', 'grid') ?? false;
};

// ─── Safe wrappers for browser APIs ───────────────────────────────────────────

/** Safe localStorage wrapper – Smart TVs sometimes block it */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return isBrowser ? localStorage.getItem(key) : null;
    } catch (_) {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (isBrowser) localStorage.setItem(key, value);
    } catch (_) { /* noop */ }
  },
  removeItem: (key: string): void => {
    try {
      if (isBrowser) localStorage.removeItem(key);
    } catch (_) { /* noop */ }
  },
};

/** Safe sessionStorage wrapper */
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      return isBrowser ? sessionStorage.getItem(key) : null;
    } catch (_) {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (isBrowser) sessionStorage.setItem(key, value);
    } catch (_) { /* noop */ }
  },
};

/** Safe requestAnimationFrame – falls back to setTimeout on old browsers */
export const safeRAF = (cb: () => void): number => {
  if (isBrowser && window.requestAnimationFrame) {
    return window.requestAnimationFrame(cb);
  }
  return window.setTimeout(cb, 16) as unknown as number;
};

// ─── Viewport helpers (TV-safe) ───────────────────────────────────────────────

/**
 * Returns viewport height that works on Samsung TV.
 * TVs report 100vh incorrectly in some Tizen versions.
 */
export const getViewportHeight = (): number => {
  if (!isBrowser) return 768;
  if (window.visualViewport) {
    return window.visualViewport.height;
  }
  return window.innerHeight || document.documentElement.clientHeight || 768;
};

export const getViewportWidth = (): number => {
  if (!isBrowser) return 1280;
  if (window.visualViewport) {
    return window.visualViewport.width;
  }
  return window.innerWidth || document.documentElement.clientWidth || 1280;
};

// ─── Framer Motion config helper ──────────────────────────────────────────────

/**
 * Returns framer-motion transition props that are safe for the current device.
 * Pass these into `transition` on <motion.div> to avoid janky animations on TVs.
 */
export const safeMotionTransition = (options?: {
  duration?: number;
  ease?: string;
}) => {
  if (shouldReduceAnimations()) {
    return { duration: 0, ease: 'linear' };
  }
  return {
    duration: options?.duration ?? 0.3,
    ease: options?.ease ?? 'easeOut',
  };
};

// ─── Browser compatibility report (useful for debugging) ─────────────────────

export const getBrowserReport = () => ({
  userAgent: ua.slice(0, 120),
  isSamsungTV: isSamsungTV(),
  isSmartTV: isSmartTV(),
  isOldBrowser: isOldBrowser(),
  isLowEndDevice: isLowEndDevice(),
  shouldReduceAnimations: shouldReduceAnimations(),
  supportsIntersectionObserver: supportsIntersectionObserver(),
  supportsWebP: supportsWebP(),
  supportsES2020: supportsES2020(),
  supportsCSSGrid: supportsCSSGrid(),
  viewportWidth: getViewportWidth(),
  viewportHeight: getViewportHeight(),
});
