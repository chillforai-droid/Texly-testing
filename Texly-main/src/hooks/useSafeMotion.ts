/**
 * src/hooks/useSafeMotion.ts
 *
 * Drop-in replacement helpers for framer-motion that:
 *  - Instantly complete animations on Samsung TVs / low-end devices
 *  - Fall back gracefully when framer-motion fails to load
 *  - Prevent memory leaks from cancelled animations on slow CPUs
 *
 * Usage:
 *   import { useSafeMotionProps, SafeMotionDiv } from '../hooks/useSafeMotion';
 *
 *   // Option A – get safe props to spread onto <motion.div>
 *   const motionProps = useSafeMotionProps({ initial: ... animate: ... });
 *   <motion.div {...motionProps} />
 *
 *   // Option B – use SafeMotionDiv which handles everything
 *   <SafeMotionDiv animate={{ opacity: 1 }}>...</SafeMotionDiv>
 */

import React, { useEffect, useState, useRef, CSSProperties, ReactNode } from 'react';
import { shouldReduceAnimations } from '../utils/browserCompat';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MotionVariant {
  opacity?: number;
  y?: number;
  x?: number;
  scale?: number;
  [key: string]: any;
}

interface SafeMotionProps {
  initial?: MotionVariant | false;
  animate?: MotionVariant;
  exit?: MotionVariant;
  transition?: Record<string, any>;
  whileHover?: MotionVariant;
  whileTap?: MotionVariant;
  [key: string]: any;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns motion props that are either:
 *  - The originals (modern browser, enough RAM)
 *  - Stripped to a static state (TV / reduced-motion / low-end)
 */
export function useSafeMotionProps(props: SafeMotionProps): SafeMotionProps {
  const [reduceMotion] = useState(() => shouldReduceAnimations());

  if (!reduceMotion) return props;

  // On TVs: skip animation, show final state immediately
  const { initial, animate, exit, transition, whileHover, whileTap, ...rest } =
    props;

  return {
    ...rest,
    // Apply the final animated state as the initial static state
    style: {
      ...(rest.style ?? {}),
      opacity: animate?.opacity ?? 1,
      transform: 'none',
    },
    // Remove all animation-related props
    initial: false,
    animate: undefined,
    exit: undefined,
    transition: { duration: 0 },
    whileHover: undefined,
    whileTap: undefined,
  };
}

// ─── SafeMotionDiv ────────────────────────────────────────────────────────────

interface SafeMotionDivProps extends SafeMotionProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  role?: string;
  'aria-label'?: string;
}

/**
 * A wrapper that renders a <motion.div> on capable devices and a plain <div>
 * on Samsung TVs / low-end devices. Lazy-loads framer-motion so it doesn't
 * block the initial bundle.
 */
export function SafeMotionDiv({
  children,
  className,
  style,
  initial,
  animate,
  exit,
  transition,
  whileHover,
  whileTap,
  onClick,
  ...rest
}: SafeMotionDivProps) {
  const [MotionDiv, setMotionDiv] = useState<any>(null);
  const reduceMotion = shouldReduceAnimations();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!reduceMotion) {
      import('framer-motion')
        .then((mod) => {
          if (mounted.current) setMotionDiv(() => mod.motion.div);
        })
        .catch(() => {
          // framer-motion failed to load – stay on plain div
        });
    }
    return () => { mounted.current = false; };
  }, [reduceMotion]);

  // Plain <div> while framer-motion loads or on TVs
  if (!MotionDiv || reduceMotion) {
    // Apply the final animated state as a static style
    const finalStyle: CSSProperties = {
      opacity: typeof animate?.opacity === 'number' ? animate.opacity : 1,
      ...style,
    };
    return (
      <div className={className} style={finalStyle} onClick={onClick} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <MotionDiv
      className={className}
      style={style}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      whileHover={whileHover}
      whileTap={whileTap}
      onClick={onClick}
      {...rest}
    >
      {children}
    </MotionDiv>
  );
}

// ─── Preset animation variants ─────────────────────────────────────────────────

/** Fade in from below – common card entrance */
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
};

/** Simple fade in */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 },
};

/** Scale in from centre */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.25, ease: 'easeOut' },
};
